import { classifyEmailType, cleanEmail } from './email';
import {
  ACCEPTS_INTL_VALUES,
  FIELDS,
  type AcceptsIntl,
  type CsvRow,
  type Field,
  type NormalizedRow,
} from './types';

const YEAR_MONTH = /^(\d{4})-(\d{2})$/;
const FULL_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const NOTES_SEPARATOR = ' | ';

function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** "2025-01" → "2025-01-01", "2026-09-22" → unchanged, anything else → null. */
export function parseLastVerified(raw: string): string | null {
  const value = raw.trim();
  const fullMatch = FULL_DATE.exec(value);
  if (fullMatch) {
    const [, y, m, d] = fullMatch;
    return isValidDate(Number(y), Number(m), Number(d)) ? value : null;
  }
  const monthMatch = YEAR_MONTH.exec(value);
  if (monthMatch) {
    const [, y, m] = monthMatch;
    return isValidDate(Number(y), Number(m), 1) ? `${value}-01` : null;
  }
  return null;
}

export interface ParsedTags {
  tags: string[];
  unknown: string[];
}

/** Splits the `;`-separated tag cell, keeping only tags from research_tags.json, in order, deduped. */
export function parseTags(raw: string, allowedTags: readonly string[]): ParsedTags {
  const allowed = new Set(allowedTags);
  const seen = new Set<string>();
  const tags: string[] = [];
  const unknown: string[] = [];

  for (const part of raw.split(';')) {
    const tag = part.trim();
    if (tag === '' || seen.has(tag)) continue;
    seen.add(tag);
    if (allowed.has(tag)) {
      tags.push(tag);
    } else {
      unknown.push(tag);
    }
  }
  return { tags, unknown };
}

function parseField(raw: string): Field {
  const value = raw.trim();
  if ((FIELDS as readonly string[]).includes(value)) return value as Field;
  throw new Error(`unknown field "${value}"`);
}

function parseAcceptsIntl(raw: string): { value: AcceptsIntl; warning: string | null } {
  const value = raw.trim().toLowerCase();
  if ((ACCEPTS_INTL_VALUES as readonly string[]).includes(value)) {
    return { value: value as AcceptsIntl, warning: null };
  }
  return {
    value: 'unknown',
    warning: `accepts_intl_students "${raw.trim()}" not recognised; using unknown`,
  };
}

function joinNotes(original: string | null, extra: string[]): string | null {
  const parts = [original, ...extra].filter((part): part is string => part !== null && part !== '');
  return parts.length === 0 ? null : parts.join(NOTES_SEPARATOR);
}

/** Applies all cleaning rules from PLAN.md §2 to one CSV row. Throws on unrecoverable rows. */
export function normalizeRow(row: CsvRow, allowedTags: readonly string[]): NormalizedRow {
  const nameEn = blankToNull(row.name_en);
  if (nameEn === null) throw new Error('name_en is required');
  const universityName = blankToNull(row.university);
  if (universityName === null) throw new Error('university is required');

  const warnings: string[] = [];
  const field = parseField(row.field);
  const accepts = parseAcceptsIntl(row.accepts_intl_students);
  if (accepts.warning) warnings.push(accepts.warning);

  const { tags, unknown } = parseTags(row.research_tags, allowedTags);
  warnings.push(...unknown.map((tag) => `unknown tag "${tag}"`));

  const cleaned = cleanEmail(row.email);
  const notes = blankToNull(row.notes);
  const nameCn = blankToNull(row.name_cn);

  return {
    professor: {
      university_name: universityName,
      school: blankToNull(row.school),
      field,
      name_en: nameEn,
      name_cn: nameCn,
      name_cn_inferred: nameCn !== null && /inferred/i.test(notes ?? ''),
      title: blankToNull(row.title),
      research_area: blankToNull(row.research_area),
      research_tags: tags,
      email: cleaned.email,
      email_type: classifyEmailType(cleaned.email),
      accepts_intl: accepts.value,
      source_url: blankToNull(row.source_url),
      last_verified: blankToNull(row.last_verified),
      last_verified_on: parseLastVerified(row.last_verified),
      notes: joinNotes(notes, cleaned.notes),
      gender: blankToNull(row.gender),
    },
    warnings,
  };
}
