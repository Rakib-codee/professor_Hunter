import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createPublicClient } from '@/lib/supabase/public';
import type { Json, Tables } from '@/lib/supabase/database.types';
import type { FindParams } from '@/lib/find/params';

// Typed reads over the public professor surface (view + RPCs). No email ever comes through
// here; reveals go through actions/professors.ts → reveal_professor_email().
// Read-only RPCs use GET so the retrying fetch may repeat them on a dropped connection.

export type ProfessorPublic = Tables<'professors_public'>;

/** One row of `professors_public` with the columns the UI needs guaranteed non-null. */
export interface ProfessorListItem {
  id: string;
  name_en: string;
  name_cn: string | null;
  title: string | null;
  university_id: string | null;
  university_name: string | null;
  province: string | null;
  school: string | null;
  field: string | null;
  research_area: string | null;
  research_tags: string[];
  has_email: boolean;
  email_type: ProfessorPublic['email_type'];
  accepts_intl: ProfessorPublic['accepts_intl'];
  source_url: string | null;
  last_verified: string | null;
  last_verified_on: string | null;
  status: ProfessorPublic['status'];
}

export interface MajorCount {
  professors: number;
  universities: number;
}

export interface FacetTag {
  tag: string;
  count: number;
}

export interface FacetUniversity {
  id: string;
  name: string;
  province: string | null;
  count: number;
}

export interface Facets {
  total: number;
  tags: FacetTag[];
  untagged: number;
  universities: FacetUniversity[];
  accepts: Record<string, number>;
}

export interface SearchResult {
  total: number;
  items: ProfessorListItem[];
}

export const PAGE_SIZE = 20;
export const OTHER_TAG = '__other__';

/** Cache tag for every public professor read; admin edits and imports revalidate it. */
export const PROFESSORS_TAG = 'professors';
const PUBLIC_CACHE_SECONDS = 300;

function fail(context: string, error: { message: string }): never {
  throw new Error(`${context}: ${error.message}`);
}

function asRecord(value: Json | null | undefined): Record<string, Json | undefined> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function toListItem(row: Record<string, Json | undefined>): ProfessorListItem | null {
  if (typeof row.id !== 'string' || typeof row.name_en !== 'string') return null;
  const str = (key: string) => (typeof row[key] === 'string' ? (row[key] as string) : null);
  return {
    id: row.id,
    name_en: row.name_en,
    name_cn: str('name_cn'),
    title: str('title'),
    university_id: str('university_id'),
    university_name: str('university_name'),
    province: str('province'),
    school: str('school'),
    field: str('field'),
    research_area: str('research_area'),
    research_tags: Array.isArray(row.research_tags)
      ? row.research_tags.filter((t): t is string => typeof t === 'string')
      : [],
    has_email: row.has_email === true,
    email_type: (str('email_type') as ProfessorListItem['email_type']) ?? 'none',
    accepts_intl: (str('accepts_intl') as ProfessorListItem['accepts_intl']) ?? 'unknown',
    source_url: str('source_url'),
    last_verified: str('last_verified'),
    last_verified_on: str('last_verified_on'),
    status: (str('status') as ProfessorListItem['status']) ?? 'active',
  };
}

const majorCountsCached = unstable_cache(
  async (): Promise<Record<string, MajorCount>> => fetchMajorCounts(),
  ['major-counts'],
  { tags: [PROFESSORS_TAG], revalidate: PUBLIC_CACHE_SECONDS },
);

export async function getMajorCounts(): Promise<Record<string, MajorCount>> {
  return majorCountsCached();
}

async function fetchMajorCounts(): Promise<Record<string, MajorCount>> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc('major_counts', undefined, { get: true });
  if (error) fail('major_counts', error);
  return Object.fromEntries(
    Object.entries(asRecord(data)).map(([field, value]) => {
      const rec = asRecord(value);
      return [
        field,
        {
          professors: typeof rec.professors === 'number' ? rec.professors : 0,
          universities: typeof rec.universities === 'number' ? rec.universities : 0,
        },
      ];
    }),
  );
}

const facetsCached = unstable_cache(
  async (field: string): Promise<Facets> => fetchFacets(field),
  ['professor-facets'],
  { tags: [PROFESSORS_TAG], revalidate: PUBLIC_CACHE_SECONDS },
);

export async function getFacets(field: string): Promise<Facets> {
  return facetsCached(field);
}

