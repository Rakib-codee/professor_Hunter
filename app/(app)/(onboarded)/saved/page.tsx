import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProfessorCard } from '@/components/professor/professor-card';
import { getSavedProfessors } from '@/lib/data/professors';
import { getCurrentUserId } from '@/lib/data/students';

export const metadata: Metadata = { title: 'Saved professors' };

export default async function SavedPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login?next=/saved');
  const professors = await getSavedProfessors(userId);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Saved professors</h1>
      {professors.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nothing saved yet. Tap the heart on any professor in{' '}
          <Link href="/find" className="text-primary hover:underline">
            Find
          </Link>
          .
        </p>
      ) : (
        professors.map((professor) => (
          <ProfessorCard key={professor.id} professor={professor} saved isSignedIn />
        ))
      )}
    </div>
  );
}
