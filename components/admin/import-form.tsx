'use client';

import { useActionState } from 'react';
import { importCsv, type ImportFormState } from '@/actions/admin';
import { FormMessage } from '@/components/form/form-message';
import { SubmitButton } from '@/components/form/submit-button';
import { Label } from '@/components/ui/label';

const INITIAL: ImportFormState = { ok: false, attempt: 0 };
const MAX_LISTED = 40;

export function ImportForm() {
  const [state, action] = useActionState(importCsv, INITIAL);
  const summary = state.summary;

  return (
    <div className="flex flex-col gap-4">
      <form
        key={state.attempt}
        action={action}
        className="flex flex-col gap-3"
        encType="multipart/form-data"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="csv-file">CSV file (same columns as professor_hunter_dataset)</Label>
          <input
            id="csv-file"
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            className="text-[15px]"
          />
        </div>
        <FormMessage error={state.error} />
        <SubmitButton pendingText="Importing… this can take a few minutes">Import</SubmitButton>
      </form>
      {summary ? (
        <section
          className="flex flex-col gap-2 rounded-sm border p-4 text-[15px]"
          aria-live="polite"
        >
          <h2 className="font-medium">Import finished</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-5">
            {(
              [
                ['Rows', summary.total],
                ['Inserted', summary.inserted],
                ['Updated', summary.updated],
                ['Unchanged', summary.unchanged],
                ['Skipped', summary.skipped],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted-foreground text-[13px]">{label}</dt>
                <dd className="tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          {summary.errors.length > 0 ? (
            <details open>
              <summary className="text-destructive cursor-pointer">
                Errors ({summary.errors.length})
              </summary>
              <ul className="mt-1 list-disc pl-5">
                {summary.errors.slice(0, MAX_LISTED).map((e) => (
                  <li key={`${e.row}-${e.message}`}>
                    line {e.row}: {e.message}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
          {summary.warnings.length > 0 ? (
            <details>
              <summary className="cursor-pointer">Warnings ({summary.warnings.length})</summary>
              <ul className="mt-1 list-disc pl-5">
                {summary.warnings.slice(0, MAX_LISTED).map((w) => (
                  <li key={`${w.row}-${w.message}`}>
                    line {w.row}: {w.message}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
