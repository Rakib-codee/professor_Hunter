'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentUserId } from '@/lib/data/students';
import { createClient } from '@/lib/supabase/server';
import type { TablesUpdate } from '@/lib/supabase/database.types';
import { OUTREACH_STATUSES } from '@/lib/tracker/status';

// Tracker inline edits. RLS (outreach_own) already scopes rows; the student_id filter is
// belt and braces. Marking `bounced` also files a report via the SQL trigger.

export interface OutreachActionResult {
  ok: boolean;
  error?: string;
}

const NOT_SIGNED_IN = 'Please log in first.';
const GENERIC = 'Could not save. Please try again.';
const NOTES_MAX = 1000;
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date');

async function update(
  id: string,
  patch: TablesUpdate<'outreach'>,
  context: string,
): Promise<OutreachActionResult> {
  const studentId = await getCurrentUserId();
  if (!studentId) return { ok: false, error: NOT_SIGNED_IN };
  const supabase = await createClient();
  const { error } = await supabase
    .from('outreach')
    .update(patch)
    .eq('id', id)
    .eq('student_id', studentId);
  if (error) {
    console.error(`[outreach.${context}] code=${error.code}`);
    return { ok: false, error: GENERIC };
  }
  revalidatePath('/tracker');
  revalidatePath('/dashboard');
  return { ok: true };
}

const statusSchema = z.object({
  id: z.uuid(),
  status: z.enum(OUTREACH_STATUSES),
  replyOn: isoDate.optional(),
});

export async function updateOutreachStatus(
  input: z.input<typeof statusSchema>,
): Promise<OutreachActionResult> {
  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Choose a valid status.' };
  const replied = parsed.data.status.startsWith('replied');
  return update(
    parsed.data.id,
    {
      status: parsed.data.status,
      reply_on: replied ? (parsed.data.replyOn ?? new Date().toISOString().slice(0, 10)) : null,
    },
    'updateStatus',
  );
}

const notesSchema = z.object({ id: z.uuid(), notes: z.string().trim().max(NOTES_MAX) });

export async function updateOutreachNotes(
  input: z.input<typeof notesSchema>,
): Promise<OutreachActionResult> {
  const parsed = notesSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: `Notes must be under ${NOTES_MAX} characters.` };
  return update(parsed.data.id, { notes: parsed.data.notes || null }, 'updateNotes');
}

const followUpSchema = z.object({ id: z.uuid(), followUpOn: isoDate.nullable() });

export async function updateFollowUp(
  input: z.input<typeof followUpSchema>,
): Promise<OutreachActionResult> {
  const parsed = followUpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Use a valid date.' };
  return update(parsed.data.id, { follow_up_on: parsed.data.followUpOn }, 'updateFollowUp');
}

export async function deleteOutreach(id: string): Promise<OutreachActionResult> {
  if (!z.uuid().safeParse(id).success) return { ok: false, error: GENERIC };
  const studentId = await getCurrentUserId();
  if (!studentId) return { ok: false, error: NOT_SIGNED_IN };
  const supabase = await createClient();
  const { error } = await supabase
    .from('outreach')
    .delete()
    .eq('id', id)
    .eq('student_id', studentId);
  if (error) {
    console.error(`[outreach.delete] code=${error.code}`);
    return { ok: false, error: GENERIC };
  }
  revalidatePath('/tracker');
  revalidatePath('/dashboard');
  return { ok: true };
}
