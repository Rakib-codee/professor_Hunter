import { describe, expect, test } from 'vitest';
import { computeCompleteness, type CompletenessInput } from './completeness';
import {
  PROFILE_SECTIONS,
  missingBySection,
  nextSection,
  sectionForField,
  sectionElementId,
} from './sections';

const EMPTY: CompletenessInput = {
  full_name: null,
  nationality: null,
  home_university: null,
  major: null,
  cgpa: null,
  cgpa_scale: null,
  graduation_year: null,
  degree_applying: null,
  intake_year: null,
  achievements: null,
  target_field: null,
  research_interests: null,
  research_tags: [],
};

describe('profile sections', () => {
  test('every completeness field belongs to exactly one section', () => {
    const fields = computeCompleteness(EMPTY).missingItems.map((item) => item.field);
    const sectionFields = PROFILE_SECTIONS.flatMap((section) => section.fields);
    expect(new Set(sectionFields).size).toBe(sectionFields.length);
    for (const field of fields) expect(sectionForField(field)).not.toBeNull();
  });

  test('counts missing items per section for an empty profile', () => {
    const counts = missingBySection(computeCompleteness(EMPTY).missingItems);
    expect(counts).toEqual({ about: 6, application: 3, research: 3 });
  });

  test('counts nothing for a field it does not know', () => {
    expect(missingBySection([{ label: 'X', field: 'unknown' }])).toEqual({
      about: 0,
      application: 0,
      research: 0,
    });
  });

  test('walks the sections in order and stops at the last one', () => {
    expect(nextSection('about')?.id).toBe('application');
    expect(nextSection('application')?.id).toBe('research');
    expect(nextSection('research')).toBeNull();
  });

  test('section element ids are stable anchors', () => {
    expect(sectionElementId('about')).toBe('section-about');
  });
});
