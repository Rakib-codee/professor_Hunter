import { describe, expect, test } from 'vitest';
import { parseAdminStats } from './stats';

describe('parseAdminStats', () => {
  test('reads the admin_stats() JSON shape', () => {
    const parsed = parseAdminStats({
      users: 12,
      drafts: 30,
      outreach_by_status: { sent: 5, replied_positive: 2 },
      reply_rate_by_university: [{ name_en: 'Tongji University', sent: 6, replied: 2 }],
      open_reports: 1,
    });
    expect(parsed).toEqual({
      users: 12,
      drafts: 30,
      outreachByStatus: { sent: 5, replied_positive: 2 },
      replyRateByUniversity: [{ name: 'Tongji University', sent: 6, replied: 2 }],
      openReports: 1,
    });
  });

  test('tolerates nulls and garbage', () => {
    const parsed = parseAdminStats(null);
    expect(parsed).toEqual({
      users: 0,
      drafts: 0,
      outreachByStatus: {},
      replyRateByUniversity: [],
      openReports: 0,
    });
    expect(
      parseAdminStats({ users: 'x', reply_rate_by_university: [{ name_en: 1 }] })
        .replyRateByUniversity,
    ).toEqual([]);
  });
});
