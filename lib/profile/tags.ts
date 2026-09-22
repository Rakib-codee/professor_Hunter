import researchTags from '@/research_tags.json';
import type { Field } from '@/lib/constants';

// Curated research tags per field (research_tags.json). Software Engineering professors in
// the dataset are tagged with the Computer Science vocabulary, so both fields share one list.

const TAGS = researchTags as Record<string, string[]>;

const FIELD_TAG_SOURCE: Record<Field, string> = {
  'Computer Science and Technology': 'Computer Science and Technology',
  'Software Engineering': 'Computer Science and Technology',
  'Civil Engineering': 'Civil Engineering',
};

export function tagsForField(field: Field): readonly string[] {
  return TAGS[FIELD_TAG_SOURCE[field]] ?? [];
}

export function isKnownTag(field: Field, tag: string): boolean {
  return tagsForField(field).includes(tag);
}

// Ordered: "software" must win over "computer" for "Computer Science / Software Engineering".
const MAJOR_PATTERNS: readonly { pattern: RegExp; field: Field }[] = [
  { pattern: /software/i, field: 'Software Engineering' },
  {
    pattern: /computer|\bcs\b|\bcse\b|\bit\b|informati/i,
    field: 'Computer Science and Technology',
  },
  { pattern: /civil|structural|geotech/i, field: 'Civil Engineering' },
];

/** Best-guess target field from a free-text major, used to preselect onboarding step 3. */
export function inferFieldFromMajor(major: string | null | undefined): Field | null {
  if (!major) return null;
  return MAJOR_PATTERNS.find(({ pattern }) => pattern.test(major))?.field ?? null;
}
