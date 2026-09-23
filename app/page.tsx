import type { Metadata } from 'next';
import { Building2Icon, CalendarDaysIcon, CheckIcon, MailIcon, SendIcon } from 'lucide-react';
import Link from 'next/link';
import { TagFilter } from '@/components/find/tag-filter';
import { SiteHeader } from '@/components/layout/site-header';
import { ProfessorCard } from '@/components/professor/professor-card';
import { RecordStrip } from '@/components/professor/record-strip';
import { buttonVariants } from '@/components/ui/button';
import { FIELDS } from '@/lib/constants';
import { getFacets, getMajorCounts, searchProfessors } from '@/lib/data/professors';
import { getCurrentUserId } from '@/lib/data/students';
import { FIND_DEFAULTS, type FindParams } from '@/lib/find/params';

export const metadata: Metadata = {
  title: 'Professor Hunter — find a CSC supervisor in China',
  description:
    'Browse verified professors at Chinese universities, draft a personalised acceptance-letter request, and track replies. Free, built by students.',
};

const FRAME_FIELD = 'Civil Engineering';
const FRAME_PARAMS: FindParams = { ...FIND_DEFAULTS, tags: ['Geotechnical Engineering'] };

const STEPS = [
  {
    title: 'Fill in your profile',
    body: 'Degree, CGPA, research interests. Takes five minutes and powers every draft.',
  },
  {
    title: 'Pick a professor, draft the email',
    body: 'Reveal the address, generate a first draft from your profile, edit it, send it from your own mail app.',
  },
  {
    title: 'Track the reply',
    body: 'Mark it sent, get a follow-up date, record the answer. You always know where each application stands.',
  },
];

// Browser-style frame around live product UI (reference: product screenshot under the hero).
function BrowserFrame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="card-soft overflow-hidden">
      <div className="bg-muted border-border flex items-center gap-3 border-b px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="bg-border size-2.5 rounded-full" />
          <span className="bg-border size-2.5 rounded-full" />
          <span className="bg-border size-2.5 rounded-full" />
        </span>
        <span className="bg-background text-muted-foreground mx-auto w-full max-w-xs truncate rounded-sm px-3 py-1 text-center text-[12px]">
          {url}
        </span>
      </div>
      <div className="px-4 py-4 md:px-6">{children}</div>
    </div>
  );
}

function FeatureCard({
  tint,
  title,
  body,
  children,
}: {
  tint: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <article className="card-soft flex flex-col overflow-hidden">
      <div className={`flex min-h-44 items-center justify-center p-5 ${tint}`}>
        <div className="card-soft w-full max-w-sm p-4">{children}</div>
      </div>
      <div className="flex flex-col gap-1.5 p-5">
        <h3 className="text-[20px] leading-tight font-semibold">{title}</h3>
        <p className="text-muted-foreground text-[15px] leading-relaxed">{body}</p>
      </div>
    </article>
  );
}

