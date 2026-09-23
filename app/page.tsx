import type { Metadata } from 'next';
import Link from 'next/link';
import { MajorPicker } from '@/components/find/major-picker';
import { SiteHeader } from '@/components/layout/site-header';
import { ProfessorCard } from '@/components/professor/professor-card';
import { buttonVariants } from '@/components/ui/button';
import { FIELDS } from '@/lib/constants';
import { getFacets, getMajorCounts, searchProfessors } from '@/lib/data/professors';
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
  const [counts, userId, sample, facets] = await Promise.all([
    getMajorCounts().catch(() => ({})),
    getCurrentUserId(),
    searchProfessors('Civil Engineering', { ...FIND_DEFAULTS, accepts: ['confirmed'] })
      .then((result) => result.items[0] ?? null)
      .catch(() => null),
    Promise.all(FIELDS.map((field) => getFacets(field).catch(() => null))),
  ]);
  const professors = Object.values(counts).reduce((sum, c) => sum + c.professors, 0);
  // Distinct universities across all majors (a university can teach more than one field).
  const universities = new Set(
    facets.flatMap((facet) => facet?.universities.map((u) => u.id) ?? []),
  ).size;

  return (
    <>
      <SiteHeader homeHref="/" links={[{ href: '/find', label: 'Browse' }]}>
        <Link href={userId ? '/dashboard' : '/login'} className={buttonVariants({ size: 'sm' })}>
          {userId ? 'Dashboard' : 'Log in'}
        </Link>
      </SiteHeader>
      <main className="flex flex-1 flex-col">
        {/* First viewport is the tool. Desktop: headline and intro left, major picker right,
            on the same column width as the browse page. Phones stack it. */}
        <section className="mx-auto grid w-full max-w-5xl gap-6 px-4 pt-8 pb-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:content-start md:gap-x-12 md:gap-y-5 md:px-6 md:pt-12 md:pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-3 md:row-span-2">
            <h1 className="font-display text-[40px] leading-[1.05] tracking-[-0.02em] text-balance md:text-[48px] md:leading-none xl:text-[56px]">
              Find a supervisor in China for your CSC application
            </h1>
            {professors > 0 ? (
              <dl className="flex gap-7" aria-label="Coverage">
                <div>
                  <dd className="display-figure text-[36px] md:text-[56px]">{professors}</dd>
                  <dt className="text-muted-foreground mt-1 text-[13px] md:text-[14px]">
                    professors
                  </dt>
                </div>
                <div>
                  <dd className="display-figure text-[36px] md:text-[56px]">{universities}</dd>
                  <dt className="text-muted-foreground mt-1 text-[13px] md:text-[14px]">
                    universities
                  </dt>
                </div>
              </dl>
            ) : null}
            <p className="text-muted-foreground text-base sm:text-lg">
              Computer Science, Software Engineering and Civil Engineering. Pick one, draft a
              personalised email, track the reply. Free.
            </p>
            <div className="mt-2 hidden gap-2 md:flex md:flex-wrap">
              {[
                {
                  href: userId ? '/find' : '/signup',
                  label: userId ? 'Find professors' : 'Create a free account',
                  variant: undefined,
                },
                { href: '/find', label: 'Browse without an account', variant: 'outline' as const },
              ].map((cta) => (
                <Link
                  key={cta.label}
                  href={cta.href}
                  className={buttonVariants({
                    variant: cta.variant,
                    size: 'lg',
                    className: 'sm:min-w-56',
                  })}
                >
                  {cta.label}
                </Link>
              ))}
            </div>
          </div>
          <MajorPicker counts={counts} preferredField={null} />
          <p className="text-muted-foreground text-[15px]">
            Data from public faculty pages. Every record shows when it was last checked.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row md:hidden">
            {[
              {
                href: userId ? '/find' : '/signup',
                label: userId ? 'Find professors' : 'Create a free account',
                variant: undefined,
              },
              { href: '/find', label: 'Browse without an account', variant: 'outline' as const },
            ].map((cta) => (
              <Link
                key={cta.label}
                href={cta.href}
                className={buttonVariants({
                  variant: cta.variant,
                  size: 'lg',
                  className: 'sm:min-w-56',
                })}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </section>

        {/* One real record explains the product better than feature cards. */}
        <section className="bg-muted border-border border-y">
          <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1fr_1fr] md:gap-12 md:px-6">
            <div className="flex flex-col gap-3">
              <h2 className="heading-section">What you see on every record</h2>
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

        <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 md:px-6">
          <h2 className="heading-section">How it works</h2>
          <ol className="ledger border-border tnum border-y">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-4 py-4 text-base leading-relaxed">
                <span className="text-primary w-6 shrink-0 font-semibold">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div>
            <h2 className="heading-section mb-2">Honest disclaimer</h2>
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
