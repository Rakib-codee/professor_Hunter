import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProfessorForm } from '@/components/admin/professor-form';
import { getProfessorForAdmin } from '@/lib/data/admin';

export const metadata: Metadata = { robots: { index: false } };
const UUID = /^[0-9a-f-]{36}$/i;

export default async function AdminProfessorEditPage({
  params,
}: PageProps<'/admin/professors/[id]'>) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const professor = await getProfessorForAdmin(id);
  if (!professor) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{professor.name_en}</h1>
        <p className="text-muted-foreground text-sm">
          {professor.university_name ?? 'Unknown university'} ·{' '}
          <Link href={`/professor/${professor.id}`} className="hover:underline">
            public page
          </Link>
        </p>
      </div>
      <ProfessorForm professor={professor} />
    </div>
  );
}
