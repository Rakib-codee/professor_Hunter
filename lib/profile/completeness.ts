import { COMPLETENESS_THRESHOLD } from '@/lib/constants';

// Profile completeness (PLAN.md §7). Weights sum to 100; optional extras (IELTS, TOEFL, HSK,
// CV) are excluded so 100 % is reachable without them.

export interface CompletenessInput {
  full_name: string | null;
  nationality: string | null;
  home_university: string | null;
  major: string | null;
  cgpa: number | null;
  cgpa_scale: number | null;
  graduation_year: number | null;
  degree_applying: string | null;
  intake_year: number | null;
  achievements: string | null;
  target_field: string | null;
  research_interests: string | null;
  research_tags: string[] | null;
}

export interface CompletenessResult {
  /** 0–100 */
  score: number;
  /** Human labels of the missing items, in form order. */
  missing: string[];
  /** score >= COMPLETENESS_THRESHOLD */
  isReady: boolean;
}

interface Criterion {
  label: string;
  weight: number;
  isDone: (input: CompletenessInput) => boolean;
}

const hasText = (value: string | null): boolean => Boolean(value && value.trim().length > 0);
const hasNumber = (value: number | null): boolean =>
  typeof value === 'number' && Number.isFinite(value);

const CRITERIA: readonly Criterion[] = [
  { label: 'Full name', weight: 10, isDone: (s) => hasText(s.full_name) },
  { label: 'Nationality', weight: 10, isDone: (s) => hasText(s.nationality) },
  { label: 'Current university', weight: 10, isDone: (s) => hasText(s.home_university) },
  { label: 'Major', weight: 5, isDone: (s) => hasText(s.major) },
  {
    label: 'CGPA and scale',
    weight: 15,
    isDone: (s) => hasNumber(s.cgpa) && hasNumber(s.cgpa_scale),
  },
  { label: 'Graduation year', weight: 5, isDone: (s) => hasNumber(s.graduation_year) },
  { label: 'Degree applying for', weight: 5, isDone: (s) => hasText(s.degree_applying) },
  { label: 'Intake year', weight: 5, isDone: (s) => hasNumber(s.intake_year) },
  { label: 'Publications or projects', weight: 15, isDone: (s) => hasText(s.achievements) },
  { label: 'Target field', weight: 5, isDone: (s) => hasText(s.target_field) },
  { label: 'Research interests', weight: 10, isDone: (s) => hasText(s.research_interests) },
  {
    label: 'At least one research tag',
    weight: 5,
    isDone: (s) => (s.research_tags?.length ?? 0) > 0,
  },
];

export function computeCompleteness(input: CompletenessInput): CompletenessResult {
  const { score, missing } = CRITERIA.reduce(
    (acc, criterion) =>
      criterion.isDone(input)
        ? { score: acc.score + criterion.weight, missing: acc.missing }
        : { score: acc.score, missing: [...acc.missing, criterion.label] },
    { score: 0, missing: [] as string[] },
  );
  return { score, missing, isReady: score >= COMPLETENESS_THRESHOLD };
}
