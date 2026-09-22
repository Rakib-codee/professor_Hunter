'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentUserId } from '@/lib/data/students';
import { createClient } from '@/lib/supabase/server';
import type { Enums } from '@/lib/supabase/database.types';

// Professor-page mutations. All require a session; RLS scopes rows to the caller.

export interface ActionResult<T = undefined> {
  ok: boolean;
  data?: T;
  error?: string;
}

const NOT_SIGNED_IN = 'Please log in to do that.';
const GENERIC = 'Something went wrong. Please try again.';
const UUID = z.uuid();

const REPORT_TYPES = ['wrong_email', 'bounced', 'moved', 'not_accepting', 'other'] as const;
const REPORT_MESSAGE_MAX = 500;

export interface RevealResult {
  email: string | null;
  emailType: Enums<'email_type'>;
  used: number;
  limit: number;
}

// Postgres error codes raised by reveal_professor_email() in 0001_init.sql.
const REVEAL_ERRORS: Record<string, string> = {
  P0001: 'You have reached today’s reveal limit. It resets at midnight UTC.',
  P0002: 'This professor is no longer listed.',
  '42501': NOT_SIGNED_IN,
};

export async function revealEmail(professorId: string): Promise<ActionResult<RevealResult>> {
  if (!UUID.safeParse(professorId).success) return { ok: false, error: GENERIC };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('reveal_professor_email', {
    p_professor_id: professorId,
  });
  if (error) {
    console.error(`[professors.reveal] code=${error.code}`);
    return { ok: false, error: REVEAL_ERRORS[error.code] ?? GENERIC };
  }
  const row = data?.[0];
  if (!row) return { ok: false, error: GENERIC };
  return {
    ok: true,
    data: {
      email: row.out_email,
      emailType: row.out_email_type,
      used: row.reveals_used,
      limit: row.reveals_limit,
    },
  };
}

export async function toggleSaved(
  professorId: string,
  saved: boolean,
): Promise<ActionResult<{ saved: boolean }>> {
  if (!UUID.safeParse(professorId).success) return { ok: false, error: GENERIC };
  const studentId = await getCurrentUserId();
  if (!studentId) return { ok: false, error: NOT_SIGNED_IN };

  const supabase = await createClient();
  const { error } = saved
    ? await supabase.from('saved').upsert({ student_id: studentId, professor_id: professorId })
    : await supabase
        .from('saved')
        .delete()
        .eq('student_id', studentId)
        .eq('professor_id', professorId);
  if (error) {
    console.error(`[professors.toggleSaved] code=${error.code}`);
    return { ok: false, error: GENERIC };
  }
  revalidatePath('/saved');
  return { ok: true, data: { saved } };
}

/** Fire-and-forget from the professor page; failures are logged, never shown. */
export async function recordLastViewed(professorId: string): Promise<void> {
  if (!UUID.safeParse(professorId).success) return;
  const studentId = await getCurrentUserId();
  if (!studentId) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from('students')
    .update({ last_viewed_professor_id: professorId })
    .eq('id', studentId);
  if (error) console.error(`[professors.recordLastViewed] code=${error.code}`);
}

const reportSchema = z.object({
  professorId: UUID,
  type: z.enum(REPORT_TYPES),
  message: z.string().trim().max(REPORT_MESSAGE_MAX).optional(),
});

export async function submitReport(input: {
  professorId: string;
  type: string;
  message?: string;
}): Promise<ActionResult> {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Please choose a problem type.' };
  const studentId = await getCurrentUserId();
  if (!studentId) return { ok: false, error: NOT_SIGNED_IN };

  const supabase = await createClient();
  const { error } = await supabase.from('reports').insert({
    student_id: studentId,
    professor_id: parsed.data.professorId,
    type: parsed.data.type,
    message: parsed.data.message || null,
  });
  if (error) {
    console.error(`[professors.submitReport] code=${error.code}`);
    return { ok: false, error: GENERIC };
  }
  return { ok: true };
}
