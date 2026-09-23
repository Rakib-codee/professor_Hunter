import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { COMPLETENESS_THRESHOLD } from '@/lib/constants';

interface DraftGateProps {
  professorId: string;
  isSignedIn: boolean;
  /** Completeness score, null when signed out. */
  completeness: number | null;
  /** False when no LLM provider is configured (PLAN Q7: honest "coming soon"). */
  isDraftEnabled: boolean;
}

export function DraftGate({
  professorId,
  isSignedIn,
  completeness,
  isDraftEnabled,
}: DraftGateProps) {
  if (!isSignedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/professor/${professorId}/draft`)}`}
        className={buttonVariants({ variant: 'outline', size: 'lg', className: 'w-full' })}
      >
        Log in to draft an email
      </Link>
    );
  }
  if (!isDraftEnabled) {
    return (
      <div className="flex flex-col gap-1">
        <Button variant="outline" size="lg" className="w-full" disabled>
          Draft email
        </Button>
        <p className="text-muted-foreground text-[13px]">
          Draft generation is coming in a few days.
        </p>
      </div>
    );
  }
  if ((completeness ?? 0) < COMPLETENESS_THRESHOLD) {
    return (
      <div className="flex flex-col gap-1">
        <Button variant="outline" size="lg" className="w-full" disabled>
          Draft email
        </Button>
        <p className="text-muted-foreground text-[13px]">
          Complete your profile to {COMPLETENESS_THRESHOLD}% first.{' '}
          <Link href="/profile" className="text-primary hover:underline">
            Edit profile
          </Link>
        </p>
      </div>
    );
  }
  return (
    <Link
      href={`/professor/${professorId}/draft`}
      className={buttonVariants({ size: 'lg', className: 'w-full' })}
    >
      Draft email
    </Link>
  );
}
