// Route classification shared by proxy.ts (redirects) and the auth pages.
// Public browsing (/find, /professor/[id]) stays open on purpose — PLAN.md §4.

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/onboarding',
  '/profile',
  '/tracker',
  '/saved',
  '/admin',
  '/reset-password',
] as const;

const AUTH_PAGES = ['/login', '/signup', '/forgot-password'] as const;

const DRAFT_ROUTE = /^\/professor\/[^/]+\/draft(?:\/|$)/;

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedPath(pathname: string): boolean {
  if (DRAFT_ROUTE.test(pathname)) return true;
  return PROTECTED_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

export function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((page) => matchesPrefix(pathname, page));
}
