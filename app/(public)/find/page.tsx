import type { Metadata } from 'next';
import { MajorPicker } from '@/components/find/major-picker';
import { getMajorCounts } from '@/lib/data/professors';
import { getCurrentStudent } from '@/lib/data/students';

export const metadata: Metadata = {
  title: 'Find professors in China by major',
  description:
    'Browse professors in Computer Science, Software Engineering and Civil Engineering at Chinese universities. Verified details for CSC scholarship applicants.',
  alternates: { canonical: '/find' },
};

export default async function FindPage() {
  const [counts, student] = await Promise.all([getMajorCounts(), getCurrentStudent()]);
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pick your major</h1>
        <p className="text-muted-foreground text-sm">
          Browse without an account. Emails need a login.
        </p>
      </div>
      <MajorPicker counts={counts} preferredField={student?.target_field ?? null} />
    </div>
  );
}
