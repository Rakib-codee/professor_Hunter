// Bounded retry for idempotent requests. Development networks (VPNs, flaky ISPs) reset TLS
// connections now and then; a GET that never reached the server is safe to repeat.
// POST/PATCH/DELETE are never retried: reveal_professor_email() counts against a quota.

const RETRYABLE_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'UND_ERR_SOCKET',
  'UND_ERR_CONNECT_TIMEOUT',
]);
const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD']);

export interface RetryOptions {
  attempts: number;
  delayMs: number;
}

export const DEFAULT_RETRY: RetryOptions = { attempts: 3, delayMs: 150 };

export function isRetryableNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const cause = (error as { cause?: { code?: string } }).cause;
  if (cause?.code && RETRYABLE_CODES.has(cause.code)) return true;
  return error instanceof TypeError && error.message === 'fetch failed';
}

function methodOf(input: RequestInfo | URL, init?: RequestInit): string {
  const fromInit = init?.method ?? (input instanceof Request ? input.method : 'GET');
  return fromInit.toUpperCase();
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function createRetryingFetch(
  inner: typeof fetch,
  options: RetryOptions = DEFAULT_RETRY,
): typeof fetch {
  return async (input, init) => {
    const retryable = IDEMPOTENT_METHODS.has(methodOf(input, init));
    const attempts = retryable ? options.attempts : 1;
    for (let attempt = 1; ; attempt += 1) {
      try {
        return await inner(input, init);
      } catch (error) {
        if (attempt >= attempts || !isRetryableNetworkError(error)) throw error;
        await sleep(options.delayMs * attempt);
      }
    }
  };
}

/** Global fetch with retries; safe to share, holds no state. */
export const retryingFetch: typeof fetch = createRetryingFetch((input, init) => fetch(input, init));
