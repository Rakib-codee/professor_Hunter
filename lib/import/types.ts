// Shapes used by the CSV import pipeline (PLAN.md §2).

/** One raw row of professor_hunter_dataset_v4.csv, exactly as parsed (all strings). */
export interface CsvRow {
  university: string;
  school: string;
  field: string;
  name_cn: string;
  name_en: string;
  title: string;
  research_area: string;
  email: string;
  accepts_intl_students: string;
  source_url: string;
  last_verified: string;
  notes: string;
  gender: string;
  research_tags: string;
}

export const FIELDS = [
  'Computer Science and Technology',
  'Civil Engineering',
  'Software Engineering',
] as const;
export type Field = (typeof FIELDS)[number];

export const EMAIL_TYPES = ['university', 'personal', 'none'] as const;
export type EmailType = (typeof EMAIL_TYPES)[number];

export const ACCEPTS_INTL_VALUES = ['confirmed', 'team-reported', 'unknown', 'no'] as const;
export type AcceptsIntl = (typeof ACCEPTS_INTL_VALUES)[number];

/** A cleaned row, ready to be matched to a university and upserted into `professors`. */
export interface NormalizedProfessor {
  university_name: string;
  school: string | null;
  field: Field;
  name_en: string;
  name_cn: string | null;
  name_cn_inferred: boolean;
  title: string | null;
  research_area: string | null;
  research_tags: string[];
  email: string | null;
  email_type: EmailType;
  accepts_intl: AcceptsIntl;
  source_url: string | null;
  last_verified: string | null;
  /** ISO date (YYYY-MM-DD) derived from last_verified, or null if unparseable. */
  last_verified_on: string | null;
  notes: string | null;
  gender: string | null;
}

export interface NormalizedRow {
  professor: NormalizedProfessor;
  /** Non-fatal data-quality findings, surfaced in the import summary. */
  warnings: string[];
}
