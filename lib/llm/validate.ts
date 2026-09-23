import type { Tone } from './types';

// Output checks (PLAN.md §8 step 5). Issues are short codes; the route maps them to copy.

export const WORD_CAP: Record<Tone, number> = { formal: 200, concise: 130 };

export type DraftIssue =
  'empty' | 'too_long' | 'emoji' | 'research_reference_missing' | 'placeholder';

export interface ValidationResult {
  ok: boolean;
  issues: DraftIssue[];
}

const EMOJI = /\p{Extended_Pictographic}/u;
const PLACEHOLDER = /\[[^\]]{1,40}\]/;
const MIN_TOKEN_LENGTH = 4;
const STOPWORDS = new Set([
  'with',
  'from',
  'that',
  'this',
  'their',
  'engineering',
  'science',
  'research',
  'study',
  'studies',
  'analysis',
  'systems',
  'system',
  'based',
  'using',
]);

export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

export function hasEmoji(text: string): boolean {
  return EMOJI.test(text);
}

/** True when the body reuses at least one meaningful (≥ 4 letters) token from the research area. */
export function referencesResearch(body: string, researchArea: string | null): boolean {
  if (!researchArea) return true;
  const tokens = researchArea
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((token) => token.length >= MIN_TOKEN_LENGTH && !STOPWORDS.has(token));
  if (tokens.length === 0) return true;
  const haystack = body.toLowerCase();
  return tokens.some((token) => haystack.includes(token));
}

export function validateDraft(
  body: string,
  tone: Tone,
  researchArea: string | null,
): ValidationResult {
  const issues: DraftIssue[] = [];
  if (body.trim().length === 0) return { ok: false, issues: ['empty'] };
  if (countWords(body) > WORD_CAP[tone]) issues.push('too_long');
  if (hasEmoji(body)) issues.push('emoji');
  if (!referencesResearch(body, researchArea)) issues.push('research_reference_missing');
  if (PLACEHOLDER.test(body)) issues.push('placeholder');
  return { ok: issues.length === 0, issues };
}
