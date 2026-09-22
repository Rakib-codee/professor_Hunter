import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { skipOnboardingStep, type OnboardingStep } from '@/actions/profile';
import { AcademicForm } from '@/components/profile/academic-form';
import { BasicForm } from '@/components/profile/basic-form';
import { OnboardingStepper } from '@/components/profile/onboarding-stepper';
import { ResearchForm } from '@/components/profile/research-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentStudent } from '@/lib/data/students';

export const metadata: Metadata = { title: 'Set up your profile' };

const STEP_COPY: Record<OnboardingStep, { title: string; description: string }> = {
  1: { title: 'About you', description: 'Basics that go at the top of every email you send.' },
  2: {
    title: 'Your application',
    description: 'What you are applying for and what you have done.',
  },
  3: { title: 'Your research', description: 'Used to match professors and personalise drafts.' },
};

function parseStep(value: string | string[] | undefined): OnboardingStep {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === '2' ? 2 : raw === '3' ? 3 : 1;
}

export default async function OnboardingPage({ searchParams }: PageProps<'/onboarding'>) {
  const student = await getCurrentStudent();
  if (!student) redirect('/login');
  if (student.onboarding_completed_at) redirect('/dashboard');

  const step = parseStep((await searchParams).step);
  const copy = STEP_COPY[step];
  const skip = skipOnboardingStep.bind(null, step);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <OnboardingStepper current={step} />
      <Card>
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {step === 1 ? <BasicForm student={student} flow="onboarding" /> : null}
          {step === 2 ? <AcademicForm student={student} flow="onboarding" /> : null}
          {step === 3 ? <ResearchForm student={student} flow="onboarding" /> : null}
          {step > 1 ? (
            <form action={skip} className="flex justify-center">
              <Button type="submit" variant="ghost" size="sm">
                Skip for now
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
      <p className="text-muted-foreground text-center text-xs">
        You can change all of this later on your profile page.
      </p>
    </div>
  );
}
