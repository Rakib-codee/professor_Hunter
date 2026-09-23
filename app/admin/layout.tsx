import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { getCurrentStudent } from '@/lib/data/students';

// Admin shell. Non-admins get a 404 (the section's existence is not advertised).
export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  const student = await getCurrentStudent();
  if (!student) redirect('/login?next=/admin');
  if (student.role !== 'admin') notFound();

  return (
    <>
      <header className="border-border flex items-center justify-between border-b px-4 py-3">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin" className="font-semibold tracking-tight">
            Admin
          </Link>
          <Link href="/admin/reports" className="hover:underline">
            Reports
          </Link>
          <Link href="/admin/professors" className="hover:underline">
            Professors
          </Link>
          <Link href="/admin/import" className="hover:underline">
            Import
          </Link>
          <Link href="/dashboard" className="text-muted-foreground hover:underline">
            Back to app
          </Link>
        </nav>
        <SignOutButton />
      </header>
      <main className="flex flex-1 flex-col px-4 py-6">{children}</main>
    </>
  );
}
