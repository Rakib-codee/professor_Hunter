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
    <li className="flex flex-col gap-2 rounded-xl border p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium">{REPORT_TYPE_LABEL[report.type] ?? report.type}</span>
        <span className="text-muted-foreground text-xs">
          {new Date(report.created_at).toISOString().slice(0, 10)}
          {report.reporter_name ? ` · by ${report.reporter_name}` : ''}
        </span>
      </div>
      {report.professor ? (
        <p className="text-sm">
          <Link href={`/professor/${report.professor.id}`} className="hover:underline">
            {report.professor.name_en}
          </Link>{' '}
          <Link
            href={`/admin/professors/${report.professor.id}`}
            className="text-primary text-xs hover:underline"
          >
            edit
          </Link>
          {report.professor.university_name ? ` · ${report.professor.university_name}` : ''}
          {' · '}
          <span className="text-muted-foreground">
            {report.professor.has_email ? 'has email' : 'no email'}
          </span>
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">Professor no longer exists.</p>
      )}
      {report.message ? (
        <p className="bg-muted rounded-lg px-3 py-2 text-sm whitespace-pre-wrap">
          {report.message}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        {report.professor ? (
          <label className="flex items-center gap-2 text-xs">
            Professor status
            <select
              className="border-input dark:bg-input/30 h-8 rounded-lg border bg-transparent px-2 text-sm"
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
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
    </li>
  );
}
