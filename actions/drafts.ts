'use server';

import { z } from 'zod';
import { FOLLOW_UP_DAYS } from '@/lib/constants';
import { getCurrentUserId } from '@/lib/data/students';
import { createClient } from '@/lib/supabase/server';

// "I sent this": persists the student's edits (so the tracker shows what was really sent)
// and creates the outreach row with a default follow-up date (PLAN.md §6).

export interface MarkSentResult {
  ok: boolean;
  outreachId?: string;
  error?: string;
}

const NOT_SIGNED_IN = 'Please log in first.';
const GENERIC = 'Could not save. Please try again.';
const SUBJECT_MAX = 200;
const BODY_MAX = 5000;

const markSentSchema = z.object({
  draftId: z.uuid(),
  professorId: z.uuid(),
  subject: z.string().trim().min(1).max(SUBJECT_MAX),
  body: z.string().trim().min(1).max(BODY_MAX),
});

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function markSent(input: z.input<typeof markSentSchema>): Promise<MarkSentResult> {
  const parsed = markSentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Subject and body cannot be empty.' };
  const studentId = await getCurrentUserId();
  if (!studentId) return { ok: false, error: NOT_SIGNED_IN };

  const supabase = await createClient();
  const { draftId, professorId, subject, body } = parsed.data;

  const { error: draftError } = await supabase
    .from('drafts')
    .update({ subject, body })
    .eq('id', draftId)
    .eq('student_id', studentId);
  if (draftError) {
    console.error(`[drafts.markSent] draft update code=${draftError.code}`);
    return { ok: false, error: GENERIC };
  }

  const today = new Date();
  const followUp = new Date(today);
  followUp.setUTCDate(followUp.getUTCDate() + FOLLOW_UP_DAYS);
  const { data, error } = await supabase
    .from('outreach')
    .insert({
      student_id: studentId,
      professor_id: professorId,
      draft_id: draftId,
      sent_on: isoDate(today),
      follow_up_on: isoDate(followUp),
      status: 'sent',
    })
    .select('id')
    .single();
  if (error || !data) {
    console.error(`[drafts.markSent] outreach insert code=${error?.code ?? 'none'}`);
    return { ok: false, error: GENERIC };
  }
  return { ok: true, outreachId: data.id };
}
