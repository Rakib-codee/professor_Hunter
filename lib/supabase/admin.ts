import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getServerEnv } from '@/lib/env';

// Secret-key client. Bypasses RLS — use only in server code that has already
// authorised the caller (draft route, admin stats, import script). Never import from a
// client component: the key would end up in the browser bundle.
export function createAdminClient(): SupabaseClient {
  const env = getServerEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
