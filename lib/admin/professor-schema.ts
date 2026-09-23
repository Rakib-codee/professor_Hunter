import { z } from 'zod';
import { FIELDS } from '@/lib/constants';
import { classifyEmailType, cleanEmail } from '@/lib/import/email';
import { parseLastVerified } from '@/lib/import/normalize-row';
import { isKnownTag } from '@/lib/profile/tags';

// Admin professor edit form. Same cleaning rules as the CSV import so hand edits and imports
// agree on email_type and last_verified_on.

const TEXT_MAX = 300;
const NOTES_MAX = 2000;
const blankToNull = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? null : value;
const optionalText = (max = TEXT_MAX) =>
  z.preprocess(blankToNull, z.string().trim().max(max).nullable().default(null));
const listField = z.preprocess(
  (value) => (value === undefined || value === null ? [] : Array.isArray(value) ? value : [value]),
  z.array(z.string()),
);

export const PROFESSOR_STATUSES = ['active', 'bounced', 'moved', 'retired'] as const;
export const ACCEPTS_VALUES = ['confirmed', 'team-reported', 'unknown', 'no'] as const;

export const professorEditSchema = z
  .object({
    name_en: z.string().trim().min(1, 'Name is required').max(TEXT_MAX),
    name_cn: optionalText(),
    title: optionalText(),
    school: optionalText(),
    field: z.enum(FIELDS, { error: 'Choose a field' }),
    research_area: optionalText(1000),
    research_tags: listField,
    email: optionalText(),
    accepts_intl: z.enum(ACCEPTS_VALUES),
    source_url: z.preprocess(blankToNull, z.url('Enter a full URL').nullable().default(null)),
    last_verified: optionalText(40),
    notes: optionalText(NOTES_MAX),
    gender: optionalText(20),
    status: z.enum(PROFESSOR_STATUSES),
  })
  .superRefine((data, ctx) => {
    if (data.research_tags.some((tag) => !isKnownTag(data.field, tag))) {
      ctx.addIssue({
        code: 'custom',
        path: ['research_tags'],
        message: 'Pick tags from the list for this field',
      });
    }
  })
  .transform((data, ctx) => {
    let email: string | null = null;
    if (data.email) {
      const cleaned = cleanEmail(data.email);
      if (!cleaned.email) {
        ctx.addIssue({
          code: 'custom',
          path: ['email'],
          message: 'Enter a valid email or leave it blank',
        });
        return z.NEVER;
      }
      email = cleaned.email;
    }
    return {
      ...data,
      email,
      email_type: classifyEmailType(email),
      last_verified_on: data.last_verified ? parseLastVerified(data.last_verified) : null,
    };
  });

export type ProfessorEditInput = z.infer<typeof professorEditSchema>;
