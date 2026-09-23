import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { buttonVariants } from '@/components/ui/button';
import { getCurrentStudent } from '@/lib/data/students';

// Authenticated shell. proxy.ts already redirects anonymous requests; this re-checks on the
// server so a page can never render without a session. The onboarding guard
// (students.onboarding_completed_at null → /onboarding) is added with the onboarding pages.
export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const student = await getCurrentStudent();
  if (!student) redirect('/login');

  return (
    <>
      <header className="border-border flex items-center justify-between border-b px-4 py-3">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          Professor Hunter
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/find" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Find
          </Link>
          <Link href="/saved" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Saved
          </Link>
          <Link href="/tracker" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Tracker
          </Link>
          <Link href="/profile" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Profile
          </Link>
          {student.role === 'admin' ? (
            <Link href="/admin" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Admin
            </Link>
          ) : null}
          <SignOutButton />
        </nav>
      </header>
      <main className="flex flex-1 flex-col px-4 py-6">{children}</main>
    </>
  );
}
