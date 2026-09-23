import { describe, expect, test } from 'vitest';
import { professorEditSchema } from './professor-schema';

const base = {
  name_en: 'Li Wei',
  name_cn: '',
  title: 'Professor',
  school: '',
  field: 'Civil Engineering',
  research_area: 'Bridges',
  research_tags: ['Bridge Engineering'],
  email: 'Li.Wei@Tongji.EDU.CN',
  accepts_intl: 'unknown',
  source_url: '',
  last_verified: '2026-09',
  notes: '',
  gender: '',
  status: 'active',
};

describe('professorEditSchema', () => {
  test('cleans email, derives email_type and last_verified_on, blanks to null', () => {
    const result = professorEditSchema.safeParse(base);
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      name_cn: null,
      school: null,
      email: 'li.wei@tongji.edu.cn',
      email_type: 'university',
      last_verified: '2026-09',
      last_verified_on: '2026-09-01',
      source_url: null,
      notes: null,
    });
  });

  test('no email means email_type none; personal domains classified', () => {
    expect(professorEditSchema.safeParse({ ...base, email: '' }).data).toMatchObject({
      email: null,
      email_type: 'none',
    });
    expect(professorEditSchema.safeParse({ ...base, email: 'x@163.com' }).data?.email_type).toBe(
      'personal',
    );
  });

  test('rejects unknown tags for the field, bad urls, bad enums', () => {
    expect(
      professorEditSchema.safeParse({ ...base, research_tags: ['Natural Language Processing'] })
        .success,
    ).toBe(false);
    expect(professorEditSchema.safeParse({ ...base, source_url: 'notaurl' }).success).toBe(false);
    expect(professorEditSchema.safeParse({ ...base, status: 'gone' }).success).toBe(false);
    expect(professorEditSchema.safeParse({ ...base, email: 'not-an-email' }).success).toBe(false);
  });
});
