import { describe, expect, test } from 'vitest';
import { isAuthPage, isProtectedPath } from './routes';

describe('isProtectedPath', () => {
  test('protects app and admin routes', () => {
    for (const path of [
      '/dashboard',
      '/onboarding',
      '/profile',
      '/tracker',
      '/saved',
      '/admin',
      '/admin/reports',
      '/professor/abc/draft',
      '/reset-password',
    ]) {
      expect(isProtectedPath(path), path).toBe(true);
    }
  });

  test('leaves public browsing, legal, auth and API routes open', () => {
    for (const path of [
      '/',
      '/find',
      '/find/civil-engineering',
      '/professor/abc',
      '/privacy',
      '/login',
      '/signup',
      '/forgot-password',
      '/auth/callback',
      '/api/health',
    ]) {
      expect(isProtectedPath(path), path).toBe(false);
    }
  });

  test('does not match by prefix on unrelated routes', () => {
    expect(isProtectedPath('/dashboards-are-public')).toBe(false);
    expect(isProtectedPath('/saved-search')).toBe(false);
  });
});

describe('isAuthPage', () => {
  test('is true only for login, signup and forgot-password', () => {
    expect(isAuthPage('/login')).toBe(true);
    expect(isAuthPage('/signup')).toBe(true);
    expect(isAuthPage('/forgot-password')).toBe(true);
    expect(isAuthPage('/reset-password')).toBe(false);
    expect(isAuthPage('/dashboard')).toBe(false);
  });
});
