import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/database.types';

// Typed reads for the signed-in student. Server only (uses the cookie client; RLS applies).

export type Student = Tables<'students'>;

export interface TrackerCounts {
  sent: number;
  replied: number;
  noReply: number;
}

export interface ResumeProfessor {
  id: string;
  name_en: string;
  university_name: string | null;
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  return typeof sub === 'string' ? sub : null;
}

/** The signed-in student's row, or null when signed out. Throws on a database error. */
export async function getCurrentStudent(): Promise<Student | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(`getCurrentStudent: ${error.message}`);
  return data;
}

const REPLIED_STATUSES = new Set(['replied_positive', 'replied_negative', 'replied_conditional']);

export async function getTrackerCounts(studentId: string): Promise<TrackerCounts> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('outreach')
    .select('status')
    .eq('student_id', studentId);
  if (error) throw new Error(`getTrackerCounts: ${error.message}`);

  return (data ?? []).reduce<TrackerCounts>(
    (acc, row) => ({
      sent: acc.sent + 1,
      replied: acc.replied + (REPLIED_STATUSES.has(row.status) ? 1 : 0),
      noReply: acc.noReply + (row.status === 'no_reply' ? 1 : 0),
    }),
    { sent: 0, replied: 0, noReply: 0 },
  );
}

export async function getResumeProfessor(
  professorId: string | null,
): Promise<ResumeProfessor | null> {
  if (!professorId) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('professors_public')
    .select('id, name_en, university_name')
    .eq('id', professorId)
    .maybeSingle();
  if (error) throw new Error(`getResumeProfessor: ${error.message}`);
  if (!data?.id || !data.name_en) return null;
  return { id: data.id, name_en: data.name_en, university_name: data.university_name };
}
