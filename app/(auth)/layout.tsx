import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

// Centered card shell for login / signup / forgot / reset. Works at 375 px.
export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:justify-center">
      <Link href="/" className="mb-8 text-[17px] font-semibold tracking-tight">
        Professor Hunter
      </Link>
      <Card className="w-full max-w-sm py-6">
        <CardContent className="flex flex-col gap-5">{children}</CardContent>
      </Card>
    </main>
  );
}
