import { describe, expect, test } from 'vitest';
import { safeNextPath } from './redirect';

describe('safeNextPath', () => {
  test('returns an internal path unchanged', () => {
    expect(safeNextPath('/professor/abc?tab=1', '/dashboard')).toBe('/professor/abc?tab=1');
  });

  test('falls back for absolute URLs, protocol-relative URLs and empty values', () => {
    expect(safeNextPath('https://evil.example', '/dashboard')).toBe('/dashboard');
    expect(safeNextPath('//evil.example', '/dashboard')).toBe('/dashboard');
    expect(safeNextPath('/\\evil.example', '/dashboard')).toBe('/dashboard');
    expect(safeNextPath('', '/dashboard')).toBe('/dashboard');
    expect(safeNextPath(null, '/dashboard')).toBe('/dashboard');
    expect(safeNextPath(undefined, '/dashboard')).toBe('/dashboard');
  });

  test('never bounces back into the auth pages', () => {
    expect(safeNextPath('/login', '/dashboard')).toBe('/dashboard');
    expect(safeNextPath('/signup?x=1', '/dashboard')).toBe('/dashboard');
    expect(safeNextPath('/auth/callback', '/dashboard')).toBe('/dashboard');
  });
});
