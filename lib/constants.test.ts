import { describe, expect, test } from 'vitest';
import { FIELDS, fieldFromSlug, MAJORS, slugForField } from './constants';

describe('majors', () => {
  test('every field has a unique slug and round-trips', () => {
    const slugs = FIELDS.map(slugForField);
    expect(new Set(slugs).size).toBe(FIELDS.length);
    for (const field of FIELDS) expect(fieldFromSlug(slugForField(field))).toBe(field);
  });

  test('uses the slugs fixed in PLAN.md §4', () => {
    expect(slugForField('Software Engineering')).toBe('software-engineering');
    expect(slugForField('Computer Science and Technology')).toBe('computer-science');
    expect(slugForField('Civil Engineering')).toBe('civil-engineering');
    expect(fieldFromSlug('nope')).toBeNull();
    expect(MAJORS).toHaveLength(3);
  });
});
