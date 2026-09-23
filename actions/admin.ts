'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { professorEditSchema } from '@/lib/admin/professor-schema';
import { getCurrentStudent } from '@/lib/data/students';
import { echoValues, fieldErrorsFrom, type FormState } from '@/lib/forms';
import { parseCsv } from '@/lib/import/csv';
import { importRows, type ImportSummary } from '@/lib/import/import';
import { createSupabaseImportDb } from '@/lib/import/supabase-db';
import { PROFESSORS_TAG } from '@/lib/data/professors';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// Admin mutations. RLS (professors_admin, reports_admin_update) is the real gate; the role
// check here only gives a clean message instead of a policy error.

export interface AdminActionResult {
  ok: boolean;
  error?: string;
}

const PROFESSOR_STATUSES = ['active', 'bounced', 'moved', 'retired'] as const;
const NOT_ADMIN = 'Admin only.';
const GENERIC = 'Could not save. Please try again.';

async function requireAdmin(): Promise<boolean> {
  const student = await getCurrentStudent();
  return student?.role === 'admin';
}

export async function resolveReport(id: string): Promise<AdminActionResult> {
  if (!z.uuid().safeParse(id).success) return { ok: false, error: GENERIC };
  if (!(await requireAdmin())) return { ok: false, error: NOT_ADMIN };
  const supabase = await createClient();
  const { error } = await supabase.from('reports').update({ status: 'resolved' }).eq('id', id);
  if (error) {
    console.error(`[admin.resolveReport] code=${error.code}`);
    return { ok: false, error: GENERIC };
  }
  revalidatePath('/admin');
  revalidatePath('/admin/reports');
  return { ok: true };
}

const statusSchema = z.object({ professorId: z.uuid(), status: z.enum(PROFESSOR_STATUSES) });

export async function setProfessorStatus(
  input: z.input<typeof statusSchema>,
): Promise<AdminActionResult> {
  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Choose a valid status.' };
  if (!(await requireAdmin())) return { ok: false, error: NOT_ADMIN };
  const supabase = await createClient();
  const { error } = await supabase
    .from('professors')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.professorId);
  if (error) {
    console.error(`[admin.setProfessorStatus] code=${error.code}`);
    return { ok: false, error: GENERIC };
  }
  revalidateTag(PROFESSORS_TAG, 'max');
  revalidatePath('/admin/reports');
  revalidatePath(`/professor/${parsed.data.professorId}`);
  return { ok: true };
}

// ---------- CSV import (same pipeline as scripts/import-csv.ts) ----------

export interface ImportFormState extends FormState {
  summary?: ImportSummary;
}

const CSV_MAX_BYTES = 2 * 1024 * 1024;
const TAGS_FILE = 'research_tags.json';

function loadAllowedTags(): string[] {
  const parsed: unknown = JSON.parse(readFileSync(TAGS_FILE, 'utf8'));
  if (typeof parsed !== 'object' || parsed === null) return [];
  return Object.values(parsed as Record<string, unknown>).flatMap((list) =>
    Array.isArray(list) ? list.filter((tag): tag is string => typeof tag === 'string') : [],
  );
}

export async function importCsv(
  prev: ImportFormState,
  formData: FormData,
): Promise<ImportFormState> {
  const attempt = prev.attempt + 1;
  if (!(await requireAdmin())) return { ok: false, error: NOT_ADMIN, attempt };
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, error: 'Choose a CSV file.', attempt };
  if (file.size > CSV_MAX_BYTES) return { ok: false, error: 'CSV must be under 2 MB.', attempt };

  let rows;
  try {
    rows = parseCsv(await file.text());
  } catch (error) {
    return {
      ok: false,
      error: `Could not parse CSV: ${error instanceof Error ? error.message : 'unknown error'}`,
      attempt,
    };
  }

  try {
    // Secret-key client: the import writes professors/universities directly, like the CLI.
    const summary = await importRows(
      rows,
      createSupabaseImportDb(createAdminClient()),
      loadAllowedTags(),
    );
    revalidateTag(PROFESSORS_TAG, 'max');
    revalidatePath('/find');
    return { ok: true, summary, attempt };
  } catch (error) {
    console.error(`[admin.importCsv] ${error instanceof Error ? error.message : String(error)}`);
    return {
      ok: false,
      error: 'Import failed part-way. Check the professor list and try again.',
      attempt,
    };
  }
}

// ---------- professor edit ----------

const PROFESSOR_TEXT_FIELDS = [
  'name_en',
  'name_cn',
  'title',
  'school',
  'field',
  'research_area',
  'email',
  'accepts_intl',
  'source_url',
  'last_verified',
  'notes',
  'gender',
  'status',
] as const;

export async function updateProfessor(
  professorId: string,
  prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const attempt = prev.attempt + 1;
  const values = echoValues(formData, PROFESSOR_TEXT_FIELDS);
  if (!z.uuid().safeParse(professorId).success) return { ok: false, error: GENERIC, attempt };
  if (!(await requireAdmin())) return { ok: false, error: NOT_ADMIN, values, attempt };

  const parsed = professorEditSchema.safeParse({
    ...values,
    research_tags: formData.getAll('research_tags'),
  });
  if (!parsed.success)
    return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error), values, attempt };

  const supabase = await createClient();
  const { error } = await supabase.from('professors').update(parsed.data).eq('id', professorId);
  if (error) {
    console.error(`[admin.updateProfessor] code=${error.code}`);
    const message =
      error.code === '23505'
        ? 'Another professor at this university already has that email.'
        : GENERIC;
    return { ok: false, error: message, values, attempt };
  }
  revalidateTag(PROFESSORS_TAG, 'max');
  revalidatePath(`/professor/${professorId}`);
  revalidatePath(`/admin/professors/${professorId}`);
  revalidatePath('/find');
  return { ok: true, message: 'Saved.', attempt };
}
