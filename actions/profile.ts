'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { z } from 'zod';
import { getCurrentUserId } from '@/lib/data/students';
import { echoValues, fieldErrorsFrom, type FormState } from '@/lib/forms';
import { CV_BUCKET, cvPathFor, validateCvFile } from '@/lib/profile/cv';
import { academicStepSchema, basicStepSchema, researchStepSchema } from '@/lib/profile/schemas';
import { createClient } from '@/lib/supabase/server';
import type { TablesUpdate } from '@/lib/supabase/database.types';

// Profile server actions shared by onboarding and /profile. Each form posts a hidden
// `flow` field: "onboarding" advances to the next step (or the dashboard); "profile"
// stays on the page and reports "Saved".

export type ProfileFlow = 'onboarding' | 'profile';
export type OnboardingStep = 1 | 2 | 3;

const ONBOARDING_STEPS: readonly OnboardingStep[] = [1, 2, 3];
const SAVED_MESSAGE = 'Saved.';
const SAVE_FAILED = 'Could not save. Please try again.';

function flowFrom(formData: FormData): ProfileFlow {
  return formData.get('flow') === 'profile' ? 'profile' : 'onboarding';
}

function invalid(prev: FormState, error: z.ZodError, values: Record<string, string>): FormState {
  return { ok: false, fieldErrors: fieldErrorsFrom(error), values, attempt: prev.attempt + 1 };
}

function stepPath(step: OnboardingStep): string {
  return `/onboarding?step=${step}`;
}

async function saveStudent(patch: TablesUpdate<'students'>): Promise<string | null> {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login');

  const supabase = await createClient();
  const { error } = await supabase.from('students').update(patch).eq('id', userId);
  if (error) {
    // PostgREST/transport detail only; the row payload is never logged.
    console.error(`[profile.save] code=${error.code ?? 'none'} message=${error.message}`);
    return SAVE_FAILED;
  }
  return null;
}

/** After a successful save: continue onboarding, or stay on /profile with a message. */
function finish(prev: FormState, flow: ProfileFlow, next: OnboardingStep | 'done'): FormState {
  if (flow === 'onboarding') {
    redirect(next === 'done' ? '/dashboard' : stepPath(next));
  }
  // Server components re-render with the fresh row; the form remounts via its key.
  revalidatePath('/profile');
  revalidatePath('/dashboard');
  return { ok: true, message: SAVED_MESSAGE, attempt: prev.attempt + 1 };
}

export async function saveBasicStep(prev: FormState, formData: FormData): Promise<FormState> {
  const values = echoValues(formData, [
    'full_name',
    'nationality',
    'home_university',
    'major',
    'cgpa',
    'cgpa_scale',
    'graduation_year',
  ]);
  const parsed = basicStepSchema.safeParse(values);
  if (!parsed.success) return invalid(prev, parsed.error, values);

  const error = await saveStudent(parsed.data);
  if (error) return { ok: false, error, values, attempt: prev.attempt + 1 };
  return finish(prev, flowFrom(formData), 2);
}

export async function saveAcademicStep(prev: FormState, formData: FormData): Promise<FormState> {
  const values = echoValues(formData, ['degree_applying', 'intake_year', 'ielts', 'toefl', 'hsk']);
  const parsed = academicStepSchema.safeParse({
    ...values,
    achievements: formData.getAll('achievements'),
  });
  if (!parsed.success) return invalid(prev, parsed.error, values);

  const error = await saveStudent(parsed.data);
  if (error) return { ok: false, error, values, attempt: prev.attempt + 1 };
  return finish(prev, flowFrom(formData), 3);
}

export async function saveResearchStep(prev: FormState, formData: FormData): Promise<FormState> {
  const values = echoValues(formData, ['target_field', 'research_interests']);
  const parsed = researchStepSchema.safeParse({
    ...values,
    research_tags: formData.getAll('research_tags'),
  });
  if (!parsed.success) return invalid(prev, parsed.error, values);

  const flow = flowFrom(formData);
  const patch: TablesUpdate<'students'> =
    flow === 'onboarding'
      ? { ...parsed.data, onboarding_completed_at: new Date().toISOString() }
      : parsed.data;
  const error = await saveStudent(patch);
  if (error) return { ok: false, error, values, attempt: prev.attempt + 1 };
  return finish(prev, flow, 'done');
}

/** "Skip for now" on steps 2–3. Skipping step 3 completes onboarding without research data. */
export async function skipOnboardingStep(step: OnboardingStep): Promise<void> {
  if (!ONBOARDING_STEPS.includes(step) || step === 1) redirect(stepPath(1));

  if (step === 3) {
    const error = await saveStudent({ onboarding_completed_at: new Date().toISOString() });
    if (error) redirect(stepPath(3));
    redirect('/dashboard');
  }
  redirect(stepPath(3));
}

// ---------- CV (week 5) ----------

export async function uploadCv(prev: FormState, formData: FormData): Promise<FormState> {
  const attempt = prev.attempt + 1;
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login');
  const file = formData.get('cv');
  if (!(file instanceof File)) return { ok: false, error: 'Choose a PDF file.', attempt };
  const check = validateCvFile(file);
  if (!check.ok) return { ok: false, error: check.error, attempt };

  const supabase = await createClient();
  const path = cvPathFor(userId);
  const { error: uploadError } = await supabase.storage
    .from(CV_BUCKET)
    .upload(path, file, { upsert: true, contentType: 'application/pdf' });
  if (uploadError) {
    console.error(`[profile.uploadCv] ${uploadError.message}`);
    return { ok: false, error: 'Upload failed. Please try again.', attempt };
  }
  const error = await saveStudent({ cv_path: path });
  if (error) return { ok: false, error, attempt };
  revalidatePath('/profile');
  return { ok: true, message: 'CV uploaded.', attempt };
}

export async function removeCv(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login');
  const supabase = await createClient();
  const { error } = await supabase.storage.from(CV_BUCKET).remove([cvPathFor(userId)]);
  if (error) console.error(`[profile.removeCv] ${error.message}`);
  await saveStudent({ cv_path: null });
  revalidatePath('/profile');
}

/** Short-lived download link for the student's own CV; null when none. */
export async function getCvSignedUrl(): Promise<string | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage.from(CV_BUCKET).createSignedUrl(cvPathFor(userId), 60);
  return data?.signedUrl ?? null;
}
