import { describe, expect, test, vi } from 'vitest';
import { createRetryingFetch, isRetryableNetworkError } from './fetch';

const networkError = (code: string) =>
  Object.assign(new TypeError('fetch failed'), { cause: { code } });

describe('isRetryableNetworkError', () => {
  test('matches transport failures only', () => {
    expect(isRetryableNetworkError(networkError('ECONNRESET'))).toBe(true);
    expect(isRetryableNetworkError(networkError('ETIMEDOUT'))).toBe(true);
    expect(isRetryableNetworkError(new TypeError('fetch failed'))).toBe(true);
    expect(isRetryableNetworkError(new Error('boom'))).toBe(false);
    expect(isRetryableNetworkError('nope')).toBe(false);
  });
});

describe('createRetryingFetch', () => {
  test('retries GET on a transport error and returns the eventual response', async () => {
    const inner = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(networkError('ECONNRESET'))
      .mockResolvedValueOnce(new Response('ok'));
    const fetchWithRetry = createRetryingFetch(inner, { attempts: 3, delayMs: 0 });

    const response = await fetchWithRetry('https://x.test/a', { method: 'GET' });

    expect(await response.text()).toBe('ok');
    expect(inner).toHaveBeenCalledTimes(2);
  });

  test('gives up after the configured attempts', async () => {
    const inner = vi.fn<typeof fetch>().mockRejectedValue(networkError('ECONNRESET'));
    const fetchWithRetry = createRetryingFetch(inner, { attempts: 3, delayMs: 0 });

    await expect(fetchWithRetry('https://x.test/a')).rejects.toThrow('fetch failed');
    expect(inner).toHaveBeenCalledTimes(3);
  });

  test('never retries non-GET requests or non-network errors', async () => {
    const inner = vi.fn<typeof fetch>().mockRejectedValue(networkError('ECONNRESET'));
    const fetchWithRetry = createRetryingFetch(inner, { attempts: 3, delayMs: 0 });

    await expect(fetchWithRetry('https://x.test/a', { method: 'POST' })).rejects.toThrow();
    expect(inner).toHaveBeenCalledTimes(1);

    const other = vi.fn<typeof fetch>().mockRejectedValue(new Error('parse'));
    await expect(
      createRetryingFetch(other, { attempts: 3, delayMs: 0 })('https://x.test/a'),
    ).rejects.toThrow('parse');
    expect(other).toHaveBeenCalledTimes(1);
  });
});
