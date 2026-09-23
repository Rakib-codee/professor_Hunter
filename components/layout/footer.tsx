import Link from 'next/link';
import { getPublicEnv } from '@/lib/env';

// Disclaimer on every page (PLAN.md §6, product rule). Contact address comes from env.
export function Footer() {
  const { NEXT_PUBLIC_CONTACT_EMAIL } = getPublicEnv();
  return (
    <footer className="border-border text-muted-foreground mt-auto border-t px-4 py-8 text-[15px] leading-relaxed">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <p>
          Professor Hunter is run by students, not agents. We are not affiliated with the China
          Scholarship Council, any university or any government, and we cannot guarantee admission
          or a reply. Professor details come from public faculty pages and may be out of date.
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal">
          <Link
            href="/privacy"
            className="text-foreground decoration-border hover:decoration-primary underline underline-offset-4"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-foreground decoration-border hover:decoration-primary underline underline-offset-4"
          >
            Terms
          </Link>
          <Link
            href="/disclaimer"
            className="text-foreground decoration-border hover:decoration-primary underline underline-offset-4"
          >
            Disclaimer
          </Link>
          <Link
            href="/data-notice"
            className="text-foreground decoration-border hover:decoration-primary underline underline-offset-4"
          >
            Notice for professors
          </Link>
          <a
            href={`mailto:${NEXT_PUBLIC_CONTACT_EMAIL}`}
            className="text-foreground decoration-border hover:decoration-primary underline underline-offset-4"
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
