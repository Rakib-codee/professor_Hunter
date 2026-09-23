import { notFound, redirect } from 'next/navigation';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { SiteHeader } from '@/components/layout/site-header';
import { getCurrentStudent } from '@/lib/data/students';

// Admin shell. Non-admins get a 404 (the section's existence is not advertised).
export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  const student = await getCurrentStudent();
  if (!student) redirect('/login?next=/admin');
  if (student.role !== 'admin') notFound();

  const links = [
    { href: '/admin/reports', label: 'Reports' },
    { href: '/admin/professors', label: 'Professors' },
    { href: '/admin/import', label: 'Import' },
    { href: '/dashboard', label: 'Back to app' },
  ];

  return (
    <>
      <SiteHeader homeHref="/admin" section="Admin" links={links}>
        <SignOutButton />
      </SiteHeader>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 text-[15px]">
        {children}
      </main>
    </>
  );
}
