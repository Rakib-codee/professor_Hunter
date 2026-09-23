// Display helpers (PLAN.md §6, key UI behaviours). Never emit "undefined" or "null".

export type AcceptsIntl = 'confirmed' | 'team-reported' | 'unknown' | 'no';
export type EmailType = 'university' | 'personal' | 'none';

export interface VerifiedLabel {
  text: string;
  /** Verified more than 12 months before `now`. */
  isStale: boolean;
}

const STALE_AFTER_MONTHS = 12;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthsBetween(from: Date, to: Date): number {
  return (
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth())
  );
}

/**
 * `raw` is the CSV text ("2025-01", "2026-09-22"), `parsed` the ISO date derived on import.
 * A full date renders "22 Sep 2026", a year-month "Sep 2026".
 */
export function verifiedLabel(
  raw: string | null,
  parsed: string | null,
  now: Date = new Date(),
): VerifiedLabel {
  if (!raw) return { text: 'Verification date not recorded', isStale: false };
  if (!parsed) return { text: `Verified ${raw}`, isStale: false };

  const date = new Date(`${parsed}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return { text: `Verified ${raw}`, isStale: false };

  const month = MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const text = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? `Verified ${date.getUTCDate()} ${month} ${year}`
    : `Verified ${month} ${year}`;
  return { text, isStale: monthsBetween(date, now) > STALE_AFTER_MONTHS };
}

/** positive = official list, caution = team-reported (softer evidence), neutral = unknown. */
export type Tone = 'positive' | 'caution' | 'neutral' | 'negative';

export function acceptsLabel(value: AcceptsIntl | null | undefined): { text: string; tone: Tone } {
  switch (value) {
    case 'confirmed':
      return { text: 'Accepts international students (official list)', tone: 'positive' };
    case 'team-reported':
      return { text: 'Accepts international students (team-reported)', tone: 'caution' };
    case 'no':
      return { text: 'Not accepting international students', tone: 'negative' };
    default:
      return { text: 'International acceptance unknown', tone: 'neutral' };
  }
}

export function emailTypeLabel(value: EmailType | null | undefined): string {
  switch (value) {
    case 'university':
      return 'University email';
    case 'personal':
      return 'Personal email';
    default:
      return 'No email on file';
  }
}

export function sourceLabel(url: string | null): { text: string; href: string | null } {
  if (!url) return { text: 'Source not recorded', href: null };
  try {
    const parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) throw new Error('bad protocol');
    return { text: parsed.hostname.replace(/^www\./, ''), href: url };
  } catch {
    return { text: 'Source not recorded', href: null };
  }
}

export function displayName(nameEn: string, nameCn: string | null): string {
  const cn = nameCn?.trim();
  return cn ? `${nameEn} (${cn})` : nameEn;
}
