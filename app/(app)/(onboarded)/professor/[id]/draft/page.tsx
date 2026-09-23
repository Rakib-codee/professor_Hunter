import type { Metadata } from 'next';
import { ChevronLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { DraftEditor } from '@/components/draft/draft-editor';
import { ProfessorName } from '@/components/professor/professor-name';
import { RecordStrip } from '@/components/professor/record-strip';
import { COMPLETENESS_THRESHOLD, FREE_TIER_LIMITS } from '@/lib/constants';
import { getProfessor } from '@/lib/data/professors';
import { getCurrentStudent } from '@/lib/data/students';
import { getServerEnv } from '@/lib/env';
import { computeCompleteness } from '@/lib/profile/completeness';
import { createClient } from '@/lib/supabase/server';
import { displayName } from '@/lib/utils/display';

export const metadata: Metadata = { title: 'Draft email', robots: { index: false } };

const UUID = /^[0-9a-f-]{36}$/i;

async function draftsUsedToday(studentId: string): Promise<number> {
  const supabase = await createClient();
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const { count } = await supabase
    .from('usage_log')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .eq('action', 'generate_draft')
    .gte('created_at', start.toISOString());
  return count ?? 0;
}

export default async function DraftPage({ params }: PageProps<'/professor/[id]/draft'>) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const [student, professor] = await Promise.all([getCurrentStudent(), getProfessor(id)]);
  if (!student) redirect(`/login?next=${encodeURIComponent(`/professor/${id}/draft`)}`);
  if (!professor) notFound();

  const completeness = computeCompleteness(student);
  const isDraftEnabled = getServerEnv().LLM_PROVIDER !== 'none';
  const used = await draftsUsedToday(student.id);

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-[280px_1fr] md:gap-10">
      {/* The record beside the writing (DESIGN.md §3): compact on phones, a column on desktop. */}
      <aside className="bg-muted flex flex-col gap-3 rounded-sm p-4 md:self-start">
        <Link
          href={`/professor/${id}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 self-start text-[15px]"
          aria-label={`Back to ${displayName(professor.name_en, professor.name_cn)}`}
        >
          <ChevronLeftIcon className="size-4" aria-hidden="true" />
          <ProfessorName nameEn={professor.name_en} nameCn={professor.name_cn} />
        </Link>
        <RecordStrip professor={professor} />
        {professor.research_area ? (
          <p className="hidden text-[15px] md:block">{professor.research_area}</p>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-col gap-4">
        <div>
          <h1 className="heading-page">Draft your email</h1>
          <p className="text-muted-foreground mt-1 text-base">
            A first-contact email asking {professor.name_en} for a CSC acceptance letter, built from
            your profile.
          </p>
        </div>

        {!isDraftEnabled ? (
          <p className="border-border rounded-sm border p-4 text-base">
            Draft generation is coming in a few days. You can still reveal the email and write your
            own.
          </p>
        ) : !completeness.isReady ? (
          <p className="border-border rounded-sm border p-4 text-base">
            Your profile is {completeness.score}% complete. Reach {COMPLETENESS_THRESHOLD}% to
            unlock drafts:{' '}
            <Link href="/profile" className="text-primary hover:underline">
              edit profile
            </Link>
            . Missing: {completeness.missing.join(', ')}.
          </p>
        ) : (
          <DraftEditor
            professorId={professor.id}
            professorName={professor.name_en}
            hasEmail={professor.has_email}
            initialQuota={{ used, quota: FREE_TIER_LIMITS.drafts }}
          />
        )}
      </div>
    </div>
  );
}
