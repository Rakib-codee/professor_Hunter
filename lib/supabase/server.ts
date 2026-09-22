import { createServerClient } from '@supabase/ssr';
import type { Database } from './database.types';
import { cookies } from 'next/headers';
import { getPublicEnv } from '@/lib/env';

// Cookie-backed client for Server Components, Server Actions and Route Handlers.
// Create one per request — never cache it in a module-level variable.
export async function createClient() {
  const env = getPublicEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component, which cannot write cookies. Safe to ignore:
            // proxy.ts refreshes the session cookie on every request.
          }
        },
      },
    },
  );
}
