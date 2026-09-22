import { describe, expect, test } from 'vitest';
import { acceptsLabel, displayName, emailTypeLabel, sourceLabel, verifiedLabel } from './display';

describe('verifiedLabel', () => {
  const today = new Date('2026-09-23T00:00:00Z');

  test('formats full dates and year-months, marks stale after 12 months', () => {
    expect(verifiedLabel('2026-09-22', '2026-09-22', today)).toEqual({
      text: 'Verified 22 Sep 2026',
      isStale: false,
    });
    expect(verifiedLabel('2026-09', '2026-09-01', today)).toEqual({
      text: 'Verified Sep 2026',
      isStale: false,
    });
    expect(verifiedLabel('2025-01', '2025-01-01', today)).toEqual({
      text: 'Verified Jan 2025',
      isStale: true,
    });
  });

  test('falls back to the raw text or "not recorded" when unparsed', () => {
    expect(verifiedLabel('sometime', null, today)).toEqual({
      text: 'Verified sometime',
      isStale: false,
    });
    expect(verifiedLabel(null, null, today)).toEqual({
      text: 'Verification date not recorded',
      isStale: false,
    });
  });
});

describe('acceptsLabel', () => {
  test('uses the exact copy from PLAN §6 and never a positive tone for unknown', () => {
    expect(acceptsLabel('confirmed')).toEqual({
      text: 'Accepts international students (official list)',
      tone: 'positive',
    });
    expect(acceptsLabel('team-reported')).toEqual({
      text: 'Accepts international students (team-reported)',
      tone: 'positive',
    });
    expect(acceptsLabel('unknown')).toEqual({
      text: 'International acceptance unknown',
      tone: 'neutral',
    });
    expect(acceptsLabel('no')).toEqual({
      text: 'Not accepting international students',
      tone: 'negative',
    });
    expect(acceptsLabel(null)).toEqual({
      text: 'International acceptance unknown',
      tone: 'neutral',
    });
  });
});

describe('emailTypeLabel', () => {
  test('describes what a reveal will give', () => {
    expect(emailTypeLabel('university')).toBe('University email');
    expect(emailTypeLabel('personal')).toBe('Personal email');
    expect(emailTypeLabel('none')).toBe('No email on file');
    expect(emailTypeLabel(null)).toBe('No email on file');
  });
});

describe('sourceLabel / displayName', () => {
  test('source falls back to "Source not recorded"', () => {
    expect(sourceLabel('https://x.edu/y')).toEqual({ text: 'x.edu', href: 'https://x.edu/y' });
    expect(sourceLabel(null)).toEqual({ text: 'Source not recorded', href: null });
    expect(sourceLabel('not a url')).toEqual({ text: 'Source not recorded', href: null });
  });

  test('display name appends the Chinese name only when present', () => {
    expect(displayName('Li Wei', '李伟')).toBe('Li Wei (李伟)');
    expect(displayName('Li Wei', null)).toBe('Li Wei');
    expect(displayName('Li Wei', '  ')).toBe('Li Wei');
  });
});
