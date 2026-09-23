import { describe, expect, test } from 'vitest';
import { CV_MAX_BYTES, cvPathFor, validateCvFile } from './cv';

describe('validateCvFile', () => {
  test('accepts a small PDF', () => {
    expect(validateCvFile({ name: 'cv.pdf', type: 'application/pdf', size: 100_000 })).toEqual({
      ok: true,
    });
  });

  test('rejects wrong type, oversize and empty files', () => {
    expect(
      validateCvFile({
        name: 'cv.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 10,
      }).ok,
    ).toBe(false);
    expect(
      validateCvFile({ name: 'cv.pdf', type: 'application/pdf', size: CV_MAX_BYTES + 1 }).ok,
    ).toBe(false);
    expect(validateCvFile({ name: 'cv.pdf', type: 'application/pdf', size: 0 }).ok).toBe(false);
  });

  test('accepts .pdf with an empty browser mime type', () => {
    expect(validateCvFile({ name: 'My CV.PDF', type: '', size: 500 }).ok).toBe(true);
  });

  test('path is one fixed object per student', () => {
    expect(cvPathFor('abc')).toBe('abc/cv.pdf');
  });
});
