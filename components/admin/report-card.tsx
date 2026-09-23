'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { resolveReport, setProfessorStatus } from '@/actions/admin';
import { Button } from '@/components/ui/button';
import type { ReportItem } from '@/lib/data/admin';

const REPORT_TYPE_LABEL: Record<string, string> = {
  wrong_email: 'Wrong email',
  bounced: 'Bounced',
  moved: 'Moved / retired',
  not_accepting: 'Not accepting students',
  other: 'Other',
};

const PROFESSOR_STATUSES = ['active', 'bounced', 'moved', 'retired'] as const;

export function ReportCard({ report }: { report: ReportItem }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (task: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null);
      const result = await task();
      if (!result.ok) setError(result.error ?? 'Could not save.');
    });

  return (
    <li className="flex flex-col gap-2 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium">{REPORT_TYPE_LABEL[report.type] ?? report.type}</span>
        <span className="text-muted-foreground tnum flex gap-x-3 text-[13px]">
          <span>{new Date(report.created_at).toISOString().slice(0, 10)}</span>
          {report.reporter_name ? <span>by {report.reporter_name}</span> : null}
        </span>
      </div>
      {report.professor ? (
        <p className="text-[15px]">
          <Link href={`/professor/${report.professor.id}`} className="hover:underline">
            {report.professor.name_en}
          </Link>{' '}
          <Link
            href={`/admin/professors/${report.professor.id}`}
            className="text-primary text-[13px] hover:underline"
          >
            edit
          </Link>
          <span className="text-muted-foreground block">
            {report.professor.university_name ? `${report.professor.university_name}, ` : ''}
            {report.professor.has_email ? 'has email' : 'no email'}
          </span>
        </p>
      ) : (
        <p className="text-muted-foreground text-[15px]">Professor no longer exists.</p>
      )}
      {report.message ? (
        <p className="bg-muted rounded-sm px-3 py-2 text-[15px] whitespace-pre-wrap">
          {report.message}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        {report.professor ? (
          <label className="flex items-center gap-2 text-[13px] font-medium">
            Professor status
            <select
              className="border-input bg-background h-10 rounded-sm border px-2 text-[15px]"
              defaultValue={report.professor.status ?? 'active'}
              disabled={pending}
              onChange={(event) =>
                run(() =>
                  setProfessorStatus({
                    professorId: report.professor!.id,
                    status: event.target.value as (typeof PROFESSOR_STATUSES)[number],
                  }),
                )
              }
            >
              {PROFESSOR_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() => run(() => resolveReport(report.id))}
        >
          Mark resolved
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-destructive text-[13px]">
          {error}
        </p>
      ) : null}
    </li>
  );
}
