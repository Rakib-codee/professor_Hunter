import { beforeAll, describe, expect, test } from 'vitest';
import {
  hasFixture,
  hasProject,
  isDeniedOrEmpty,
  patch,
  rowsOf,
  rpc,
  select,
  signInFixture,
} from './client';

// PLAN.md §10 "DB" cases, as black-box REST checks. Rule 2: the professors table is never
// readable by app users; email only ever leaves the database via reveal_professor_email().
// These run against the real project; every case is read-only or an action that must fail,
// except the reveal test, which spends one of the fixture account's 30 daily reveals.

const PRIVATE_TABLES = ['students', 'saved', 'usage_log', 'drafts', 'outreach', 'reports'];

describe.skipIf(!hasProject)('anonymous visitor', () => {
  test('cannot read the professors table at all, let alone emails', async () => {
    const result = await select('professors', 'select=id,email&limit=5');
    expect(isDeniedOrEmpty(result)).toBe(true);
  });

  test('sees no email column on professors_public', async () => {
    const result = await select('professors_public', 'select=*&limit=3');
    expect(result.status).toBe(200);
    const rows = rowsOf(result);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(Object.keys(row)).not.toContain('email');
      expect(typeof row.has_email).toBe('boolean');
    }
  });

  test('search_professors rows carry has_email but never the address', async () => {
    const result = await rpc('search_professors', {
      p_field: 'Civil Engineering',
      p_page: 1,
      p_page_size: 5,
    });
    expect(result.status).toBe(200);
    const rows = rowsOf(result);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const json = row.row_json as Record<string, unknown>;
      expect(Object.keys(json)).not.toContain('email');
      expect(JSON.stringify(json)).not.toMatch(/@[a-z0-9.-]+\.[a-z]{2,}/i);
    }
  });

  test.each(PRIVATE_TABLES)('cannot read %s', async (table) => {
    const result = await select(table, 'select=*&limit=1');
    expect(isDeniedOrEmpty(result)).toBe(true);
  });

  test('reveal_professor_email requires auth', async () => {
    const result = await rpc('reveal_professor_email', {
      p_professor_id: '00000000-0000-0000-0000-000000000000',
    });
    expect(result.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify(result.body)).not.toMatch(/@/);
  });

  test.each(['consume_draft_quota', 'admin_stats'])('%s is not callable', async (fn) => {
    const args =
      fn === 'consume_draft_quota'
        ? {
            p_student_id: '00000000-0000-0000-0000-000000000000',
            p_professor_id: '00000000-0000-0000-0000-000000000000',
          }
        : {};
    const result = await rpc(fn, args);
    expect(result.status).toBeGreaterThanOrEqual(400);
  });
});

describe.skipIf(!hasFixture)('signed-in student (fixture account)', () => {
  let token = '';
  let userId = '';

  beforeAll(async () => {
    ({ token, userId } = await signInFixture());
  });

  test('still cannot read the professors table', async () => {
    const result = await select('professors', 'select=id,email&limit=5', token);
    expect(isDeniedOrEmpty(result)).toBe(true);
  });

  test('cannot promote itself to admin', async () => {
    const result = await patch('students', `id=eq.${userId}`, { role: 'admin' }, token);
    // Either the trigger raises (4xx) or RLS filters the row (200 with no rows updated).
    expect(result.status >= 400 || rowsOf(result).length === 0).toBe(true);
    const after = await select('students', `id=eq.${userId}&select=role`, token);
    expect(rowsOf(after)[0]?.role).toBe('student');
  });

  test('cannot read other students', async () => {
    const result = await select('students', `id=neq.${userId}&select=id&limit=1`, token);
    expect(isDeniedOrEmpty(result)).toBe(true);
  });

  test('admin_stats and consume_draft_quota are denied for a student', async () => {
    const stats = await rpc('admin_stats', {}, token);
    expect(stats.status).toBeGreaterThanOrEqual(400);
    const quota = await rpc(
      'consume_draft_quota',
      { p_student_id: userId, p_professor_id: userId },
      token,
    );
    expect(quota.status).toBeGreaterThanOrEqual(400);
  });

  test('revealing the same professor twice consumes one reveal, and only the RPC returns an email', async () => {
    const list = await select('professors_public', 'select=id&has_email=eq.true&limit=1', token);
    const professorId = rowsOf(list)[0]?.id as string;
    expect(professorId).toBeTruthy();

    const first = await rpc('reveal_professor_email', { p_professor_id: professorId }, token);
    expect(first.status).toBe(200);
    const firstRow = rowsOf(first)[0];
    expect(String(firstRow.out_email)).toMatch(/@/);
    expect(firstRow.out_email_type).toBeTruthy();
    expect(firstRow.reveals_limit).toBe(30);

    const second = await rpc('reveal_professor_email', { p_professor_id: professorId }, token);
    expect(second.status).toBe(200);
    expect(rowsOf(second)[0].reveals_used).toBe(firstRow.reveals_used);
  });
});
