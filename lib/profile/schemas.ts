import { z } from 'zod';
import {
  CGPA_SCALES,
  DEGREES,
  FIELDS,
  GRADUATION_YEAR_MAX,
  GRADUATION_YEAR_MIN,
  INTAKE_YEAR_MAX,
  INTAKE_YEAR_MIN,
} from '@/lib/constants';
import { isKnownTag } from './tags';

// Per-step Zod schemas for onboarding and the profile page. Inputs arrive as FormData
// strings, so numbers are coerced and '' means "left blank" (stored as null).

export const ACHIEVEMENT_MAX_ITEMS = 3;
export const ACHIEVEMENT_MAX_LENGTH = 160;
export const TAGS_MAX = 3;
const TEXT_MAX = 200;
const INTERESTS_MAX = 1000;

const blankToNull = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

const optionalText = z.preprocess(
  blankToNull,
  z.string().trim().max(TEXT_MAX).nullable().default(null),
);

const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess(blankToNull, z.coerce.number().pipe(schema).nullable().default(null));

export const basicStepSchema = z
  .object({
    full_name: z.string().trim().min(1, 'Enter your name').max(TEXT_MAX),
    nationality: optionalText,
    home_university: optionalText,
    major: optionalText,
    cgpa: optionalNumber(z.number().min(0, 'CGPA cannot be negative')),
    cgpa_scale: optionalNumber(
      z.number().refine((v) => (CGPA_SCALES as readonly number[]).includes(v), 'Pick a scale'),
    ),
    graduation_year: optionalNumber(
      z
        .number()
        .int()
        .min(GRADUATION_YEAR_MIN, 'Enter a valid year')
        .max(GRADUATION_YEAR_MAX, 'Enter a valid year'),
    ),
  })
  .refine((d) => d.cgpa === null || d.cgpa_scale === null || d.cgpa <= d.cgpa_scale, {
    message: 'CGPA cannot exceed its scale',
    path: ['cgpa'],
  });

/** Splits stored achievements text into items. */
export function splitAchievements(text: string | null): string[] {
  return (text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** Joins items back into the stored text form; null when nothing was entered. */
export function joinAchievements(items: readonly string[]): string | null {
  const cleaned = items.map((item) => item.trim()).filter((item) => item.length > 0);
  return cleaned.length > 0 ? cleaned.join('\n') : null;
}

const achievementsField = z.preprocess(
  (value) => (value === undefined || value === null ? [] : Array.isArray(value) ? value : [value]),
  z
    .array(
      z
        .string()
        .trim()
        .max(ACHIEVEMENT_MAX_LENGTH, `Keep each item under ${ACHIEVEMENT_MAX_LENGTH} characters`),
    )
    .max(ACHIEVEMENT_MAX_ITEMS, `Up to ${ACHIEVEMENT_MAX_ITEMS} items`)
    .transform(joinAchievements),
);

export const academicStepSchema = z.object({
  degree_applying: z.enum(DEGREES, { error: 'Choose master or PhD' }),
  intake_year: z.coerce.number().int().min(INTAKE_YEAR_MIN).max(INTAKE_YEAR_MAX),
  ielts: optionalNumber(z.number().min(0).max(9)),
  toefl: optionalNumber(z.number().int().min(0).max(120)),
  hsk: optionalNumber(z.number().int().min(1).max(9)),
  achievements: achievementsField,
});

const tagsField = z.preprocess(
  (value) => (value === undefined || value === null ? [] : Array.isArray(value) ? value : [value]),
  z.array(z.string()).min(1, 'Pick at least one tag').max(TAGS_MAX, `Pick up to ${TAGS_MAX} tags`),
);

export const researchStepSchema = z
  .object({
    target_field: z.enum(FIELDS, { error: 'Choose a field' }),
    research_interests: z.preprocess(
      blankToNull,
      z.string().trim().max(INTERESTS_MAX).nullable().default(null),
    ),
    research_tags: tagsField,
  })
  .refine((d) => d.research_tags.every((tag) => isKnownTag(d.target_field, tag)), {
    message: 'Pick tags from the list for your field',
    path: ['research_tags'],
  });

export type BasicStepInput = z.infer<typeof basicStepSchema>;
export type AcademicStepInput = z.infer<typeof academicStepSchema>;
export type ResearchStepInput = z.infer<typeof researchStepSchema>;
