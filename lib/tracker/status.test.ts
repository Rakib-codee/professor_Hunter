import { describe, expect, test } from 'vitest';
import { OUTREACH_STATUSES, statusLabel, summarize } from './status';

describe('status helpers', () => {
  test('every status has a label', () => {
    for (const status of OUTREACH_STATUSES) expect(statusLabel(status).length).toBeGreaterThan(0);
    expect(statusLabel('replied_positive')).toBe('Replied – positive');
  });

  test('summarize counts sent, replied and no reply', () => {
    const rows = [
      { status: 'sent' },
      { status: 'replied_positive' },
      { status: 'replied_negative' },
      { status: 'no_reply' },
      { status: 'bounced' },
    ] as const;
    expect(summarize(rows)).toEqual({ total: 5, replied: 2, noReply: 1, waiting: 1, bounced: 1 });
  });
});
