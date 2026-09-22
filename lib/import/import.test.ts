import { describe, expect, test } from 'vitest';
import { importRows, type ExistingProfessor, type ImportDb, type ProfessorRecord } from './import';
import type { CsvRow } from './types';

const ALLOWED_TAGS = ['Geotechnical Engineering', 'Structural Engineering'];

function csvRow(overrides: Partial<CsvRow> = {}): CsvRow {
  return {
    university: 'Tongji University',
    school: '',
    field: 'Civil Engineering',
    name_cn: '',
    name_en: 'Wang Fang',
    title: 'Professor',
    research_area: 'Soil mechanics',
    email: 'wangf@tongji.edu.cn',
    accepts_intl_students: 'unknown',
    source_url: '',
    last_verified: '2025-01',
    notes: '',
    gender: '',
    research_tags: 'Geotechnical Engineering',
    ...overrides,
  };
}

/** In-memory stand-in for the Supabase-backed ImportDb. */
function fakeDb() {
  const universities = new Map<string, { id: string }>();
  const professors: ExistingProfessor[] = [];
  let nextId = 1;
  const log: string[] = [];

  const db: ImportDb = {
    async findUniversityByName(name) {
      return universities.get(name) ?? null;
    },
    async createUniversity(seed) {
      const created = { id: `u${nextId++}` };
      universities.set(seed.name_en, created);
      log.push(`createUniversity:${seed.name_en}`);
      return created;
    },
    async findProfessorByEmail(universityId, email) {
      return (
        professors.find(
          (p) => p.university_id === universityId && p.email?.toLowerCase() === email.toLowerCase(),
        ) ?? null
      );
    },
    async findProfessorByName(universityId, nameEn, field) {
      return (
        professors.find(
          (p) =>
            p.university_id === universityId &&
            p.email === null &&
            p.name_en.toLowerCase() === nameEn.toLowerCase() &&
            p.field === field,
        ) ?? null
      );
    },
    async insertProfessor(record: ProfessorRecord) {
      professors.push({ id: `p${nextId++}`, ...record });
      log.push(`insert:${record.name_en}`);
    },
    async updateProfessor(id, record) {
      const index = professors.findIndex((p) => p.id === id);
      professors[index] = { id, ...record };
      log.push(`update:${record.name_en}`);
    },
  };
  return { db, professors, log };
}

describe('importRows', () => {
  test('inserts new rows and creates the university from the seed map', async () => {
    const { db, professors, log } = fakeDb();

    const summary = await importRows([csvRow()], db, ALLOWED_TAGS);

    expect(summary).toMatchObject({ inserted: 1, updated: 0, unchanged: 0, skipped: 0 });
    expect(log).toEqual(['createUniversity:Tongji University', 'insert:Wang Fang']);
    expect(professors[0]).toMatchObject({ email: 'wangf@tongji.edu.cn', email_type: 'university' });
  });

  test('is idempotent: a second identical run changes nothing', async () => {
    const { db, log } = fakeDb();
    await importRows([csvRow()], db, ALLOWED_TAGS);
    const before = log.length;

    const summary = await importRows([csvRow()], db, ALLOWED_TAGS);

    expect(summary).toMatchObject({ inserted: 0, updated: 0, unchanged: 1, skipped: 0 });
    expect(log).toHaveLength(before);
  });

  test('updates an existing row matched by email when a field changed', async () => {
    const { db, log } = fakeDb();
    await importRows([csvRow()], db, ALLOWED_TAGS);

    const summary = await importRows(
      [csvRow({ title: 'Associate Professor', email: 'WangF@Tongji.edu.cn' })],
      db,
      ALLOWED_TAGS,
    );

    expect(summary).toMatchObject({ inserted: 0, updated: 1, unchanged: 0 });
    expect(log.at(-1)).toBe('update:Wang Fang');
  });

  test('matches email-less rows by university + name + field', async () => {
    const { db } = fakeDb();
    await importRows([csvRow({ email: 'NOT FOUND' })], db, ALLOWED_TAGS);

    const summary = await importRows([csvRow({ email: 'NOT FOUND' })], db, ALLOWED_TAGS);

    expect(summary).toMatchObject({ inserted: 0, unchanged: 1 });
  });

  test('a name-only row that later gains an email is updated, not duplicated', async () => {
    const { db, professors } = fakeDb();
    await importRows([csvRow({ email: 'NOT FOUND' })], db, ALLOWED_TAGS);

    const summary = await importRows([csvRow()], db, ALLOWED_TAGS);

    expect(summary).toMatchObject({ inserted: 0, updated: 1 });
    expect(professors).toHaveLength(1);
    expect(professors[0].email).toBe('wangf@tongji.edu.cn');
  });

  test('skips rows that fail normalisation and reports them', async () => {
    const { db } = fakeDb();

    const summary = await importRows(
      [csvRow(), csvRow({ name_en: '', email: 'x@tongji.edu.cn' })],
      db,
      ALLOWED_TAGS,
    );

    expect(summary).toMatchObject({ inserted: 1, skipped: 1 });
    expect(summary.errors).toEqual([{ row: 3, message: 'name_en is required' }]);
  });

  test('creates unmapped universities with a warning', async () => {
    const { db, log } = fakeDb();

    const summary = await importRows(
      [csvRow({ university: 'Mystery University' })],
      db,
      ALLOWED_TAGS,
    );

    expect(log[0]).toBe('createUniversity:Mystery University');
    expect(summary.warnings).toContainEqual({
      row: 2,
      message: 'university "Mystery University" not in UNIVERSITY_MAP; created without province',
    });
  });

  test('collects row warnings such as unknown tags', async () => {
    const { db } = fakeDb();

    const summary = await importRows([csvRow({ research_tags: 'Nope' })], db, ALLOWED_TAGS);

    expect(summary.warnings).toContainEqual({ row: 2, message: 'unknown tag "Nope"' });
  });
});
