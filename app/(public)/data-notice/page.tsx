import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/legal-page';
import { getPublicEnv } from '@/lib/env';

export const metadata: Metadata = { title: 'Notice for professors' };
const UPDATED = '23 September 2026';

export default function DataNoticePage() {
  const { NEXT_PUBLIC_CONTACT_EMAIL } = getPublicEnv();
  return (
    <LegalPage title="Notice for professors and universities" updated={UPDATED}>
      <h2>What we list</h2>
      <p>
        Your name, title, school, research area and work email as published on your university’s
        public faculty page, together with the date we last checked it and a link to the source
        where we have one. We add research tags to help students find the right field.
      </p>
      <h2>What we do not do</h2>
      <ul>
        <li>
          We never send email to you. Students write and send their own messages from their own
          accounts.
        </li>
        <li>
          We do not show your email openly. A logged-in student must reveal it one professor at a
          time, with a daily cap, and every reveal is logged.
        </li>
        <li>We do not sell or export the list.</li>
      </ul>
      <h2>Correction or removal</h2>
      <p>
        Email <a href={`mailto:${NEXT_PUBLIC_CONTACT_EMAIL}`}>{NEXT_PUBLIC_CONTACT_EMAIL}</a> from
        your university address with the change you want. We will update or remove your entry within
        7 days and confirm by reply. No justification is needed.
      </p>
    </LegalPage>
  );
}
