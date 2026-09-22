import { describe, expect, test } from 'vitest';
import { classifyEmailType, cleanEmail } from './email';
import { normalizeRow, parseLastVerified, parseTags } from './normalize-row';
import { UNIVERSITY_MAP } from './university-map';
import type { CsvRow } from './types';

const ALLOWED_TAGS = [
  'Geotechnical Engineering',
  'Artificial Intelligence',
  'Structural Engineering',
];

function csvRow(overrides: Partial<CsvRow> = {}): CsvRow {
  return {
    university: 'Example University',
    school: '',
    field: 'Civil Engineering',
    name_cn: '',
    name_en: 'Wang Fang',
    title: '',
    research_area: 'Soil mechanics; tunnelling',
    email: 'wangf@example.edu.cn',
    accepts_intl_students: 'unknown',
    source_url: '',
    last_verified: '2025-01',
    notes: '',
    gender: '',
    research_tags: 'Geotechnical Engineering',
    ...overrides,
  };
}

describe('cleanEmail', () => {
  test('returns null and a note for NOT FOUND variants', () => {
    expect(cleanEmail('NOT FOUND')).toEqual({ email: null, notes: ['email in source: NOT FOUND'] });
    expect(cleanEmail('NOT FOUND (list has names only)')).toEqual({
      email: null,
      notes: ['email in source: NOT FOUND (list has names only)'],
    });
  });

  test('returns null for blank', () => {
    expect(cleanEmail('   ')).toEqual({ email: null, notes: [] });
  });

  test('strips a VERIFY: prefix and records a note', () => {
    expect(cleanEmail('VERIFY: abc@uni.edu.cn')).toEqual({
      email: 'abc@uni.edu.cn',
      notes: ['email flagged VERIFY in source'],
    });
  });

  test('removes internal whitespace', () => {
    expect(cleanEmail('gubin@ ujs.edu.cn').email).toBe('gubin@ujs.edu.cn');
  });

  test('keeps the first of multiple addresses and notes the rest', () => {
    expect(cleanEmail('a@ujs.edu.cn; b@163.com')).toEqual({
      email: 'a@ujs.edu.cn',
      notes: ['additional emails in source: b@163.com'],
    });
  });

  test('lowercases the domain but not the local part', () => {
    expect(cleanEmail('Lanyuqing@BUAA.edu.cn').email).toBe('Lanyuqing@buaa.edu.cn');
  });

  test('rejects malformed addresses with a note', () => {
    expect(cleanEmail('nobody at nowhere')).toEqual({
      email: null,
      notes: ['email in source: nobody at nowhere'],
    });
  });
});

describe('classifyEmailType', () => {
  test('none for null', () => {
    expect(classifyEmailType(null)).toBe('none');
  });

  test('personal for known consumer domains', () => {
    expect(classifyEmailType('x@163.com')).toBe('personal');
    expect(classifyEmailType('x@QQ.com')).toBe('personal');
    expect(classifyEmailType('x@gmail.com')).toBe('personal');
  });

  test('university for everything else, including non-.edu university domains', () => {
    expect(classifyEmailType('x@zjnu.cn')).toBe('university');
    expect(classifyEmailType('x@buaa.edu.cn')).toBe('university');
  });
});

describe('parseLastVerified', () => {
  test('keeps full dates', () => {
    expect(parseLastVerified('2026-09-22')).toBe('2026-09-22');
  });

  test('expands year-month to the first of the month', () => {
    expect(parseLastVerified('2025-01')).toBe('2025-01-01');
  });

  test('returns null for junk or blank', () => {
    expect(parseLastVerified('unknown')).toBeNull();
    expect(parseLastVerified('')).toBeNull();
    expect(parseLastVerified('2025-13')).toBeNull();
  });
});

