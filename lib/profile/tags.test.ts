import { describe, expect, test } from 'vitest';
import { isKnownTag, tagsForField } from './tags';

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
