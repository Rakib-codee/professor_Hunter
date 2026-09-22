import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AcceptsBadge, EmailTypeBadge, VerifiedBadge } from '@/components/professor/badges';
import { DraftGate } from '@/components/professor/draft-gate';
import { EmailReveal } from '@/components/professor/email-reveal';
import { LastViewedRecorder } from '@/components/professor/last-viewed-recorder';
import { ReplyRateLine } from '@/components/professor/reply-rate-line';
import { ReportDialog } from '@/components/professor/report-dialog';
import { SaveButton } from '@/components/professor/save-button';
import { TagChips } from '@/components/professor/tag-chips';
import { slugForField, type Field } from '@/lib/constants';
import { getProfessor, getReplyStats, getSavedIds } from '@/lib/data/professors';
import { getCurrentStudent } from '@/lib/data/students';
import { getServerEnv } from '@/lib/env';
import { computeCompleteness } from '@/lib/profile/completeness';
import { displayName, sourceLabel } from '@/lib/utils/display';

const UUID = /^[0-9a-f-]{36}$/i;

export async function generateMetadata({
  params,
}: PageProps<'/professor/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const professor = UUID.test(id) ? await getProfessor(id) : null;
  return { title: professor ? professor.name_en : 'Professor', robots: { index: false } };
}

export default async function ProfessorPage({ params }: PageProps<'/professor/[id]'>) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const [professor, student, stats] = await Promise.all([
    getProfessor(id),
    getCurrentStudent(),
    getReplyStats(id),
  ]);
  if (!professor) notFound();

  const savedIds = student ? await getSavedIds(student.id) : new Set<string>();
  const completeness = student ? computeCompleteness(student).score : null;
  const isDraftEnabled = getServerEnv().LLM_PROVIDER !== 'none';
  const source = sourceLabel(professor.source_url);
  const backHref = professor.field ? `/find/${slugForField(professor.field as Field)}` : '/find';

  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      {student ? <LastViewedRecorder professorId={professor.id} /> : null}
      <Link href={backHref} className="text-muted-foreground text-sm hover:underline">
        ← Back to {professor.field ?? 'list'}
      </Link>

      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {displayName(professor.name_en, professor.name_cn)}
          </h1>
          {professor.title ? <p className="text-muted-foreground">{professor.title}</p> : null}
          <p>
            {professor.university_name}
            {professor.school ? ` · ${professor.school}` : ''}
            {professor.province ? ` · ${professor.province}` : ''}
          </p>
        </div>
        <SaveButton
          professorId={professor.id}
          saved={savedIds.has(professor.id)}
          isSignedIn={Boolean(student)}
          size="default"
        />
      </header>

      <div className="flex flex-wrap gap-1.5">
        <AcceptsBadge value={professor.accepts_intl} />
        <VerifiedBadge raw={professor.last_verified} parsed={professor.last_verified_on} />
        <EmailTypeBadge value={professor.email_type} hasEmail={professor.has_email} />
      </div>

      {professor.research_area ? (
        <section>
          <h2 className="mb-1 text-sm font-medium">Research area</h2>
          <p className="text-sm">{professor.research_area}</p>
        </section>
      ) : null}
      <TagChips tags={professor.research_tags} />

      <section className="flex flex-col gap-3 rounded-xl border p-4">
        <h2 className="text-sm font-medium">Contact</h2>
        <EmailReveal
          professorId={professor.id}
          hasEmail={professor.has_email}
          isSignedIn={Boolean(student)}
        />
        <p className="text-muted-foreground text-xs">
          Source:{' '}
          {source.href ? (
            <a href={source.href} target="_blank" rel="noopener noreferrer" className="underline">
              {source.text}
            </a>
          ) : (
            source.text
          )}
        </p>
        <ReplyRateLine stats={stats} />
      </section>

      <section className="flex flex-col gap-2">
        <DraftGate
          professorId={professor.id}
          isSignedIn={Boolean(student)}
          completeness={completeness}
          isDraftEnabled={isDraftEnabled}
        />
        <p className="text-muted-foreground text-xs">
          Edit before sending — professors recognise template emails.
        </p>
      </section>

      <footer className="flex items-center justify-between">
        <ReportDialog professorId={professor.id} isSignedIn={Boolean(student)} />
      </footer>
    </article>
  );
}
