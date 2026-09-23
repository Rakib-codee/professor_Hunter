import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/legal-page';

export const metadata: Metadata = { title: 'Disclaimer' };
const UPDATED = '23 September 2026';

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" updated={UPDATED}>
      <p>
        Professor Hunter is an independent student project. It is not affiliated with, endorsed by,
        or acting for the China Scholarship Council (CSC), any Chinese or foreign university, any
        embassy, or any government body.
      </p>
      <p>
        Professor details are collected from public faculty pages and checked by hand on the date
        shown next to each profile. Details change: professors move, retire, change email addresses
        or stop taking students. Always confirm on the official page before you write, and tell us
        via “Report a problem” when something is wrong.
      </p>
      <p>
        Draft emails are a starting point generated from your own profile. They can contain
        mistakes. Read and edit every draft before you send it; you are responsible for what you
        send.
      </p>
      <p>Nothing on this site is admissions, legal, visa or financial advice.</p>
    </LegalPage>
  );
}
