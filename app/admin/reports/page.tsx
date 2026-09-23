import type { Metadata } from 'next';
import { ReportCard } from '@/components/admin/report-card';
import { getOpenReports } from '@/lib/data/admin';

export const metadata: Metadata = { robots: { index: false } };

export default async function AdminReportsPage() {
  const reports = await getOpenReports();
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Open reports</h1>
        <p className="text-muted-foreground text-sm">
          {reports.length} open. Set the professor status here; edit other fields in Supabase
          Studio.
        </p>
      </div>
      {reports.length === 0 ? (
        <p className="text-muted-foreground text-sm">Queue is empty.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </ul>
      )}
    </div>
  );
}
