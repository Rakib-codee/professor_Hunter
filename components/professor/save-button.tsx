'use client';

import { HeartIcon } from 'lucide-react';
import Link from 'next/link';
import { useOptimistic, useTransition } from 'react';
import { toggleSaved } from '@/actions/professors';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from 'cn';

interface SaveButtonProps {
  professorId: string;
  saved: boolean;
  /** null when signed out: the button becomes a login link. */
  isSignedIn: boolean;
  size?: 'icon-sm' | 'default';
}

export function SaveButton({ professorId, saved, isSignedIn, size = 'icon-sm' }: SaveButtonProps) {
  const [optimistic, setOptimistic] = useOptimistic(saved);
  const [pending, startTransition] = useTransition();

  if (!isSignedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/professor/${professorId}`)}`}
        className={buttonVariants({ variant: 'ghost', size })}
        aria-label="Log in to save"
      >
        <HeartIcon />
        {size === 'default' ? 'Save' : null}
      </Link>
    );
  }

  const toggle = () =>
    startTransition(async () => {
      setOptimistic(!optimistic);
      const result = await toggleSaved(professorId, !optimistic);
      if (!result.ok) setOptimistic(optimistic);
    });

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={toggle}
      disabled={pending}
      aria-pressed={optimistic}
      aria-label={optimistic ? 'Remove from saved' : 'Save professor'}
    >
      <HeartIcon className={cn(optimistic && 'text-primary fill-current')} />
      {size === 'default' ? (optimistic ? 'Saved' : 'Save') : null}
    </Button>
  );
}
