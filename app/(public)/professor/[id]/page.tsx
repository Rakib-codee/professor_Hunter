import type { Metadata } from 'next';
import { ChevronLeftIcon, ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DraftGate } from '@/components/professor/draft-gate';
import { EmailReveal } from '@/components/professor/email-reveal';
import { LastViewedRecorder } from '@/components/professor/last-viewed-recorder';
import { ProfessorName } from '@/components/professor/professor-name';
import { RecordStrip } from '@/components/professor/record-strip';
import { ReplyRateLine } from '@/components/professor/reply-rate-line';
import { ReportDialog } from '@/components/professor/report-dialog';
import { SaveButton } from '@/components/professor/save-button';
import { TagChips } from '@/components/professor/tag-chips';
import { slugForField, type Field } from '@/lib/constants';
import { getProfessor, getReplyStats, getSavedIds } from '@/lib/data/professors';
import { getCurrentStudent } from '@/lib/data/students';
import { getServerEnv } from '@/lib/env';
import { computeCompleteness } from '@/lib/profile/completeness';
import { sourceLabel, verifiedLabel } from '@/lib/utils/display';

const UUID = /^[0-9a-f-]{36}$/i;

export async function generateMetadata({
  params,
}: PageProps<'/professor/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const professor = UUID.test(id) ? await getProfessor(id) : null;
  return { title: professor ? professor.name_en : 'Professor', robots: { index: false } };
}

// A record sheet (DESIGN.md §3): name, the record strip, then a label/value list. The two
// real actions (reveal, draft) sit in a bar pinned to the bottom of the screen on phones.
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-border grid grid-cols-[7.5rem_1fr] border-b sm:grid-cols-[10rem_1fr]">
      <dt className="bg-muted text-muted-foreground px-3 py-2.5 text-[13px] font-medium">
        {label}
      </dt>
      <dd className="px-3 py-2.5 text-base">{children}</dd>
    </div>
  );
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
  const verified = verifiedLabel(professor.last_verified, professor.last_verified_on);
  const backHref = professor.field ? `/find/${slugForField(professor.field as Field)}` : '/find';

  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col gap-5 max-md:pb-44">
      {student ? <LastViewedRecorder professorId={professor.id} /> : null}
      <Link
        href={backHref}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 self-start text-[15px]"
      >
        <ChevronLeftIcon className="size-4" aria-hidden="true" />
        Back to {professor.field ?? 'list'}
      </Link>

      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[30px] leading-[1.1] md:text-[40px] md:leading-[1.05]">
            <ProfessorName nameEn={professor.name_en} nameCn={professor.name_cn} />
          </h1>
          {professor.title ? (
            <p className="text-muted-foreground text-base">{professor.title}</p>
          ) : null}
        </div>
        <SaveButton
          professorId={professor.id}
          saved={savedIds.has(professor.id)}
          isSignedIn={Boolean(student)}
          size="default"
        />
      </header>

      <RecordStrip professor={professor} />

      <dl className="border-border border-t">
        {professor.university_name ? (
          <Row label="University">{professor.university_name}</Row>
        ) : null}
        {professor.school ? <Row label="School">{professor.school}</Row> : null}
        {professor.province ? <Row label="Province">{professor.province}</Row> : null}
        {professor.research_area ? (
          <Row label="Research area">{professor.research_area}</Row>
        ) : null}
        {professor.research_tags.length > 0 ? (
          <Row label="Tags">
            <TagChips tags={professor.research_tags} />
          </Row>
        ) : null}
        <Row label="Source">
          {source.href ? (
            <a
              href={source.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary inline-flex items-center gap-1 underline underline-offset-4"
            >
              {source.text}
              <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
            </a>
          ) : (
            <span className="text-muted-foreground">{source.text}</span>
          )}
        </Row>
        <Row label="Last checked">
          <span className="tnum">
            {verified.text.replace(/^Verified /, '')}
            {verified.isStale ? ' (may be outdated)' : ''}
          </span>
        </Row>
      </dl>

      <ReplyRateLine stats={stats} />

      <section
        aria-label="Contact"
        className="bg-background border-border flex flex-col gap-3 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-10 max-md:border-t max-md:px-4 max-md:py-3 md:border-y md:py-4"
      >
        <h2 className="sr-only">Contact</h2>
        <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
          <EmailReveal
            professorId={professor.id}
            hasEmail={professor.has_email}
            isSignedIn={Boolean(student)}
          />
          <DraftGate
            professorId={professor.id}
            isSignedIn={Boolean(student)}
            completeness={completeness}
            isDraftEnabled={isDraftEnabled}
          />
        </div>
        <p className="text-muted-foreground text-[13px]">
          Edit before sending — professors recognise template emails.
        </p>
      </section>

      <footer className="flex items-center justify-between">
        <ReportDialog professorId={professor.id} isSignedIn={Boolean(student)} />
      </footer>
    </article>
  );
}
