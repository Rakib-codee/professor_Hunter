import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/legal-page';
import { getPublicEnv } from '@/lib/env';

export const metadata: Metadata = { title: 'Terms of use' };
const UPDATED = '23 September 2026';

export default function TermsPage() {
  const { NEXT_PUBLIC_CONTACT_EMAIL } = getPublicEnv();
  return (
    <LegalPage title="Terms of use" updated={UPDATED}>
      <h2>What this is</h2>
      <p>
        Professor Hunter is a free tool that lists publicly available professor details, helps you
        write a first-contact email and lets you track replies. It is provided as is, by students,
        in our spare time.
      </p>
      <h2>No guarantees</h2>
      <p>
        We do not guarantee that any professor will reply, accept you, or that any listed detail is
        current. Admission and scholarship decisions are made by universities and the China
        Scholarship Council, not by us.
      </p>
      <h2>Fair use</h2>
      <ul>
        <li>
          One account per person. Do not share accounts or create several to get around daily
          limits.
        </li>
        <li>
          Do not scrape, export or resell the professor list, and do not automate reveals or drafts.
        </li>
        <li>
          Do not use the drafts for bulk or misleading email. Edit each one and send it yourself.
        </li>
      </ul>
      <p>
        We may suspend accounts that break these rules or that appear to be used for bulk outreach.
      </p>
      <h2>Your content</h2>
      <p>
        You own what you type. You give us permission to store it and to use it to generate drafts
        for you.
      </p>
      <h2>Changes and contact</h2>
      <p>
        We may change the service or these terms; the date above shows the latest version.
        Questions: <a href={`mailto:${NEXT_PUBLIC_CONTACT_EMAIL}`}>{NEXT_PUBLIC_CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
