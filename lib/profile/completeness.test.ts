import { describe, expect, test } from 'vitest';
import { COMPLETENESS_THRESHOLD } from '@/lib/constants';
import { computeCompleteness, type CompletenessInput } from './completeness';

const FULL: CompletenessInput = {
  full_name: 'Rakib',
  nationality: 'Bangladesh',
  home_university: 'BUET',
  major: 'Civil Engineering',
  cgpa: 3.6,
  cgpa_scale: 4,
  graduation_year: 2025,
  degree_applying: 'master',
  intake_year: 2027,
  achievements: 'Paper A\nProject B',
  target_field: 'Civil Engineering',
  research_interests: 'Slope stability and soil-structure interaction',
  research_tags: ['Geotechnical Engineering'],
};

const EMPTY: CompletenessInput = {
  full_name: null,
  nationality: null,
  home_university: null,
  major: null,
  cgpa: null,
  cgpa_scale: null,
  graduation_year: null,
  degree_applying: null,
  intake_year: 2027,
  achievements: null,
  target_field: null,
  research_interests: null,
  research_tags: [],
};

describe('computeCompleteness', () => {
  test('a full profile without IELTS or CV scores 100', () => {
    const result = computeCompleteness(FULL);
    expect(result.score).toBe(100);
    expect(result.missing).toEqual([]);
    expect(result.isReady).toBe(true);
  });

  test('an empty profile scores only the intake-year default and lists every missing item', () => {
    const result = computeCompleteness(EMPTY);
    expect(result.score).toBe(5);
    expect(result.isReady).toBe(false);
    expect(result.missing).toHaveLength(11);
  });

  test('cgpa needs both value and scale, blank strings count as missing', () => {
    expect(computeCompleteness({ ...FULL, cgpa_scale: null }).score).toBe(85);
    expect(computeCompleteness({ ...FULL, full_name: '   ' }).score).toBe(90);
    expect(computeCompleteness({ ...FULL, research_tags: [] }).score).toBe(95);
  });

  test('isReady follows the threshold constant', () => {
    // Drop achievements (15) and research_interests (10): 75 → ready. Drop name too: 65 → not.
    const seventyFive = { ...FULL, achievements: null, research_interests: null };
    expect(computeCompleteness(seventyFive).score).toBe(75);
    expect(computeCompleteness(seventyFive).isReady).toBe(75 >= COMPLETENESS_THRESHOLD);
    expect(computeCompleteness({ ...seventyFive, full_name: null }).isReady).toBe(false);
  });
});
