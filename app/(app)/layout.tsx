import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { createClient } from '@/lib/supabase/server';

// Authenticated shell. proxy.ts already redirects anonymous requests; this re-checks on the
// server so a page can never render without a session. The onboarding guard
// (students.onboarding_completed_at null → /onboarding) is added with the onboarding pages.
export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect('/login');

  return (
    <>
      <header className="border-border flex items-center justify-between border-b px-4 py-3">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          Professor Hunter
        </Link>
        <SignOutButton />
      </header>
      <main className="flex flex-1 flex-col px-4 py-6">{children}</main>
    </>
  );
}
