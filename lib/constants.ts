import { FIELDS, type Field } from '@/lib/import/types';

// Product constants. Numbers mirrored in SQL are noted next to the migration name.

export { FIELDS, type Field };

export interface Major {
  field: Field;
  slug: string;
  /** Short label for buttons and nav. */
  label: string;
}

export const MAJORS: readonly Major[] = [
  { field: 'Software Engineering', slug: 'software-engineering', label: 'Software Engineering' },
  { field: 'Computer Science and Technology', slug: 'computer-science', label: 'Computer Science' },
  { field: 'Civil Engineering', slug: 'civil-engineering', label: 'Civil Engineering' },
];

export function slugForField(field: Field): string {
  const major = MAJORS.find((entry) => entry.field === field);
  if (!major) throw new Error(`No slug for field ${field}`);
  return major.slug;
}

export function fieldFromSlug(slug: string): Field | null {
  return MAJORS.find((entry) => entry.slug === slug)?.field ?? null;
}

/** Draft generation is disabled below this profile completeness (PLAN.md §7). */
export const COMPLETENESS_THRESHOLD = 70;

/** Per-student daily quotas. Mirrored in 0001_init.sql (reveal_professor_email, consume_draft_quota). */
export const FREE_TIER_LIMITS = { reveals: 30, drafts: 20 } as const;

/** Default follow-up date offset when an email is marked sent. */
export const FOLLOW_UP_DAYS = 10;

export const DEGREES = ['master', 'phd'] as const;
export type Degree = (typeof DEGREES)[number];

export const INTAKE_YEAR_DEFAULT = 2027;
export const INTAKE_YEAR_MIN = 2025;
export const INTAKE_YEAR_MAX = 2035;
export const GRADUATION_YEAR_MIN = 1990;
export const GRADUATION_YEAR_MAX = 2040;
export const CGPA_SCALES = [4, 5, 10, 100] as const;
