import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getPublicEnv } from '@/lib/env';

export interface SessionResult {
  /** Response carrying any refreshed auth cookies. Return it (or copy its cookies) as-is. */
  response: NextResponse;
  /** Verified JWT claims, or null when there is no valid session. */
  claims: { sub: string } | null;
}

// Runs in proxy.ts on every request: refreshes an expired access token and writes the
// new cookies to both the forwarded request and the outgoing response.
export async function updateSession(request: NextRequest): Promise<SessionResult> {
  const env = getPublicEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // Do not run code between createServerClient and getClaims(): the call is what refreshes
  // the token. Removing it makes users log out at random.
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;

  return { response, claims: typeof sub === 'string' ? { sub } : null };
}
