import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { Card, CardContent } from '@/components/ui/card';

// Centered card shell for login / signup / forgot / reset. Works at 375 px.
export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:justify-center">
      <Link
        href="/"
        className="mb-8 rounded-sm outline-offset-4"
        aria-label="Professor Hunter home"
      >
        <Logo />
      </Link>
      <Card className="w-full max-w-sm py-6">
        <CardContent className="flex flex-col gap-5">{children}</CardContent>
      </Card>
    </main>
  );
}
