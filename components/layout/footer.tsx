import Link from 'next/link';
import { getPublicEnv } from '@/lib/env';

// Disclaimer on every page (PLAN.md §6, product rule). Contact address comes from env.
export function Footer() {
  const { NEXT_PUBLIC_CONTACT_EMAIL } = getPublicEnv();
  return (
    <footer className="border-border text-muted-foreground mt-auto border-t px-4 py-6 text-xs">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
        <p>
          Professor Hunter is run by students, not agents. We are not affiliated with the China
          Scholarship Council, any university or any government, and we cannot guarantee admission
          or a reply. Professor details come from public faculty pages and may be out of date.
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Legal">
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/disclaimer" className="hover:underline">
            Disclaimer
          </Link>
          <Link href="/data-notice" className="hover:underline">
            Notice for professors
          </Link>
          <a href={`mailto:${NEXT_PUBLIC_CONTACT_EMAIL}`} className="hover:underline">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
