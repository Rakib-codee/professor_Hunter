import Link from 'next/link';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { SiteHeader } from '@/components/layout/site-header';
import { buttonVariants } from '@/components/ui/button';
import { getCurrentUserId } from '@/lib/data/students';

// Public browsing shell (/find, /professor/[id]). Header adapts to the session.
export default async function PublicLayout({ children }: LayoutProps<'/'>) {
  const userId = await getCurrentUserId();
  const links = userId
    ? [
        { href: '/find', label: 'Find' },
        { href: '/saved', label: 'Saved' },
        { href: '/tracker', label: 'Tracker' },
        { href: '/profile', label: 'Profile' },
      ]
    : [{ href: '/find', label: 'Find' }];
  return (
    <>
      <SiteHeader homeHref={userId ? '/dashboard' : '/'} links={links}>
        {userId ? (
          <SignOutButton />
        ) : (
          <Link href="/login" className={buttonVariants({ size: 'sm' })}>
            Log in
          </Link>
        )}
      </SiteHeader>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6">{children}</main>
    </>
  );
}
