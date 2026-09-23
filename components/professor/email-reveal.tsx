'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { revealEmail, type RevealResult } from '@/actions/professors';
import { Button, buttonVariants } from '@/components/ui/button';
import { emailTypeLabel } from '@/lib/utils/display';
import { cn } from 'cn';

interface EmailRevealProps {
  professorId: string;
  hasEmail: boolean;
  isSignedIn: boolean;
  /** Called with the revealed address (the draft page uses it for the mailto link). */
  onReveal?: (email: string) => void;
}

// Email is only ever fetched through reveal_professor_email() (30/day). Never rendered from props.
export function EmailReveal({ professorId, hasEmail, isSignedIn, onReveal }: EmailRevealProps) {
  const [result, setResult] = useState<RevealResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!hasEmail) {
    return (
      <p className="text-muted-foreground text-[15px]">
        No email on file. Check the source page or the university directory.
      </p>
    );
  }
  if (!isSignedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/professor/${professorId}`)}`}
        className={buttonVariants({ size: 'lg', className: 'w-full' })}
      >
        Log in to reveal email
      </Link>
    );
  }
  if (result?.email) {
    return (
      <div className="enter flex flex-col gap-1">
        <a
          href={`mailto:${result.email}`}
          className="text-primary font-medium break-all hover:underline"
        >
          {result.email}
        </a>
        <p className="text-muted-foreground tnum flex flex-wrap gap-x-3 text-[13px]">
          <span>{emailTypeLabel(result.emailType)}</span>
          <span>
            {result.used} of {result.limit} reveals used today
          </span>
        </p>
      </div>
    );
  }

  const reveal = () =>
    startTransition(async () => {
      setError(null);
      const response = await revealEmail(professorId);
      if (response.ok && response.data) {
        setResult(response.data);
        if (response.data.email) onReveal?.(response.data.email);
      } else {
        setError(response.error ?? 'Something went wrong.');
      }
    });

  return (
    <div className="flex flex-col gap-1">
      <Button type="button" size="lg" className="w-full" onClick={reveal} disabled={pending}>
        <span className={cn(pending && 'busy-pulse')}>
          {pending ? 'Revealing…' : 'Reveal email'}
        </span>
      </Button>
      {error ? (
        <p role="alert" className="text-destructive text-[13px]">
          {error}
        </p>
      ) : (
        <p className="text-muted-foreground text-[13px]">Counts toward your 30 reveals per day.</p>
      )}
    </div>
  );
}
