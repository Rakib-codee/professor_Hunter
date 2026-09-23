import { describe, expect, test, vi } from 'vitest';
import { DRAFT_INPUT_FIXTURE } from './fixtures';
import { generateWithFallback, resolveProviders } from './provider';
import type { LlmProvider } from './types';

const stub = (name: string, fail = false): LlmProvider => ({
  name,
  model: `${name}-model`,
  generate: vi.fn(async () => {
    if (fail) throw new Error(`${name} down`);
    return { subject: 's', body: `from ${name}`, model: `${name}-model` };
  }),
});

describe('resolveProviders', () => {
  test('returns an empty chain when the provider is "none"', () => {
    expect(
      resolveProviders({
        LLM_PROVIDER: 'none',
        LLM_FALLBACK_PROVIDER: 'none',
        DEEPSEEK_API_KEY: '',
        DEEPSEEK_MODEL: 'd',
        GROQ_API_KEY: '',
        GROQ_MODEL: 'g',
      }),
    ).toEqual([]);
  });

  test('builds mock and named providers, fails loudly on a missing key', () => {
    const chain = resolveProviders({
      LLM_PROVIDER: 'mock',
      LLM_FALLBACK_PROVIDER: 'none',
      DEEPSEEK_API_KEY: '',
      DEEPSEEK_MODEL: 'd',
      GROQ_API_KEY: '',
      GROQ_MODEL: 'g',
    });
    expect(chain.map((p) => p.name)).toEqual(['mock']);

    const both = resolveProviders({
      LLM_PROVIDER: 'deepseek',
      LLM_FALLBACK_PROVIDER: 'groq',
      DEEPSEEK_API_KEY: 'a',
      DEEPSEEK_MODEL: 'd',
      GROQ_API_KEY: 'b',
      GROQ_MODEL: 'g',
    });
    expect(both.map((p) => [p.name, p.model])).toEqual([
      ['deepseek', 'd'],
      ['groq', 'g'],
    ]);

    expect(() =>
      resolveProviders({
        LLM_PROVIDER: 'groq',
        LLM_FALLBACK_PROVIDER: 'none',
        DEEPSEEK_API_KEY: '',
        DEEPSEEK_MODEL: 'd',
        GROQ_API_KEY: '',
        GROQ_MODEL: 'g',
      }),
    ).toThrow(/GROQ_API_KEY/);
  });
});

describe('generateWithFallback', () => {
  test('uses the primary when it works', async () => {
    const primary = stub('a');
    const fallback = stub('b');
    const result = await generateWithFallback([primary, fallback], DRAFT_INPUT_FIXTURE);
    expect(result.output.body).toBe('from a');
    expect(result.provider).toBe('a');
    expect(fallback.generate).not.toHaveBeenCalled();
  });

  test('falls back when the primary throws, and throws when all fail', async () => {
    const result = await generateWithFallback([stub('a', true), stub('b')], DRAFT_INPUT_FIXTURE);
    expect(result.provider).toBe('b');
    await expect(
      generateWithFallback([stub('a', true), stub('b', true)], DRAFT_INPUT_FIXTURE),
    ).rejects.toThrow(/b down/);
    await expect(generateWithFallback([], DRAFT_INPUT_FIXTURE)).rejects.toThrow(/no llm provider/i);
  });
});