export default async function Home() {
  const [counts, userId, facets, frame] = await Promise.all([
    getMajorCounts().catch(() => ({})),
    getCurrentUserId(),
    Promise.all(FIELDS.map((field) => getFacets(field).catch(() => null))),
    searchProfessors(FRAME_FIELD, FRAME_PARAMS).catch(() => ({ total: 0, items: [] })),
  ]);
  const professors = Object.values(counts).reduce((sum, c) => sum + c.professors, 0);
  const universities = new Set(
    facets.flatMap((facet) => facet?.universities.map((u) => u.id) ?? []),
  ).size;
  const civilFacets = facets[FIELDS.indexOf(FRAME_FIELD)];
  const sample = frame.items[0] ?? null;

  return (
    <>
      <SiteHeader homeHref="/" links={[{ href: '/find', label: 'Browse' }]}>
        <Link href={userId ? '/dashboard' : '/login'} className={buttonVariants({ size: 'sm' })}>
          {userId ? 'Dashboard' : 'Log in'}
        </Link>
      </SiteHeader>
      <main className="flex flex-1 flex-col">
        {/* Hero: centred, eyebrow, two-line headline, subhead with the counts, two CTAs, on a
            faint grid that fades out. The product frame overlaps the grid's tail. */}
        <section className="relative">
          <div className="grid-ground absolute inset-0 -z-10" aria-hidden="true" />
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-5 px-4 pt-12 pb-8 text-center md:pt-20 md:pb-10">
            <span className="enter bg-primary/10 text-primary rounded-full px-3 py-1 text-[12px] font-semibold tracking-[0.08em] uppercase">
              Free for CSC applicants
            </span>
            <h1 className="enter enter-1 font-display max-w-3xl text-[36px] leading-[1.08] tracking-[-0.02em] text-balance md:text-[52px]">
              Find the professor who will say yes to your CSC application
            </h1>
            <p className="enter enter-2 text-muted-foreground tnum max-w-2xl text-[17px] md:text-lg">
              {professors > 0
                ? `${professors} verified professors at ${universities} Chinese universities in Computer Science, Software Engineering and Civil Engineering.`
                : 'Verified professors at Chinese universities in Computer Science, Software Engineering and Civil Engineering.'}{' '}
              Pick one, draft a personalised email, track the reply.
            </p>
            <div className="enter enter-3 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Link
                href={userId ? '/find' : '/signup'}
                className={buttonVariants({ size: 'lg', className: 'sm:min-w-52' })}
              >
                {userId ? 'Find professors' : 'Create a free account'}
              </Link>
              <Link
                href="/find"
                className={buttonVariants({
                  variant: 'outline',
                  size: 'lg',
                  className: 'sm:min-w-52',
                })}
              >
                Browse without an account
              </Link>
            </div>
          </div>
          <div className="enter enter-4 mx-auto w-full max-w-5xl px-4 pb-14 md:px-6">
            <BrowserFrame url="professorhunter.app/find/civil-engineering">
              <div className="flex flex-col gap-3">
                <div>
                  <h2 className="heading-page">{FRAME_FIELD}</h2>
                  {civilFacets ? (
                    <p className="text-muted-foreground tnum mt-1 text-[15px]">
                      {civilFacets.total} professors across {civilFacets.universities.length}{' '}
                      universities
                    </p>
                  ) : null}
                </div>
                {civilFacets ? (
                  <TagFilter
                    basePath="/find/civil-engineering"
                    params={FRAME_PARAMS}
                    tags={civilFacets.tags.slice(0, 6)}
                    untagged={0}
                  />
                ) : null}
                <p className="tnum text-base font-semibold">{frame.total} results</p>
                <div className="ledger border-border border-t">
                  {frame.items.slice(0, 3).map((professor) => (
                    <ProfessorCard
                      key={professor.id}
                      professor={professor}
                      saved={false}
                      isSignedIn={Boolean(userId)}
                    />
                  ))}
                </div>
                <Link
                  href="/find/civil-engineering?tags=Geotechnical+Engineering"
                  className="text-primary self-start text-[15px] font-semibold underline-offset-4 hover:underline"
                >
                  See all {frame.total} in Geotechnical Engineering
                </Link>
              </div>
            </BrowserFrame>
          </div>
        </section>

        {/* Bento: four cards, each with a real piece of the product on a tinted ground. */}
        <section className="bg-muted border-border border-y">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-14 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="heading-page">What you get on every record</h2>
              <p className="text-muted-foreground mt-2 text-[17px]">
                Evidence first, then the tools to act on it.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <FeatureCard
                tint="bg-confirmed/10"
                title="Verified data, with dates"
                body="Every professor shows when their details were last checked, whether the email is a university address, and whether they are known to accept international students."
              >
                {sample ? (
                  <RecordStrip professor={sample} />
                ) : (
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px]">
                    <span className="bg-confirmed text-confirmed-foreground inline-flex items-center gap-1 rounded-sm px-2 py-0.5 font-medium">
                      <CheckIcon className="size-3" aria-hidden="true" /> Accepts international
                      students (official list)
                    </span>
                    <span className="text-muted-foreground inline-flex items-center gap-1">
                      <CalendarDaysIcon className="size-3" aria-hidden="true" /> Verified 22 Sep
                      2026
                    </span>
                    <span className="text-muted-foreground inline-flex items-center gap-1">
                      <Building2Icon className="size-3" aria-hidden="true" /> University email
                    </span>
                  </div>
                )}
              </FeatureCard>
              <FeatureCard
                tint="bg-primary/10"
                title="Drafts written from your profile"
                body="Your CGPA, projects and research interests go into a short first-contact email that references the professor’s actual research area. You edit before sending."
              >
                <div className="flex flex-col gap-2.5">
                  <div className="border-input inline-flex w-fit overflow-hidden rounded-sm border text-[13px] font-medium">
                    <span className="bg-primary text-primary-foreground px-3 py-1">Formal</span>
                    <span className="px-3 py-1">Concise</span>
                  </div>
                  <div className="bg-muted rounded-sm px-3 py-2 text-[14px]">
                    <span className="text-muted-foreground">Subject </span>
                    Prospective PhD applicant, rock mechanics and soil creep
                  </div>
                  <p className="text-[14px] leading-snug">
                    Dear Professor Huang Feng, I am writing to ask whether you would consider…
                  </p>
                </div>
              </FeatureCard>
              <FeatureCard
                tint="bg-caution"
                title="Reveal the email when you are ready"
                body="Addresses come from public faculty pages and are shown one at a time, 30 a day, so the list is never scraped and every reveal is a deliberate step."
              >
                <div className="flex flex-col gap-2">
                  <span
                    className={buttonVariants({
                      size: 'lg',
                      className: 'pointer-events-none w-full',
                    })}
                  >
                    <MailIcon aria-hidden="true" /> Reveal email
                  </span>
                  <p className="text-muted-foreground tnum text-[13px]">
                    3 of 30 reveals used today
                  </p>
                </div>
              </FeatureCard>
              <FeatureCard
                tint="bg-negative"
                title="Reply tracking"
                body="Mark emails as sent, get a follow-up date, and record replies so you know where each application stands."
              >
                <div className="flex flex-col gap-2 text-[14px]">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold">
                      Huang Feng{' '}
                      <span lang="zh-Hans" className="text-muted-foreground font-normal">
                        黄峰
                      </span>
                    </span>
                    <span className="text-confirmed border-confirmed rounded-sm border px-2 py-0.5 text-[13px] font-medium">
                      Replied – positive
                    </span>
                  </div>
                  <div className="text-muted-foreground tnum flex gap-4 text-[13px]">
                    <span>Sent 12 Sep 2026</span>
                    <span>replied 20 Sep 2026</span>
                  </div>
                  <span className="text-primary inline-flex items-center gap-1 text-[13px] font-medium">
                    <SendIcon className="size-3" aria-hidden="true" /> Follow-up set for 10 days
                  </span>
                </div>
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* Trust row: three stat cards, then the honest disclaimer. */}
        <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-14 md:px-6">
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              { figure: professors > 0 ? String(professors) : '—', label: 'professors listed' },
              {
                figure: universities > 0 ? String(universities) : '—',
                label: 'Chinese universities',
              },
              { figure: '100%', label: 'of records carry a last-checked date' },
            ].map((stat) => (
              <div key={stat.label} className="card-soft flex flex-col gap-1 p-6">
                <span className="display-figure text-[40px]">{stat.figure}</span>
                <span className="text-muted-foreground text-[15px]">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="flex gap-4">
                <span className="display-figure text-primary w-7 shrink-0 text-[24px]">
                  {index + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[17px] leading-tight font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground text-[15px] leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-border border-t pt-8">
            <h2 className="heading-section mb-2">Honest disclaimer</h2>
            <p className="text-muted-foreground max-w-3xl text-base leading-relaxed">
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
