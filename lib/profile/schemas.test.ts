import { describe, expect, test } from 'vitest';
import {
  academicStepSchema,
  ACHIEVEMENT_MAX_ITEMS,
  basicStepSchema,
  joinAchievements,
  researchStepSchema,
  splitAchievements,
} from './schemas';

describe('basicStepSchema', () => {
  test('coerces numeric strings from FormData and trims text', () => {
    const result = basicStepSchema.safeParse({
      full_name: ' Rakib ',
      nationality: 'Bangladesh',
      home_university: 'BUET',
      major: 'Civil Engineering',
      cgpa: '3.61',
      cgpa_scale: '4',
      graduation_year: '2025',
    });
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      full_name: 'Rakib',
      cgpa: 3.61,
      cgpa_scale: 4,
      graduation_year: 2025,
    });
  });

  test('treats empty strings as null for optional fields', () => {
    const result = basicStepSchema.safeParse({
      full_name: 'R',
      nationality: '',
      home_university: '',
      major: '',
      cgpa: '',
      cgpa_scale: '',
      graduation_year: '',
    });
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ nationality: null, cgpa: null, graduation_year: null });
  });

  test('rejects cgpa above its scale and out-of-range years', () => {
    expect(
      basicStepSchema.safeParse({ full_name: 'R', cgpa: '4.5', cgpa_scale: '4' }).success,
    ).toBe(false);
    expect(basicStepSchema.safeParse({ full_name: 'R', graduation_year: '1980' }).success).toBe(
      false,
    );
    expect(basicStepSchema.safeParse({ full_name: '' }).success).toBe(false);
  });
});

describe('academicStepSchema', () => {
  test('accepts degree, intake year and optional scores', () => {
    const result = academicStepSchema.safeParse({
      degree_applying: 'phd',
      intake_year: '2027',
      ielts: '7.5',
      toefl: '',
      hsk: '4',
      achievements: ['Paper', '', 'Project'],
    });
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      degree_applying: 'phd',
      intake_year: 2027,
      ielts: 7.5,
      toefl: null,
      hsk: 4,
    });
    expect(result.data?.achievements).toBe('Paper\nProject');
  });

  test('rejects bad degree, hsk 10 and more than the max achievements', () => {
    expect(
      academicStepSchema.safeParse({ degree_applying: 'bsc', intake_year: '2027' }).success,
    ).toBe(false);
    expect(
      academicStepSchema.safeParse({ degree_applying: 'phd', intake_year: '2027', hsk: '10' })
        .success,
    ).toBe(false);
    const tooMany = Array.from({ length: ACHIEVEMENT_MAX_ITEMS + 1 }, (_, i) => `item ${i}`);
    expect(
      academicStepSchema.safeParse({
        degree_applying: 'phd',
        intake_year: '2027',
        achievements: tooMany,
      }).success,
    ).toBe(false);
  });
});

describe('researchStepSchema', () => {
  test('requires a valid field and 1–3 known tags', () => {
    const ok = researchStepSchema.safeParse({
      target_field: 'Civil Engineering',
      research_interests: 'soils',
      research_tags: ['Geotechnical Engineering', 'Bridge Engineering'],
    });
    expect(ok.success).toBe(true);
    expect(
      researchStepSchema.safeParse({ target_field: 'Physics', research_tags: ['x'] }).success,
    ).toBe(false);
    expect(
      researchStepSchema.safeParse({
        target_field: 'Civil Engineering',
        research_tags: ['Natural Language Processing'],
      }).success,
    ).toBe(false);
    expect(
      researchStepSchema.safeParse({ target_field: 'Civil Engineering', research_tags: [] })
        .success,
    ).toBe(false);
  });

  test('accepts a single tag string (one checkbox checked)', () => {
    const result = researchStepSchema.safeParse({
      target_field: 'Civil Engineering',
      research_tags: 'Bridge Engineering',
    });
    expect(result.success).toBe(true);
    expect(result.data?.research_tags).toEqual(['Bridge Engineering']);
  });
});

describe('achievements helpers', () => {
  test('split/join round-trip and drop blanks', () => {
    expect(splitAchievements('a\n\nb\n')).toEqual(['a', 'b']);
    expect(splitAchievements(null)).toEqual([]);
    expect(joinAchievements(['a', ' ', 'b'])).toBe('a\nb');
    expect(joinAchievements([])).toBeNull();
  });
});
