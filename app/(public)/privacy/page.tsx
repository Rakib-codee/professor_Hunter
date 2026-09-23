import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/legal-page';
import { getPublicEnv } from '@/lib/env';

export const metadata: Metadata = { title: 'Privacy policy' };
const UPDATED = '23 September 2026';

export default function PrivacyPage() {
  const { NEXT_PUBLIC_CONTACT_EMAIL } = getPublicEnv();
  return (
    <LegalPage title="Privacy policy" updated={UPDATED}>
      <h2>What we collect</h2>
      <p>
        When you create an account we store your email address and a password hash. During
        onboarding you may add your name, nationality, university, major, grades, graduation year,
        degree and intake plans, language scores, achievements, research interests and research
        tags. Everything except your email is optional; it exists to write better draft emails for
        you.
      </p>
      <h2>How we use it</h2>
      <ul>
        <li>
          To generate draft emails on your request. Your profile facts and the professor’s public
          details are sent to a language-model provider only when you press “Generate draft”.
          Professor email addresses are never sent to the provider.
        </li>
        <li>To show your dashboard, saved professors and tracker.</li>
        <li>
          To enforce fair-use limits (30 email reveals and 20 drafts per day). We log which
          professor you revealed or drafted for and when.
        </li>
      </ul>
      <h2>Who can see it</h2>
      <p>
        Only you, and the site administrators for support and abuse handling. We never sell data,
        never show your profile to professors, and never send email on your behalf: you copy the
        draft into your own mail app.
      </p>
      <h2>Where it is stored</h2>
      <p>
        Data is stored with Supabase (database, Singapore region) and served through Vercel. Draft
        generation uses the provider named in the app at the time (currently none in production; a
        mock is used in development). Aggregate usage statistics may be collected with a cookie-free
        analytics service.
      </p>
      <h2>CV files</h2>
      <p>
        CV upload is not yet available. When it is, files will be stored privately, capped in size,
        and deleted with your account.
      </p>
      <h2>Deleting your data</h2>
      <p>
        Email <a href={`mailto:${NEXT_PUBLIC_CONTACT_EMAIL}`}>{NEXT_PUBLIC_CONTACT_EMAIL}</a> from
        your account address and we will delete your account and everything attached to it within 14
        days.
      </p>
    </LegalPage>
  );
}
