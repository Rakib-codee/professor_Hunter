import type { EmailType } from './types';

/** Consumer mailbox providers. Anything else is treated as a university address (PLAN.md §2.3). */
export const PERSONAL_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  '163.com',
  '126.com',
  'qq.com',
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'sina.com',
  'sina.cn',
  'foxmail.com',
  'sohu.com',
  'aliyun.com',
  'yeah.net',
  'yahoo.com',
  'icloud.com',
  '139.com',
  '189.cn',
]);

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const VERIFY_PREFIX = /^verify:\s*/i;
const MULTI_SEPARATOR = /[;,]/;

export interface CleanedEmail {
  email: string | null;
  notes: string[];
}

/**
 * Turns a raw CSV email cell into a valid address or null, recording why in `notes`.
 * Handles the dirty values found in the dataset: "NOT FOUND (...)", "VERIFY: x@y",
 * internal spaces, and multiple addresses in one cell.
 */
export function cleanEmail(raw: string): CleanedEmail {
  const trimmed = raw.trim();
  if (trimmed === '') return { email: null, notes: [] };

  const notes: string[] = [];
  let candidate = trimmed;

  if (VERIFY_PREFIX.test(candidate)) {
    candidate = candidate.replace(VERIFY_PREFIX, '');
    notes.push('email flagged VERIFY in source');
  }

  const parts = candidate
    .split(MULTI_SEPARATOR)
    .map((part) => part.replace(/\s+/g, ''))
    .filter((part) => part !== '');
  if (parts.length > 1) {
    notes.push(`additional emails in source: ${parts.slice(1).join(', ')}`);
  }

  const first = parts[0] ?? '';
  if (!EMAIL_PATTERN.test(first)) {
    return { email: null, notes: [...notes, `email in source: ${trimmed}`] };
  }

  const atIndex = first.lastIndexOf('@');
  const normalized = first.slice(0, atIndex) + '@' + first.slice(atIndex + 1).toLowerCase();
  return { email: normalized, notes };
}

export function classifyEmailType(email: string | null): EmailType {
  if (email === null) return 'none';
  const domain = email.slice(email.lastIndexOf('@') + 1).toLowerCase();
  return PERSONAL_EMAIL_DOMAINS.has(domain) ? 'personal' : 'university';
}
