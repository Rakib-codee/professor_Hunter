import { z } from 'zod';
import { buildMessages } from './prompt';
import type { LlmProvider } from './types';

// Plain fetch to an OpenAI-style /chat/completions endpoint. Used for DeepSeek and Groq. No SDK.

export interface OpenAiCompatibleOptions {
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 25_000;
const TEMPERATURE = 0.7;
const MAX_TOKENS = 600;

const responseSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string() }) })).min(1),
  usage: z
    .object({ prompt_tokens: z.number().optional(), completion_tokens: z.number().optional() })
    .optional(),
});
const draftSchema = z.object({ subject: z.string().default(''), body: z.string() });

export function createOpenAiCompatibleProvider(options: OpenAiCompatibleOptions): LlmProvider {
  const doFetch = options.fetch ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return {
    name: options.name,
    model: options.model,
    async generate(input) {
      const { system, user } = buildMessages(input);
      const response = await doFetch(`${options.baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${options.apiKey}` },
        body: JSON.stringify({
          model: options.model,
          temperature: TEMPERATURE,
          max_tokens: MAX_TOKENS,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) throw new Error(`${options.name}: HTTP ${response.status}`);

      const parsed = responseSchema.safeParse(await response.json());
      if (!parsed.success) throw new Error(`${options.name}: unexpected response shape`);
      const content = parsed.data.choices[0]!.message.content;

      let draft: unknown;
      try {
        draft = JSON.parse(content);
      } catch {
        throw new Error(`${options.name}: could not parse model output as JSON`);
      }
      const result = draftSchema.safeParse(draft);
      if (!result.success) throw new Error(`${options.name}: could not parse draft fields`);

      return {
        subject: result.data.subject,
        body: result.data.body,
        model: options.model,
        promptTokens: parsed.data.usage?.prompt_tokens,
        completionTokens: parsed.data.usage?.completion_tokens,
      };
    },
  };
}
