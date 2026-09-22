import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { safeNextPath } from '@/lib/auth/redirect';
import { createClient } from '@/lib/supabase/server';

// Landing point for links in Supabase emails (password reset today; OAuth later).
// Supports both the PKCE `?code=` flow (default templates) and `?token_hash=&type=`
// (if the templates are ever switched to the token-hash form). Secrets never reach the page.

const OTP_TYPES: ReadonlySet<string> = new Set([
  'email',
  'signup',
  'recovery',
  'magiclink',
  'invite',
  'email_change',
]);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNextPath(searchParams.get('next'), '/dashboard');
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  const supabase = await createClient();
  let failed = true;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failed = Boolean(error);
  } else if (tokenHash && type && OTP_TYPES.has(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
    failed = Boolean(error);
  }

  const destination = request.nextUrl.clone();
  destination.search = '';
  if (failed) {
    destination.pathname = '/login';
    destination.searchParams.set('error', 'link_invalid');
  } else {
    destination.pathname = next;
  }
  return NextResponse.redirect(destination);
}
