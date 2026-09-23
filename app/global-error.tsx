'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

// Root-layout failure boundary. Must render its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem 1rem', textAlign: 'center' }}
      >
        <h1>Something went wrong</h1>
        <p>
          Please reload the page. If it keeps happening, email professorhunter.help@outlook.com.
        </p>
        <button type="button" onClick={reset} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          Try again
        </button>
      </body>
    </html>
  );
}
