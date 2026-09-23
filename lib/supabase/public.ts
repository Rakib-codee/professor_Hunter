import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getPublicEnv } from '@/lib/env';
import type { Database } from './database.types';
import { retryingFetch } from './fetch';

// Cookie-less server client for public reads (professors_public + the anon-granted RPCs).
// Safe inside unstable_cache because it never touches request state. RLS runs as `anon`.
export function createPublicClient() {
  const env = getPublicEnv();
  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: retryingFetch },
    },
  );
}
