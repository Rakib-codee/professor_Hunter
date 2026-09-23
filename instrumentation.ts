import * as Sentry from '@sentry/nextjs';

// Server-side error monitoring (PLAN.md §9 week 6). No DSN → Sentry stays off, no overhead.
export async function register() {
  if (!process.env.SENTRY_DSN) return;
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0,
    sendDefaultPii: false,
  });
}

export const onRequestError = Sentry.captureRequestError;
