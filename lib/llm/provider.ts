import type { LlmProviderName } from '@/lib/env';
import { createMockProvider } from './mock';
import { createOpenAiCompatibleProvider } from './openai-compatible';
import type { DraftInput, DraftOutput, LlmProvider } from './types';

// Picks providers from env (PLAN.md §8). A named provider without its key is a configuration
// error, never a silent fallback to mock.

export interface LlmEnv {
  LLM_PROVIDER: LlmProviderName;
  LLM_FALLBACK_PROVIDER: LlmProviderName;
  DEEPSEEK_API_KEY: string;
  DEEPSEEK_MODEL: string;
  GROQ_API_KEY: string;
  GROQ_MODEL: string;
}

const ENDPOINTS = {
  deepseek: 'https://api.deepseek.com/v1',
  groq: 'https://api.groq.com/openai/v1',
} as const;

function build(name: LlmProviderName, env: LlmEnv): LlmProvider | null {
  switch (name) {
    case 'none':
      return null;
    case 'mock':
      return createMockProvider();
    case 'deepseek':
      if (!env.DEEPSEEK_API_KEY) throw new Error('LLM_PROVIDER=deepseek requires DEEPSEEK_API_KEY');
      return createOpenAiCompatibleProvider({
        name,
        baseUrl: ENDPOINTS.deepseek,
        apiKey: env.DEEPSEEK_API_KEY,
        model: env.DEEPSEEK_MODEL,
      });
    case 'groq':
      if (!env.GROQ_API_KEY) throw new Error('LLM_PROVIDER=groq requires GROQ_API_KEY');
      return createOpenAiCompatibleProvider({
        name,
        baseUrl: ENDPOINTS.groq,
        apiKey: env.GROQ_API_KEY,
        model: env.GROQ_MODEL,
      });
  }
}

/** Primary then fallback; empty when drafting is disabled. */
export function resolveProviders(env: LlmEnv): LlmProvider[] {
  const primary = build(env.LLM_PROVIDER, env);
  if (!primary) return [];
  const fallback =
    env.LLM_FALLBACK_PROVIDER === env.LLM_PROVIDER ? null : build(env.LLM_FALLBACK_PROVIDER, env);
  return fallback ? [primary, fallback] : [primary];
}

export interface GenerateResult {
  output: DraftOutput;
  provider: string;
}

export async function generateWithFallback(
  chain: readonly LlmProvider[],
  input: DraftInput,
): Promise<GenerateResult> {
  if (chain.length === 0) throw new Error('No LLM provider configured');
  let lastError: unknown = null;
  for (const provider of chain) {
    try {
      return { output: await provider.generate(input), provider: provider.name };
    } catch (error) {
      lastError = error;
      console.error(
        `[llm] ${provider.name} failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  throw lastError instanceof Error ? lastError : new Error('All LLM providers failed');
}
