import { parseAdminStats, type AdminStats } from '@/lib/admin/stats';
import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/database.types';

// Admin reads run with the admin's own JWT; RLS admin policies + admin_stats() enforce the role.

export type ReportRow = Tables<'reports'>;

export interface ReportItem extends ReportRow {
  professor: {
    id: string;
    name_en: string;
    university_name: string | null;
    status: string | null;
    has_email: boolean;
  } | null;
  reporter_name: string | null;
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_stats');
  if (error) throw new Error(`admin_stats: ${error.message}`);
  return parseAdminStats(data);
}

export async function getOpenReports(): Promise<ReportItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw new Error(`getOpenReports: ${error.message}`);
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const professorIds = [...new Set(rows.map((r) => r.professor_id))];
  const studentIds = [...new Set(rows.flatMap((r) => (r.student_id ? [r.student_id] : [])))];
  const [{ data: professors }, { data: students }] = await Promise.all([
    supabase
      .from('professors')
      .select('id, name_en, status, email, university_id')
      .in('id', professorIds),
    studentIds.length > 0
      ? supabase.from('students').select('id, full_name').in('id', studentIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
  ]);
  const universityIds = [...new Set((professors ?? []).map((p) => p.university_id))];
  const { data: universities } =
    universityIds.length > 0
      ? await supabase.from('universities').select('id, name_en').in('id', universityIds)
      : { data: [] as { id: string; name_en: string }[] };
  const uniById = new Map((universities ?? []).map((u) => [u.id, u.name_en] as const));
  const profById = new Map(
    (professors ?? []).map(
      (p) =>
        [
          p.id,
          {
            id: p.id,
            name_en: p.name_en,
            university_name: uniById.get(p.university_id) ?? null,
            status: p.status,
            has_email: p.email !== null,
          },
        ] as const,
    ),
  );
  const nameById = new Map((students ?? []).map((s) => [s.id, s.full_name] as const));

  return rows.map((row) => ({
    ...row,
    professor: profById.get(row.professor_id) ?? null,
    reporter_name: row.student_id ? (nameById.get(row.student_id) ?? null) : null,
  }));
}

export type ProfessorAdminRow = Tables<'professors'> & { university_name: string | null };

/** Full professor row (including email and notes) for the admin edit form. */
export async function getProfessorForAdmin(id: string): Promise<ProfessorAdminRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('professors').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`getProfessorForAdmin: ${error.message}`);
  if (!data) return null;
  const { data: university } = await supabase
    .from('universities')
    .select('name_en')
    .eq('id', data.university_id)
    .maybeSingle();
  return { ...data, university_name: university?.name_en ?? null };
}

export interface ProfessorSearchHit {
  id: string;
  name_en: string;
  name_cn: string | null;
  field: string;
  status: string;
  has_email: boolean;
}

const SEARCH_LIMIT = 50;

/** Simple admin lookup by English or Chinese name. */
export async function searchProfessorsForAdmin(query: string): Promise<ProfessorSearchHit[]> {
  const q = query.trim().replace(/[%_]/g, '');
  if (!q) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('professors')
    .select('id, name_en, name_cn, field, status, email')
    .or(`name_en.ilike.%${q}%,name_cn.ilike.%${q}%`)
    .order('name_en')
    .limit(SEARCH_LIMIT);
  if (error) throw new Error(`searchProfessorsForAdmin: ${error.message}`);
  return (data ?? []).map((p) => ({
    id: p.id,
    name_en: p.name_en,
    name_cn: p.name_cn,
    field: p.field,
    status: p.status,
    has_email: p.email !== null,
  }));
}
