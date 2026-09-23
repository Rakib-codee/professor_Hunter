import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CompletenessBar } from '@/components/profile/completeness-bar';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        <h1 className="text-2xl font-semibold tracking-tight">
          {firstName ? `Hi ${firstName}` : 'Dashboard'}
        </h1>
        <CompletenessBar result={completeness} />
      </div>

      {resume ? (
        <Link href={`/professor/${resume.id}`} className="block">
          <Card size="sm" className="hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardDescription>Resume where you left off</CardDescription>
              <CardTitle>
                {resume.name_en}
                {resume.university_name ? ` · ${resume.university_name}` : ''}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ) : null}

      {due.length > 0 ? (
        <section className="flex flex-col gap-2 rounded-xl border p-4" aria-label="Follow-ups due">
          <h2 className="text-sm font-medium">Follow-ups due</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {due.map((item) => (
              <li key={item.id} className="flex justify-between gap-2">
                <Link href={`/professor/${item.professor_id}`} className="hover:underline">
                  {item.professor_name ?? 'Professor'}
                </Link>
                <span className="text-muted-foreground text-xs">
                  sent {item.sent_on} · due {item.follow_up_on}
                </span>
              </li>
            ))}
          </ul>
          <Link href="/tracker" className="text-primary text-xs hover:underline">
            Open tracker
          </Link>
        </section>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/find" className="block">
          <Card className="hover:bg-muted/50 h-full transition-colors">
            <CardHeader>
              <CardTitle>Find professors</CardTitle>
              <CardDescription>Browse by major, research tag and university.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/tracker" className="block">
          <Card className="hover:bg-muted/50 h-full transition-colors">
            <CardHeader>
              <CardTitle>My tracker</CardTitle>
              <CardDescription>
                {counts.sent} sent · {counts.replied} replied · {counts.noReply} no reply
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/profile" className="block">
          <Card className="hover:bg-muted/50 h-full transition-colors">
            <CardHeader>
              <CardTitle>Edit profile</CardTitle>
              <CardDescription>
                {completeness.isReady
                  ? 'Keep it current for better drafts.'
                  : 'Finish it to unlock drafts.'}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
