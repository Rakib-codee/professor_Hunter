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
