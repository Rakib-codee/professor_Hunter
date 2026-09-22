import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
      <Button
        variant="outline"
        render={
          <Link href={`/login?next=${encodeURIComponent(`/professor/${professorId}/draft`)}`} />
        }
      >
        Log in to draft an email
      </Button>
    );
  }
  if (!isDraftEnabled) {
    return (
      <div className="flex flex-col gap-1">
        <Button variant="outline" disabled>
          Draft email
        </Button>
        <p className="text-muted-foreground text-xs">Draft generation is coming in a few days.</p>
      </div>
    );
  }
  if ((completeness ?? 0) < COMPLETENESS_THRESHOLD) {
    return (
      <div className="flex flex-col gap-1">
        <Button variant="outline" disabled>
          Draft email
        </Button>
        <p className="text-muted-foreground text-xs">
          Complete your profile to {COMPLETENESS_THRESHOLD}% first.{' '}
          <Link href="/profile" className="text-primary hover:underline">
            Edit profile
          </Link>
        </p>
      </div>
    );
  }
  return <Button render={<Link href={`/professor/${professorId}/draft`} />}>Draft email</Button>;
}
