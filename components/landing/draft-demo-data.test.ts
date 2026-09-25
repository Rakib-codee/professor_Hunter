import { describe, expect, it } from 'vitest';
import { DEMO, DEMO_LINK_MS, DEMO_START_MS, DEMO_STEP_MS, DEMO_TEXT } from './draft-demo-data';

const TOTAL_CHARS = Object.values(DEMO_TEXT).reduce((sum, part) => sum + part.length, 0);
const TOTAL_MS = DEMO_START_MS + TOTAL_CHARS * DEMO_STEP_MS;

describe('landing draft demo', () => {
  it('finishes typing in about four seconds', () => {
    expect(TOTAL_MS).toBeGreaterThan(3000);
    expect(TOTAL_MS).toBeLessThanOrEqual(4200);
  });

  it('links the phrase while the body is still typing', () => {
    expect(DEMO_LINK_MS).toBeGreaterThan(DEMO_START_MS);
    expect(DEMO_LINK_MS).toBeLessThan(TOTAL_MS);
  });

  it('uses the same research phrase in the record and the email', () => {
    expect(DEMO_TEXT.phrase.toLowerCase()).toBe(DEMO.research_phrase.toLowerCase());
    expect(DEMO_TEXT.greeting).toBe(`Dear Professor ${DEMO.name_en},\n\n`);
  });
});
