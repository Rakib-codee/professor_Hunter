import type { ReactNode } from 'react';

interface LegalPageProps {
  title: string;
  updated: string;
  children: ReactNode;
}

// Shared shell for /privacy, /terms, /disclaimer, /data-notice.
export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <article className="prose prose-sm dark:prose-invert mx-auto w-full max-w-2xl [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-medium [&_li]:text-sm [&_p]:text-sm">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground text-xs">Last updated {updated}</p>
      {children}
    </article>
  );
}
