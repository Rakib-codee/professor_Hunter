import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/database.types';

export type OutreachRow = Tables<'outreach'>;

export interface OutreachItem extends OutreachRow {
  professor: {
    id: string;
    name_en: string;
    name_cn: string | null;
    university_name: string | null;
  } | null;
}

/** The student's outreach rows, newest first, with the professor's public name. */
export async function getOutreach(studentId: string): Promise<OutreachItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('outreach')
    .select('*')
    .eq('student_id', studentId)
    .order('sent_on', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error(`getOutreach: ${error.message}`);
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const ids = [...new Set(rows.map((row) => row.professor_id))];
  const { data: professors, error: profError } = await supabase
    .from('professors_public')
    .select('id, name_en, name_cn, university_name')
    .in('id', ids);
  if (profError) throw new Error(`getOutreach professors: ${profError.message}`);
  const byId = new Map(
    (professors ?? []).flatMap((p) =>
      p.id && p.name_en
        ? [
            [
              p.id,
              {
                id: p.id,
                name_en: p.name_en,
                name_cn: p.name_cn,
                university_name: p.university_name,
              },
            ] as const,
          ]
        : [],
    ),
  );
  return rows.map((row) => ({ ...row, professor: byId.get(row.professor_id) ?? null }));
}

export interface DueFollowUp {
  id: string;
  professor_id: string;
  professor_name: string | null;
  follow_up_on: string;
  sent_on: string;
}

const DUE_LIMIT = 5;

/** Emails still waiting whose follow-up date has arrived, oldest first. */
export async function getDueFollowUps(
  studentId: string,
  today = new Date().toISOString().slice(0, 10),
): Promise<DueFollowUp[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('outreach')
    .select('id, professor_id, follow_up_on, sent_on')
    .eq('student_id', studentId)
    .eq('status', 'sent')
    .lte('follow_up_on', today)
    .order('follow_up_on', { ascending: true })
    .limit(DUE_LIMIT);
  if (error) throw new Error(`getDueFollowUps: ${error.message}`);
  const rows = (data ?? []).filter(
    (row): row is typeof row & { follow_up_on: string } => row.follow_up_on !== null,
  );
  if (rows.length === 0) return [];
  const { data: professors } = await supabase
    .from('professors_public')
    .select('id, name_en')
    .in('id', [...new Set(rows.map((r) => r.professor_id))]);
  const nameById = new Map(
    (professors ?? []).flatMap((p) => (p.id ? [[p.id, p.name_en] as const] : [])),
  );
  return rows.map((row) => ({ ...row, professor_name: nameById.get(row.professor_id) ?? null }));
}
