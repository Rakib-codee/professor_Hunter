import type { ReactNode } from 'react';

interface LegalPageProps {
  title: string;
  updated: string;
  children: ReactNode;
}

// Shared shell for /privacy, /terms, /disclaimer, /data-notice.
export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <article className="mx-auto w-full max-w-[640px] text-base leading-relaxed [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-[20px] [&_h2]:leading-tight [&_h2]:font-semibold [&_li]:mb-1 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5">
      <h1 className="text-[26px] leading-tight font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground tnum mb-6 text-[13px]">Last updated {updated}</p>
      {children}
    </article>
  );
}
