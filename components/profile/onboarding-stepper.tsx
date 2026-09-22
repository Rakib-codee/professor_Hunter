import { cn } from 'cn';

const STEPS = ['Basics', 'Academic', 'Research'] as const;

interface OnboardingStepperProps {
  current: number;
}

export function OnboardingStepper({ current }: OnboardingStepperProps) {
  return (
    <ol className="flex items-center gap-2 text-xs" aria-label="Onboarding progress">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const state = step < current ? 'done' : step === current ? 'current' : 'todo';
        return (
          <li
            key={label}
            className="flex items-center gap-2"
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span
              className={cn(
                'flex size-5 items-center justify-center rounded-full border text-[10px] font-medium',
                state === 'current' && 'bg-primary text-primary-foreground border-primary',
                state === 'done' && 'bg-muted border-border',
                state === 'todo' && 'text-muted-foreground border-border',
              )}
            >
              {step}
            </span>
            <span className={cn(state === 'todo' && 'text-muted-foreground')}>{label}</span>
            {index < STEPS.length - 1 ? <span className="bg-border h-px w-4" aria-hidden /> : null}
          </li>
        );
      })}
    </ol>
  );
}
