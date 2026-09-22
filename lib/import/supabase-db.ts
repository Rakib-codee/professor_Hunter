import type { SupabaseClient } from '@supabase/supabase-js';
import type { ExistingProfessor, ImportDb, ProfessorRecord } from './import';

// ImportDb backed by Supabase. Requires a secret-key client (RLS blocks students from `professors`).

const PROFESSOR_COLUMNS =
  'id, university_id, school, field, name_en, name_cn, name_cn_inferred, title, research_area, ' +
  'research_tags, email, email_type, accepts_intl, source_url, last_verified, last_verified_on, ' +
  'notes, gender';

function fail(context: string, error: { message: string }): never {
  throw new Error(`${context}: ${error.message}`);
}

/** ilike gives us case-insensitive equality; escape its wildcards so "a_b@x" matches literally. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export function createSupabaseImportDb(client: SupabaseClient): ImportDb {
  return {
    async findUniversityByName(nameEn) {
      const { data, error } = await client
        .from('universities')
        .select('id')
        .eq('name_en', nameEn)
        .maybeSingle();
      if (error) fail('findUniversityByName', error);
      return data;
    },

    async createUniversity(university) {
      const { data, error } = await client
        .from('universities')
        .insert(university)
        .select('id')
        .single();
      if (error) fail('createUniversity', error);
      return data;
    },

    async findProfessorByEmail(universityId, email) {
      const { data, error } = await client
        .from('professors')
        .select(PROFESSOR_COLUMNS)
        .eq('university_id', universityId)
        .ilike('email', escapeLike(email))
        .maybeSingle();
      if (error) fail('findProfessorByEmail', error);
      return data as ExistingProfessor | null;
    },

    async findProfessorByName(universityId, nameEn, field) {
      const { data, error } = await client
        .from('professors')
        .select(PROFESSOR_COLUMNS)
        .eq('university_id', universityId)
        .eq('field', field)
        .is('email', null)
        .ilike('name_en', escapeLike(nameEn))
        .maybeSingle();
      if (error) fail('findProfessorByName', error);
      return data as ExistingProfessor | null;
    },

    async insertProfessor(record: ProfessorRecord) {
      const { error } = await client.from('professors').insert(record);
      if (error) fail(`insertProfessor ${record.name_en}`, error);
    },

    async updateProfessor(id, record) {
      const { error } = await client.from('professors').update(record).eq('id', id);
      if (error) fail(`updateProfessor ${record.name_en}`, error);
    },
  };
}