async function fetchFacets(field: string): Promise<Facets> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc('professor_facets', { p_field: field }, { get: true });
  if (error) fail('professor_facets', error);
  const rec = asRecord(data);
  const tags = Array.isArray(rec.tags)
    ? rec.tags
        .map(asRecord)
        .flatMap((t) =>
          typeof t.tag === 'string' && typeof t.count === 'number'
            ? [{ tag: t.tag, count: t.count }]
            : [],
        )
    : [];
  const universities = Array.isArray(rec.universities)
    ? rec.universities.map(asRecord).flatMap((u) =>
        typeof u.id === 'string' && typeof u.name === 'string' && typeof u.count === 'number'
          ? [
              {
                id: u.id,
                name: u.name,
                province: typeof u.province === 'string' ? u.province : null,
                count: u.count,
              },
            ]
          : [],
      )
    : [];
  const accepts = Object.fromEntries(
    Object.entries(asRecord(rec.accepts)).flatMap(([k, v]) =>
      typeof v === 'number' ? [[k, v]] : [],
    ),
  );
  return {
    total: typeof rec.total === 'number' ? rec.total : 0,
    tags,
    untagged: typeof rec.untagged === 'number' ? rec.untagged : 0,
    universities,
    accepts,
  };
}

const searchCached = unstable_cache(
  async (field: string, params: FindParams): Promise<SearchResult> => fetchSearch(field, params),
  ['professor-search'],
  { tags: [PROFESSORS_TAG], revalidate: PUBLIC_CACHE_SECONDS },
);

export async function searchProfessors(field: string, params: FindParams): Promise<SearchResult> {
  return searchCached(field, params);
}

// supabase-js sends GET rpc arrays as an unquoted `{a,b}` literal, so an element containing a
// comma (or quote/brace) is split by PostgREST. Such calls go through POST instead.
const ARRAY_LITERAL_UNSAFE = /[,"{}\\]/;

export function canUseGetRpc(lists: readonly (readonly string[] | undefined)[]): boolean {
  return lists.every((list) => !list || list.every((item) => !ARRAY_LITERAL_UNSAFE.test(item)));
}

async function fetchSearch(field: string, params: FindParams): Promise<SearchResult> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc(
    'search_professors',
    {
      p_field: field,
      p_tags: params.tags.length > 0 ? params.tags : undefined,
      p_university_id: params.uni ?? undefined,
      p_province: params.province ?? undefined,
      p_accepts: params.accepts.length > 0 ? params.accepts : undefined,
      p_university_email_only: params.uniEmail,
      p_q: params.q || undefined,
      p_page: params.page,
      p_page_size: PAGE_SIZE,
    },
    { get: canUseGetRpc([params.tags, params.accepts]) },
  );
  if (error) fail('search_professors', error);
  const rows = data ?? [];
  return {
    total: rows[0]?.total ?? 0,
    items: rows.flatMap((row) => {
      const item = toListItem(asRecord(row.row_json));
      return item ? [item] : [];
    }),
  };
}

const professorCached = unstable_cache(
  async (id: string): Promise<ProfessorListItem | null> => fetchProfessor(id),
  ['professor'],
  { tags: [PROFESSORS_TAG], revalidate: PUBLIC_CACHE_SECONDS },
);

export async function getProfessor(id: string): Promise<ProfessorListItem | null> {
  return professorCached(id);
}

async function fetchProfessor(id: string): Promise<ProfessorListItem | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('professors_public')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) fail('getProfessor', error);
  if (!data) return null;
  return toListItem(data as unknown as Record<string, Json | undefined>);
}

export interface ReplyStats {
  total: number;
  replied: number;
}

/** Null unless at least 5 outreach rows exist for the professor (enforced in SQL). */
export async function getReplyStats(professorId: string): Promise<ReplyStats | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    'professor_reply_stats',
    { p_professor_id: professorId },
    { get: true },
  );
  if (error) fail('professor_reply_stats', error);
  const row = data?.[0];
  return row ? { total: row.total, replied: row.replied } : null;
}

export async function getSavedIds(studentId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('saved')
    .select('professor_id')
    .eq('student_id', studentId);
  if (error) fail('getSavedIds', error);
  return new Set((data ?? []).map((row) => row.professor_id));
}

export async function getSavedProfessors(studentId: string): Promise<ProfessorListItem[]> {
  const supabase = await createClient();
  const { data: saved, error } = await supabase
    .from('saved')
    .select('professor_id, created_at')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  if (error) fail('getSavedProfessors', error);
  const ids = (saved ?? []).map((row) => row.professor_id);
  if (ids.length === 0) return [];

  const { data: rows, error: rowsError } = await supabase
    .from('professors_public')
    .select('*')
    .in('id', ids);
  if (rowsError) fail('getSavedProfessors rows', rowsError);
  const byId = new Map(
    (rows ?? []).flatMap((row) => {
      const item = toListItem(row as unknown as Record<string, Json | undefined>);
      return item ? [[item.id, item] as const] : [];
    }),
  );
  return ids.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
}
