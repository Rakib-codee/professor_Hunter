import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAdminStats } from '@/lib/data/admin';
import { statusLabel, type OutreachStatus } from '@/lib/tracker/status';

export const metadata: Metadata = { robots: { index: false } };

export default async function AdminPage() {
  const stats = await getAdminStats();
  const outreachTotal = Object.values(stats.outreachByStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="heading-page">Stats</h1>
      <div className="grid gap-3 sm:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Users</CardDescription>
            <CardTitle className="display-figure text-[28px]">{stats.users}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="display-figure text-[28px]">{stats.drafts}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Emails tracked</CardDescription>
            <CardTitle className="display-figure text-[28px]">{outreachTotal}</CardTitle>
          </CardHeader>
        </Card>
        <Link href="/admin/reports" className="block">
          <Card size="sm" className="hover:bg-muted/50 h-full transition-colors">
            <CardHeader>
              <CardDescription>Open reports</CardDescription>
              <CardTitle className="display-figure text-[28px]">{stats.openReports}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="heading-section">Outreach by status</h2>
        {outreachTotal === 0 ? (
          <p className="text-muted-foreground text-[15px]">No emails tracked yet.</p>
        ) : (
          <ul className="ledger border-border tnum border-y sm:grid sm:grid-cols-2 sm:gap-x-8">
            {Object.entries(stats.outreachByStatus).map(([status, count]) => (
              <li key={status} className="flex justify-between py-2">
                <span>{statusLabel(status as OutreachStatus)}</span>
                <span className="tabular-nums">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="heading-section">Reply rate by university</h2>
        <p className="text-muted-foreground text-[13px]">
          Shown once a university has 5 or more tracked emails.
        </p>
        {stats.replyRateByUniversity.length === 0 ? (
          <p className="text-muted-foreground text-[15px]">Not enough data yet.</p>
        ) : (
          <ul className="ledger border-border tnum border-y">
            {stats.replyRateByUniversity.map((row) => (
              <li key={row.name} className="flex justify-between gap-4 py-2">
                <span>{row.name}</span>
                <span className="tabular-nums">
                  {row.replied}/{row.sent} ({Math.round((row.replied / row.sent) * 100)}%)
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
