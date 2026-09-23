import { describe, expect, test, vi } from 'vitest';
import { DRAFT_INPUT_FIXTURE } from './fixtures';
import { createOpenAiCompatibleProvider } from './openai-compatible';

const ok = (content: string) =>
  new Response(
    JSON.stringify({
      choices: [{ message: { content } }],
      usage: { prompt_tokens: 120, completion_tokens: 80 },
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );

describe('openai-compatible provider', () => {
  test('posts a JSON-mode chat completion and parses the reply', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(ok('{"subject":"s","body":"Dear Professor Huang Feng, soil creep."}'));
    const provider = createOpenAiCompatibleProvider({
      name: 'deepseek',
      baseUrl: 'https://api.example/v1',
      apiKey: 'k',
      model: 'm',
      fetch: fetchMock,
    });

    const output = await provider.generate(DRAFT_INPUT_FIXTURE);

    expect(output).toEqual({
      subject: 's',
      body: 'Dear Professor Huang Feng, soil creep.',
      model: 'm',
      promptTokens: 120,
      completionTokens: 80,
    });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://api.example/v1/chat/completions');
    const payload = JSON.parse(String(init?.body));
    expect(payload.model).toBe('m');
    expect(payload.response_format).toEqual({ type: 'json_object' });
    expect(payload.messages[0].role).toBe('system');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer k');
  });

  test('throws on non-200 and on unparseable content', async () => {
    const bad = vi.fn<typeof fetch>().mockResolvedValue(new Response('nope', { status: 500 }));
    await expect(
      createOpenAiCompatibleProvider({
        name: 'groq',
        baseUrl: 'https://x/v1',
        apiKey: 'k',
        model: 'm',
        fetch: bad,
      }).generate(DRAFT_INPUT_FIXTURE),
    ).rejects.toThrow(/500/);

    const garbage = vi.fn<typeof fetch>().mockResolvedValue(ok('not json'));
    await expect(
      createOpenAiCompatibleProvider({
        name: 'groq',
        baseUrl: 'https://x/v1',
        apiKey: 'k',
        model: 'm',
        fetch: garbage,
      }).generate(DRAFT_INPUT_FIXTURE),
    ).rejects.toThrow(/parse/i);
  });
});
