import Link from 'next/link';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { buttonVariants } from '@/components/ui/button';
import { getCurrentUserId } from '@/lib/data/students';

// Public browsing shell (/find, /professor/[id]). Header adapts to the session.
export default async function PublicLayout({ children }: LayoutProps<'/'>) {
  const userId = await getCurrentUserId();
  return (
    <>
      <header className="border-border flex items-center justify-between border-b px-4 py-3">
        <Link href={userId ? '/dashboard' : '/'} className="font-semibold tracking-tight">
          Professor Hunter
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/find" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Find
          </Link>
          {userId ? (
            <>
              <Link href="/saved" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                Saved
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/login" className={buttonVariants({ size: 'sm' })}>
              Log in
            </Link>
          )}
        </nav>
      </header>
      <main className="flex flex-1 flex-col px-4 py-6">{children}</main>
    </>
  );
}
