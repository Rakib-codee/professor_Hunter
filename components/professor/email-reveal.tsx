'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { revealEmail, type RevealResult } from '@/actions/professors';
import { Button } from '@/components/ui/button';
import { emailTypeLabel } from '@/lib/utils/display';

interface EmailRevealProps {
  professorId: string;
  hasEmail: boolean;
  isSignedIn: boolean;
}

// Email is only ever fetched through reveal_professor_email() (30/day). Never rendered from props.
export function EmailReveal({ professorId, hasEmail, isSignedIn }: EmailRevealProps) {
  const [result, setResult] = useState<RevealResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!hasEmail) {
    return (
      <p className="text-muted-foreground text-sm">
        No email on file. Check the source page or the university directory.
      </p>
    );
  }
  if (!isSignedIn) {
    return (
      <Button
        render={<Link href={`/login?next=${encodeURIComponent(`/professor/${professorId}`)}`} />}
      >
        Log in to reveal email
      </Button>
    );
  }
  if (result?.email) {
    return (
      <div className="flex flex-col gap-1">
        <a
          href={`mailto:${result.email}`}
          className="text-primary font-medium break-all hover:underline"
        >
          {result.email}
        </a>
        <p className="text-muted-foreground text-xs">
          {emailTypeLabel(result.emailType)} · {result.used} of {result.limit} reveals used today
        </p>
      </div>
    );
  }

  const reveal = () =>
    startTransition(async () => {
      setError(null);
      const response = await revealEmail(professorId);
      if (response.ok && response.data) setResult(response.data);
      else setError(response.error ?? 'Something went wrong.');
    });

  return (
    <div className="flex flex-col gap-1">
      <Button type="button" onClick={reveal} disabled={pending}>
        {pending ? 'Revealing…' : 'Reveal email'}
      </Button>
      {error ? (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : (
        <p className="text-muted-foreground text-xs">Counts toward your 30 reveals per day.</p>
      )}
    </div>
  );
}
