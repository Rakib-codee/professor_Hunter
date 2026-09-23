import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CompletenessBar } from '@/components/profile/completeness-bar';
import { ChevronRightIcon } from 'lucide-react';
import { getDueFollowUps } from '@/lib/data/outreach';
import { getCurrentStudent, getResumeProfessor, getTrackerCounts } from '@/lib/data/students';
import { computeCompleteness } from '@/lib/profile/completeness';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const student = await getCurrentStudent();
  if (!student) redirect('/login');

  const [counts, resume, due] = await Promise.all([
    getTrackerCounts(student.id),
    getResumeProfessor(student.last_viewed_professor_id),
    getDueFollowUps(student.id),
  ]);
  const completeness = computeCompleteness(student);
  const firstName = student.full_name?.split(' ')[0];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="heading-page">{firstName ? `Hi ${firstName}` : 'Dashboard'}</h1>
        <CompletenessBar result={completeness} />
      </div>

      {resume ? (
        <Link
          href={`/professor/${resume.id}`}
          className="card-soft hover:bg-muted flex items-center justify-between gap-3 px-5 py-4 transition-colors"
        >
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-[13px]">Resume where you left off</span>
            <span className="text-lg leading-tight font-semibold">{resume.name_en}</span>
            {resume.university_name ? (
              <span className="text-[15px]">{resume.university_name}</span>
            ) : null}
          </span>
          <ChevronRightIcon className="text-muted-foreground size-5 shrink-0" aria-hidden="true" />
        </Link>
      ) : null}

      {due.length > 0 ? (
        <section
          className="border-l-primary flex flex-col gap-2 border-l-[3px] pl-4"
          aria-label="Follow-ups due"
        >
          <h2 className="text-[15px] font-semibold">Follow-ups due</h2>
          <ul className="flex flex-col gap-1.5 text-[15px]">
            {due.map((item) => (
              <li key={item.id} className="flex flex-wrap justify-between gap-x-3 gap-y-0.5">
                <Link
                  href={`/professor/${item.professor_id}`}
                  className="hover:text-primary underline-offset-4 hover:underline"
                >
                  {item.professor_name ?? 'Professor'}
                </Link>
                <span className="text-muted-foreground tnum flex gap-x-3 text-[13px]">
                  <span>sent {item.sent_on}</span>
                  <span className="text-primary">due {item.follow_up_on}</span>
                </span>
              </li>
            ))}
          </ul>
          <Link href="/tracker" className="text-primary text-[15px] underline underline-offset-4">
            Open tracker
          </Link>
        </section>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-3">
        {[
          {
            href: '/find',
            title: 'Find professors',
            meta: 'Browse by major, research tag and university.',
          },
          {
            href: '/tracker',
            title: 'My tracker',
            meta: `${counts.sent} sent, ${counts.replied} replied, ${counts.noReply} no reply`,
          },
          {
            href: '/profile',
            title: 'Edit profile',
            meta: completeness.isReady
              ? 'Keep it current for better drafts.'
              : 'Finish it to unlock drafts.',
          },
        ].map((entry) => (
          <li key={entry.href}>
            <Link
              href={entry.href}
              className="card-soft hover:bg-muted flex h-full items-center justify-between gap-4 p-5 transition-colors"
            >
              <span className="flex flex-col gap-1">
                <span className="text-lg leading-tight font-semibold">{entry.title}</span>
                <span className="text-muted-foreground tnum text-[15px]">{entry.meta}</span>
              </span>
              <ChevronRightIcon
                className="text-muted-foreground size-5 shrink-0"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
