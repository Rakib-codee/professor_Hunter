import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = { title: 'Choose a new password' };

// Reached from the email link via /auth/callback, which establishes a recovery session.
// proxy.ts already redirects anonymous visitors to /login; this is defence in depth.
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-[22px] leading-tight font-semibold">Link expired</h1>
        <p className="text-muted-foreground text-[15px]">
          This password reset link is no longer valid.{' '}
          <Link href="/forgot-password" className="text-primary hover:underline">
            Request a new one
          </Link>
          .
        </p>
      </div>
    );
  }

  return <ResetPasswordForm />;
}
