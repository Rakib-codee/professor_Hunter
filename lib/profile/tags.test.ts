import { describe, expect, test } from 'vitest';
import { inferFieldFromMajor, isKnownTag, tagsForField } from './tags';

describe('tagsForField', () => {
  test('returns the curated list for each field', () => {
    expect(tagsForField('Civil Engineering')).toContain('Geotechnical Engineering');
    expect(tagsForField('Computer Science and Technology')).toContain(
      'Natural Language Processing',
    );
  });

  test('Software Engineering shares the CS vocabulary (no separate list in the dataset)', () => {
    expect(tagsForField('Software Engineering')).toEqual(
      tagsForField('Computer Science and Technology'),
    );
  });

  test('isKnownTag checks against the field list', () => {
    expect(isKnownTag('Civil Engineering', 'Bridge Engineering')).toBe(true);
    expect(isKnownTag('Civil Engineering', 'Natural Language Processing')).toBe(false);
  });
});

describe('inferFieldFromMajor', () => {
  test('maps common major spellings to a field', () => {
    expect(inferFieldFromMajor('Software Engineering')).toBe('Software Engineering');
    expect(inferFieldFromMajor('software engg')).toBe('Software Engineering');
    expect(inferFieldFromMajor('BSc in Computer Science')).toBe('Computer Science and Technology');
    expect(inferFieldFromMajor('CSE')).toBe('Computer Science and Technology');
    expect(inferFieldFromMajor('Civil Engineering')).toBe('Civil Engineering');
    expect(inferFieldFromMajor('civil')).toBe('Civil Engineering');
  });

  test('returns null when nothing matches or major is empty', () => {
    expect(inferFieldFromMajor('Physics')).toBeNull();
    expect(inferFieldFromMajor('')).toBeNull();
    expect(inferFieldFromMajor(null)).toBeNull();
  });
});
