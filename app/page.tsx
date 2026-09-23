import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { getMajorCounts } from '@/lib/data/professors';
import { getCurrentUserId } from '@/lib/data/students';

export const metadata: Metadata = {
  title: 'Professor Hunter — find a CSC supervisor in China',
  description:
    'Browse verified professors at Chinese universities, draft a personalised acceptance-letter request, and track replies. Free, built by students.',
};

const DIFFERENTIATORS = [
  {
    title: 'Drafts written from your profile',
    body: 'Your CGPA, projects and research interests go into a short first-contact email that references the professor’s actual research area. You edit before sending.',
  },
  {
    title: 'Verified data, with dates',
    body: 'Every professor shows when their details were last checked, whether the email is a university address, and whether they are known to accept international students.',
  },
  {
    title: 'Reply tracking',
    body: 'Mark emails as sent, get a follow-up date, and record replies so you know where each application stands.',
  },
];

export default async function Home() {
  const [counts, userId] = await Promise.all([
    getMajorCounts().catch(() => ({})),
    getCurrentUserId(),
  ]);
  const professors = Object.values(counts).reduce((sum, c) => sum + c.professors, 0);
  const universities = new Set(Object.values(counts).map((c) => c.universities)).size
    ? Math.max(...Object.values(counts).map((c) => c.universities))
    : 0;

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <span className="font-semibold tracking-tight">Professor Hunter</span>
        <nav className="flex gap-2">
          <Link href="/find" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Browse
          </Link>
          <Link href={userId ? '/dashboard' : '/login'} className={buttonVariants({ size: 'sm' })}>
            {userId ? 'Dashboard' : 'Log in'}
          </Link>
        </nav>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 py-14 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Find a supervisor in China for your CSC application
        </h1>
        <p className="text-muted-foreground max-w-xl">
          {professors > 0
            ? `${professors} professors in Computer Science, Software Engineering and Civil Engineering across ${universities}+ universities.`
            : 'Professors in Computer Science, Software Engineering and Civil Engineering.'}{' '}
          Pick one, draft a personalised email, track the reply. Free.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href={userId ? '/find' : '/signup'} className={buttonVariants({ size: 'lg' })}>
            {userId ? 'Find professors' : 'Create a free account'}
          </Link>
          <Link href="/find" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
            Browse without an account
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-4xl gap-3 px-4 pb-14 sm:grid-cols-3">
        {DIFFERENTIATORS.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="mx-auto w-full max-w-2xl px-4 pb-14 text-sm">
        <h2 className="mb-2 text-base font-medium">Honest disclaimer</h2>
        <p className="text-muted-foreground">
          We are students who went through this process, not agents. Nothing here guarantees
          admission or a scholarship. We are not affiliated with the China Scholarship Council, any
          university or any government. Always confirm details on the official faculty page before
          you apply.
        </p>
      </section>
    </main>
  );
}
