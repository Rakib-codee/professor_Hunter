import { describe, expect, test } from 'vitest';
import { countWords, hasEmoji, referencesResearch, validateDraft, WORD_CAP } from './validate';

const AREA = 'Rock/soil mechanics; soil creep';
const GOOD_BODY =
  'Dear Professor Huang Feng,\n\nI am a final-year civil engineering student at BUET. Your work on soil creep and rock mechanics matches my thesis on rainfall-induced slope failures. I would be grateful for an acceptance letter for the CSC Type B 2027 master programme. CSC covers tuition and stipend, so I am not requesting lab funding.\n\nKind regards,\nNadia Rahman\nBUET';

describe('helpers', () => {
  test('countWords, hasEmoji, referencesResearch', () => {
    expect(countWords('one two  three\nfour')).toBe(4);
    expect(hasEmoji('hello 👋')).toBe(true);
    expect(hasEmoji('hello')).toBe(false);
    expect(referencesResearch('I study soil creep', AREA)).toBe(true);
    expect(referencesResearch('I study bridges', AREA)).toBe(false);
    expect(referencesResearch('anything', '')).toBe(true);
  });
});

describe('validateDraft', () => {
  test('accepts a good formal body', () => {
    expect(validateDraft(GOOD_BODY, 'formal', AREA)).toEqual({ ok: true, issues: [] });
  });

  test('flags length, emoji, missing research reference, placeholders and empty body', () => {
    const long = Array.from({ length: WORD_CAP.formal + 1 }, () => 'soil').join(' ');
    expect(validateDraft(long, 'formal', AREA).issues).toContain('too_long');
    expect(validateDraft(GOOD_BODY + ' 🙂', 'formal', AREA).issues).toContain('emoji');
    expect(
      validateDraft('Dear Professor, I like bridges. Regards', 'formal', AREA).issues,
    ).toContain('research_reference_missing');
    expect(validateDraft(GOOD_BODY + ' [your name]', 'formal', AREA).issues).toContain(
      'placeholder',
    );
    expect(validateDraft('   ', 'formal', AREA).issues).toContain('empty');
  });

  test('concise cap is stricter', () => {
    const words = Array.from({ length: WORD_CAP.concise + 1 }, () => 'creep').join(' ');
    expect(validateDraft(words, 'concise', AREA).issues).toContain('too_long');
    expect(validateDraft(words, 'formal', AREA).issues).not.toContain('too_long');
  });
});
