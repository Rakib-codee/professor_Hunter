'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Route-level error boundary. Server errors are already logged; this only shows friendly copy.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[page error]', error.digest ?? error.message);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="heading-page">Something went wrong</h1>
      <p className="text-muted-foreground max-w-md text-[15px]">
        Usually a brief connection problem. Try again; if it keeps happening, tell us via the
        contact link below.
      </p>
      <Button type="button" onClick={reset}>
        Try again
      </Button>
      {error.digest ? (
        <p className="text-muted-foreground text-[13px]">Reference {error.digest}</p>
      ) : null}
    </main>
  );
}
