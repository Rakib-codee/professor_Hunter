import { NextResponse, type NextRequest } from 'next/server';
import { safeNextPath } from '@/lib/auth/redirect';
import { isAuthPage, isProtectedPath } from '@/lib/auth/routes';
import { updateSession } from '@/lib/supabase/proxy';

// Next.js 16 "proxy" (the renamed middleware). Refreshes the Supabase session cookie and
// applies the two auth redirects from PLAN.md §4. The onboarding redirect lands with the
// onboarding pages (week 1, day 4–5) and lives in app/(app)/layout.tsx, not here.

const DEFAULT_AFTER_LOGIN = '/dashboard';

function redirectWithCookies(from: NextResponse, to: URL): NextResponse {
  const redirect = NextResponse.redirect(to);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export async function proxy(request: NextRequest) {
  const { response, claims } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (!claims && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('next', `${pathname}${search}`);
    return redirectWithCookies(response, url);
  }

  if (claims && isAuthPage(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = safeNextPath(request.nextUrl.searchParams.get('next'), DEFAULT_AFTER_LOGIN);
    url.search = '';
    return redirectWithCookies(response, url);
  }

  return response;
}

export const config = {
  // Everything except static assets and image optimisation.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json)$).*)',
  ],
};
