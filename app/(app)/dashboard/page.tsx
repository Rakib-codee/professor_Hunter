import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Dashboard' };

// Placeholder so the auth flow has a landing page. The real dashboard (completeness bar,
// cards, resume-last-viewed) is built on week 1 day 4–5 — PLAN.md §9.
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === 'string' ? data.claims.email : null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground text-sm">
        {email ? `Signed in as ${email}.` : 'Signed in.'} Onboarding and the real dashboard come
        next.
      </p>
    </div>
  );
}
