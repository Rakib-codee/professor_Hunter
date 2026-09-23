import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { SiteHeader } from '@/components/layout/site-header';
import { getCurrentStudent } from '@/lib/data/students';

// Authenticated shell. proxy.ts already redirects anonymous requests; this re-checks on the
// server so a page can never render without a session. The onboarding guard
// (students.onboarding_completed_at null → /onboarding) is added with the onboarding pages.
export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const student = await getCurrentStudent();
  if (!student) redirect('/login');

  const links = [
    { href: '/find', label: 'Find' },
    { href: '/saved', label: 'Saved' },
    { href: '/tracker', label: 'Tracker' },
    { href: '/profile', label: 'Profile' },
    ...(student.role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <>
      <SiteHeader homeHref="/dashboard" links={links}>
        <SignOutButton />
      </SiteHeader>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6">{children}</main>
    </>
  );
}
