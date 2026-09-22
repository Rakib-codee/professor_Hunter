import { describe, expect, test } from 'vitest';
import { friendlyAuthError } from './errors';

describe('friendlyAuthError', () => {
  test('maps known Supabase error codes to student-facing copy', () => {
    expect(friendlyAuthError({ code: 'invalid_credentials', message: 'x' })).toMatch(
      /email or password/i,
    );
    expect(friendlyAuthError({ code: 'user_already_exists', message: 'x' })).toMatch(/already/i);
    expect(friendlyAuthError({ code: 'email_exists', message: 'x' })).toMatch(/already/i);
    expect(friendlyAuthError({ code: 'weak_password', message: 'x' })).toMatch(/password/i);
    expect(friendlyAuthError({ code: 'over_request_rate_limit', message: 'x' })).toMatch(
      /too many/i,
    );
    expect(friendlyAuthError({ code: 'over_email_send_rate_limit', message: 'x' })).toMatch(
      /too many/i,
    );
    expect(friendlyAuthError({ code: 'captcha_failed', message: 'x' })).toMatch(
      /captcha|verification/i,
    );
    expect(friendlyAuthError({ code: 'same_password', message: 'x' })).toMatch(/different/i);
    expect(friendlyAuthError({ code: 'session_expired', message: 'x' })).toMatch(/expired/i);
  });

  test('falls back to a generic message and never leaks the raw message', () => {
    const message = friendlyAuthError({ code: 'something_new', message: 'stack trace here' });
    expect(message).not.toContain('stack trace');
    expect(message.length).toBeGreaterThan(10);
    expect(friendlyAuthError({ message: 'no code' })).toBe(message);
    expect(friendlyAuthError(null)).toBe(message);
  });
});
