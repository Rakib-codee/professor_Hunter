import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { CAPTCHA_FIELD_NAME, captchaTokenFrom, echoValues, fieldErrorsFrom } from './forms';

describe('fieldErrorsFrom', () => {
  test('keeps only the first message per field', () => {
    const schema = z.object({ email: z.email(), password: z.string().min(8).max(10) });
    const result = schema.safeParse({ email: 'nope', password: 'x' });
    expect(result.success).toBe(false);
    if (result.success) return;

    const errors = fieldErrorsFrom(result.error);

    expect(Object.keys(errors).sort()).toEqual(['email', 'password']);
    expect(typeof errors.email).toBe('string');
  });
});

describe('captchaTokenFrom', () => {
  test('returns the token when present and undefined when empty or missing', () => {
    const withToken = new FormData();
    withToken.set(CAPTCHA_FIELD_NAME, 'tok');
    const empty = new FormData();
    empty.set(CAPTCHA_FIELD_NAME, '');

    expect(captchaTokenFrom(withToken)).toBe('tok');
    expect(captchaTokenFrom(empty)).toBeUndefined();
    expect(captchaTokenFrom(new FormData())).toBeUndefined();
  });
});

describe('echoValues', () => {
  test('returns only the requested string fields', () => {
    const formData = new FormData();
    formData.set('email', 'a@b.co');
    formData.set('password', 'secret');
    formData.set('file', new Blob(['x']));

    expect(echoValues(formData, ['email', 'file', 'missing'])).toEqual({ email: 'a@b.co' });
  });
});
