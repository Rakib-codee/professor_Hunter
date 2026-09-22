import { normalizeRow } from './normalize-row';
import { UNIVERSITY_MAP, type UniversitySeed } from './university-map';
import type { CsvRow, Field, NormalizedProfessor } from './types';

// Storage-agnostic import pipeline (PLAN.md §2.10). The CLI script and the admin
// upload share this; Supabase access is injected through `ImportDb` so it is testable.

/** What we write to `professors`: the normalised row with the university resolved to an id. */
export type ProfessorRecord = Omit<NormalizedProfessor, 'university_name'> & {
  university_id: string;
};

export type ExistingProfessor = ProfessorRecord & { id: string };

export interface UniversityInsert extends Partial<UniversitySeed> {
  name_en: string;
}

export interface ImportDb {
  findUniversityByName(nameEn: string): Promise<{ id: string } | null>;
  createUniversity(university: UniversityInsert): Promise<{ id: string }>;
  findProfessorByEmail(universityId: string, email: string): Promise<ExistingProfessor | null>;
  findProfessorByName(
    universityId: string,
    nameEn: string,
    field: Field,
  ): Promise<ExistingProfessor | null>;
  insertProfessor(record: ProfessorRecord): Promise<void>;
  updateProfessor(id: string, record: ProfessorRecord): Promise<void>;
}

export interface RowMessage {
  /** 1-based line number in the CSV (header is line 1). */
  row: number;
  message: string;
}

export interface ImportSummary {
  total: number;
  inserted: number;
  updated: number;
  unchanged: number;
  skipped: number;
  warnings: RowMessage[];
  errors: RowMessage[];
}

const HEADER_LINES = 1;

async function resolveUniversity(
  name: string,
  db: ImportDb,
  cache: Map<string, string>,
): Promise<{ id: string; unmapped: boolean }> {
  const cached = cache.get(name);
  if (cached) return { id: cached, unmapped: false };

  const existing = await db.findUniversityByName(name);
  if (existing) {
    cache.set(name, existing.id);
    return { id: existing.id, unmapped: false };
  }

  const seed = UNIVERSITY_MAP[name];
  const created = await db.createUniversity({ name_en: name, ...seed });
  cache.set(name, created.id);
  return { id: created.id, unmapped: seed === undefined };
}

function toRecord(professor: NormalizedProfessor, universityId: string): ProfessorRecord {
  const record: ProfessorRecord & { university_name?: string } = {
    ...professor,
    university_id: universityId,
  };
  delete record.university_name;
  return record;
}

function sameRecord(existing: ExistingProfessor, next: ProfessorRecord): boolean {
  const keys = Object.keys(next) as (keyof ProfessorRecord)[];
  return keys.every((key) => {
    const a = existing[key];
    const b = next[key];
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((value, index) => value === b[index]);
    }
    return a === b;
  });
}

async function findExisting(
  record: ProfessorRecord,
  db: ImportDb,
): Promise<ExistingProfessor | null> {
  if (record.email !== null) {
    const byEmail = await db.findProfessorByEmail(record.university_id, record.email);
    if (byEmail) return byEmail;
  }
  // Either the row has no email, or it is a previously email-less row that now has one.
  return db.findProfessorByName(record.university_id, record.name_en, record.field);
}

/** Normalises and upserts every row. Never throws for a single bad row; see `errors`. */
export async function importRows(
  rows: readonly CsvRow[],
  db: ImportDb,
  allowedTags: readonly string[],
): Promise<ImportSummary> {
  const universityCache = new Map<string, string>();
  let summary: ImportSummary = {
    total: rows.length,
    inserted: 0,
    updated: 0,
    unchanged: 0,
    skipped: 0,
    warnings: [],
    errors: [],
  };

  for (const [index, row] of rows.entries()) {
    const line = index + HEADER_LINES + 1;
    try {
      const normalized = normalizeRow(row, allowedTags);
      const rowWarnings = normalized.warnings.map((message) => ({ row: line, message }));

      const university = await resolveUniversity(
        normalized.professor.university_name,
        db,
        universityCache,
      );
      if (university.unmapped) {
        rowWarnings.push({
          row: line,
          message: `university "${normalized.professor.university_name}" not in UNIVERSITY_MAP; created without province`,
        });
      }

      const record = toRecord(normalized.professor, university.id);
      const existing = await findExisting(record, db);

      if (existing === null) {
        await db.insertProfessor(record);
        summary = { ...summary, inserted: summary.inserted + 1 };
      } else if (sameRecord(existing, record)) {
        summary = { ...summary, unchanged: summary.unchanged + 1 };
      } else {
        await db.updateProfessor(existing.id, record);
        summary = { ...summary, updated: summary.updated + 1 };
      }
      summary = { ...summary, warnings: [...summary.warnings, ...rowWarnings] };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      summary = {
        ...summary,
        skipped: summary.skipped + 1,
        errors: [...summary.errors, { row: line, message }],
      };
    }
  }

  return summary;
}
