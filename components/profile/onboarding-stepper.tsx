import { cn } from 'cn';

const STEPS = ['Basics', 'Academic', 'Research'] as const;

interface OnboardingStepperProps {
  current: number;
}

export function OnboardingStepper({ current }: OnboardingStepperProps) {
  return (
    // Three segments (DESIGN.md §3): Cobalt for done and current, Rule for to-do.
    <ol className="grid grid-cols-3 gap-2 text-[13px]" aria-label="Onboarding progress">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const state = step < current ? 'done' : step === current ? 'current' : 'todo';
        return (
          <li
            key={label}
            className="flex flex-col gap-1.5"
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span
              className={cn(
                'block h-1.5 rounded-sm',
                state === 'todo' ? 'bg-border' : 'bg-primary',
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                'tnum',
                state === 'current' ? 'text-primary font-semibold' : 'text-muted-foreground',
              )}
            >
              {step}. {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
