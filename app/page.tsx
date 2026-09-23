import type { Metadata } from 'next';
import Link from 'next/link';
import { MajorPicker } from '@/components/find/major-picker';
import { SiteHeader } from '@/components/layout/site-header';
import { ProfessorCard } from '@/components/professor/professor-card';
import { buttonVariants } from '@/components/ui/button';
import { getMajorCounts, searchProfessors } from '@/lib/data/professors';
import { getCurrentUserId } from '@/lib/data/students';
import { FIND_DEFAULTS } from '@/lib/find/params';

export const metadata: Metadata = {
  title: 'Professor Hunter — find a CSC supervisor in China',
  description:
    'Browse verified professors at Chinese universities, draft a personalised acceptance-letter request, and track replies. Free, built by students.',
};

// The three product points, now shown as callouts next to a real record (DESIGN.md §3 landing).
const CALLOUTS = [
  {
    title: 'Verified data, with dates',
    body: 'Every professor shows when their details were last checked, whether the email is a university address, and whether they are known to accept international students.',
  },
  {
    title: 'Drafts written from your profile',
    body: 'Your CGPA, projects and research interests go into a short first-contact email that references the professor’s actual research area. You edit before sending.',
  },
  {
    title: 'Reply tracking',
    body: 'Mark emails as sent, get a follow-up date, and record replies so you know where each application stands.',
  },
];

const STEPS = [
  'Create a free account and fill in your profile: degree, CGPA, research interests.',
  'Pick a professor, reveal the email, and generate a draft you edit before sending from your own mail app.',
  'Mark it as sent, get a follow-up date, and record the reply in your tracker.',
];

export default async function Home() {
  const [counts, userId, sample] = await Promise.all([
    getMajorCounts().catch(() => ({})),
    getCurrentUserId(),
    searchProfessors('Civil Engineering', { ...FIND_DEFAULTS, accepts: ['confirmed'] })
      .then((result) => result.items[0] ?? null)
      .catch(() => null),
  ]);
  const professors = Object.values(counts).reduce((sum, c) => sum + c.professors, 0);
  const universities = new Set(Object.values(counts).map((c) => c.universities)).size
    ? Math.max(...Object.values(counts).map((c) => c.universities))
    : 0;

  return (
    <>
      <SiteHeader homeHref="/" links={[{ href: '/find', label: 'Browse' }]}>
        <Link href={userId ? '/dashboard' : '/login'} className={buttonVariants({ size: 'sm' })}>
          {userId ? 'Dashboard' : 'Log in'}
        </Link>
      </SiteHeader>
      <main className="flex flex-1 flex-col">
        {/* First viewport is the tool: headline, live counts, the major picker. */}
        <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-10 pb-12">
          <div className="flex flex-col gap-3">
            <h1 className="text-[32px] leading-[1.15] font-semibold tracking-tight sm:text-[40px]">
              Find a supervisor in China for your CSC application
            </h1>
            <p className="text-muted-foreground tnum text-base sm:text-lg">
              {professors > 0
                ? `${professors} professors in Computer Science, Software Engineering and Civil Engineering across ${universities}+ universities.`
                : 'Professors in Computer Science, Software Engineering and Civil Engineering.'}{' '}
              Pick one, draft a personalised email, track the reply. Free.
            </p>
          </div>
          <MajorPicker counts={counts} preferredField={null} />
          <p className="text-muted-foreground text-[15px]">
            Data from public faculty pages. Every record shows when it was last checked.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={userId ? '/find' : '/signup'}
              className={buttonVariants({ size: 'lg', className: 'sm:min-w-56' })}
            >
              {userId ? 'Find professors' : 'Create a free account'}
            </Link>
            <Link
              href="/find"
              className={buttonVariants({
                variant: 'outline',
                size: 'lg',
                className: 'sm:min-w-56',
              })}
            >
              Browse without an account
            </Link>
          </div>
        </section>

        {/* One real record explains the product better than feature cards. */}
        <section className="bg-muted border-border border-y">
          <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-12 md:grid-cols-[1fr_1fr] md:gap-12">
            <div className="flex flex-col gap-3">
              <h2 className="text-[20px] leading-tight font-semibold">
                What you see on every record
              </h2>
              {sample ? (
                <div className="bg-background border-border rounded-sm border px-4">
                  <ProfessorCard professor={sample} saved={false} isSignedIn={Boolean(userId)} />
                </div>
              ) : null}
            </div>
            <ol className="flex flex-col gap-5">
              {CALLOUTS.map((item) => (
                <li key={item.title} className="flex flex-col gap-1">
                  <h3 className="text-[17px] leading-tight font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground text-[15px] leading-relaxed">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
          <h2 className="text-[20px] leading-tight font-semibold">How it works</h2>
          <ol className="ledger border-border tnum border-y">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-4 py-4 text-base leading-relaxed">
                <span className="text-primary w-6 shrink-0 font-semibold">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div>
            <h2 className="mb-2 text-[20px] leading-tight font-semibold">Honest disclaimer</h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              We are students who went through this process, not agents. Nothing here guarantees
              admission or a scholarship. We are not affiliated with the China Scholarship Council,
              any university or any government. Always confirm details on the official faculty page
              before you apply.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
