import { describe, expect, test } from 'vitest';
import { DRAFT_INPUT_FIXTURE } from './fixtures';
import { createMockProvider, MOCK_FAIL_WHY_LINE } from './mock';
import { validateDraft } from './validate';

describe('mock provider', () => {
  const provider = createMockProvider({ latencyMs: 0 });

  test('is deterministic and reports model "mock"', async () => {
    const a = await provider.generate(DRAFT_INPUT_FIXTURE);
    const b = await provider.generate(DRAFT_INPUT_FIXTURE);
    expect(a).toEqual(b);
    expect(a.model).toBe('mock');
    expect(provider.name).toBe('mock');
  });

  test('produces a body that passes validation for both tones', async () => {
    const formal = await provider.generate(DRAFT_INPUT_FIXTURE);
    const concise = await provider.generate({ ...DRAFT_INPUT_FIXTURE, tone: 'concise' });
    expect(
      validateDraft(formal.body, 'formal', DRAFT_INPUT_FIXTURE.professor.researchArea).ok,
    ).toBe(true);
    expect(
      validateDraft(concise.body, 'concise', DRAFT_INPUT_FIXTURE.professor.researchArea).ok,
    ).toBe(true);
    expect(formal.body).toContain('Dear Professor Huang Feng');
    expect(formal.body).toContain('Nadia Rahman');
  });

  test('can be forced to fail for tests', async () => {
    await expect(
      provider.generate({ ...DRAFT_INPUT_FIXTURE, whyLine: MOCK_FAIL_WHY_LINE }),
    ).rejects.toThrow(/mock/i);
  });
});