describe('parseTags', () => {
  test('splits on semicolons, trims, dedupes, drops unknown', () => {
    expect(
      parseTags(
        'Geotechnical Engineering; Artificial Intelligence ;Geotechnical Engineering; Bogus',
        ALLOWED_TAGS,
      ),
    ).toEqual({
      tags: ['Geotechnical Engineering', 'Artificial Intelligence'],
      unknown: ['Bogus'],
    });
  });

  test('empty input gives no tags', () => {
    expect(parseTags('', ALLOWED_TAGS)).toEqual({ tags: [], unknown: [] });
  });
});

describe('normalizeRow', () => {
  test('maps a typical row', () => {
    const result = normalizeRow(csvRow(), ALLOWED_TAGS);

    expect(result.professor).toMatchObject({
      university_name: 'Example University',
      school: null,
      field: 'Civil Engineering',
      name_en: 'Wang Fang',
      name_cn: null,
      name_cn_inferred: false,
      title: null,
      research_area: 'Soil mechanics; tunnelling',
      research_tags: ['Geotechnical Engineering'],
      email: 'wangf@example.edu.cn',
      email_type: 'university',
      accepts_intl: 'unknown',
      source_url: null,
      last_verified: '2025-01',
      last_verified_on: '2025-01-01',
      notes: null,
      gender: null,
    });
    expect(result.warnings).toEqual([]);
  });

  test('flags inferred Chinese names from the notes', () => {
    const result = normalizeRow(
      csvRow({ name_cn: '王芳', notes: 'name_cn was INFERRED from pinyin - verify' }),
      ALLOWED_TAGS,
    );

    expect(result.professor.name_cn).toBe('王芳');
    expect(result.professor.name_cn_inferred).toBe(true);
  });

  test('appends email cleaning notes to the existing notes', () => {
    const result = normalizeRow(
      csvRow({ email: 'NOT FOUND (site blocks access)', notes: 'From team spreadsheet' }),
      ALLOWED_TAGS,
    );

    expect(result.professor.email).toBeNull();
    expect(result.professor.email_type).toBe('none');
    expect(result.professor.notes).toBe(
      'From team spreadsheet | email in source: NOT FOUND (site blocks access)',
    );
  });

  test('maps accepts_intl_students and falls back to unknown', () => {
    expect(
      normalizeRow(csvRow({ accepts_intl_students: 'confirmed' }), ALLOWED_TAGS).professor
        .accepts_intl,
    ).toBe('confirmed');
    expect(
      normalizeRow(csvRow({ accepts_intl_students: 'team-reported' }), ALLOWED_TAGS).professor
        .accepts_intl,
    ).toBe('team-reported');
    const odd = normalizeRow(csvRow({ accepts_intl_students: 'maybe' }), ALLOWED_TAGS);
    expect(odd.professor.accepts_intl).toBe('unknown');
    expect(odd.warnings).toContain('accepts_intl_students "maybe" not recognised; using unknown');
  });

  test('reports unknown tags as warnings', () => {
    const result = normalizeRow(
      csvRow({ research_tags: 'Geotechnical Engineering; Nope' }),
      ALLOWED_TAGS,
    );

    expect(result.professor.research_tags).toEqual(['Geotechnical Engineering']);
    expect(result.warnings).toContain('unknown tag "Nope"');
  });

  test('throws on an unknown field or missing name', () => {
    expect(() => normalizeRow(csvRow({ field: 'Physics' }), ALLOWED_TAGS)).toThrow(/field/);
    expect(() => normalizeRow(csvRow({ name_en: ' ' }), ALLOWED_TAGS)).toThrow(/name_en/);
  });
});

describe('UNIVERSITY_MAP', () => {
  test('covers all 34 universities with a province', () => {
    expect(Object.keys(UNIVERSITY_MAP)).toHaveLength(34);
    for (const entry of Object.values(UNIVERSITY_MAP)) {
      expect(entry.province).toBeTruthy();
      expect(entry.name_cn).toBeTruthy();
    }
  });
});
