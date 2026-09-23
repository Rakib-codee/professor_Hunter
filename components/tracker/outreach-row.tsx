'use client';

import { Trash2Icon } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import {
  deleteOutreach,
  updateFollowUp,
  updateOutreachNotes,
  updateOutreachStatus,
} from '@/actions/outreach';
import { Button } from '@/components/ui/button';
import type { OutreachItem } from '@/lib/data/outreach';
import { OUTREACH_STATUSES, statusLabel, type OutreachStatus } from '@/lib/tracker/status';
import { displayName } from '@/lib/utils/display';

interface OutreachRowProps {
  item: OutreachItem;
}

const selectClass =
  'border-input dark:bg-input/30 h-8 rounded-lg border bg-transparent px-2 text-sm outline-none focus-visible:ring-3';
const inputClass =
  'border-input dark:bg-input/30 h-8 rounded-lg border bg-transparent px-2 text-sm outline-none focus-visible:ring-3';

function isDue(followUpOn: string | null, status: OutreachStatus): boolean {
  if (!followUpOn || status !== 'sent') return false;
  return followUpOn <= new Date().toISOString().slice(0, 10);
}

// One outreach entry: card on mobile, row on wider screens. Every edit saves immediately.
export function OutreachRow({ item }: OutreachRowProps) {
  const [notes, setNotes] = useState(item.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const due = isDue(item.follow_up_on, item.status);

  const run = (task: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null);
      const result = await task();
      if (!result.ok) setError(result.error ?? 'Could not save.');
    });

  const name = item.professor
    ? displayName(item.professor.name_en, item.professor.name_cn)
    : 'Professor no longer listed';

  return (
    <li className="flex flex-col gap-2 rounded-xl border p-3 sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:items-start sm:gap-3">
      <div className="flex flex-col gap-0.5">
        {item.professor ? (
          <Link href={`/professor/${item.professor.id}`} className="font-medium hover:underline">
            {name}
          </Link>
        ) : (
          <span className="font-medium">{name}</span>
        )}
        {item.professor?.university_name ? (
          <span className="text-muted-foreground text-xs">{item.professor.university_name}</span>
        ) : null}
        <span className="text-muted-foreground text-xs">
          Sent {item.sent_on}
          {item.reply_on ? ` · replied ${item.reply_on}` : ''}
        </span>
        <textarea
          className="border-input dark:bg-input/30 mt-1 min-h-8 w-full rounded-lg border bg-transparent px-2 py-1 text-sm outline-none focus-visible:ring-3"
          placeholder="Notes"
          value={notes}
          maxLength={1000}
          aria-label="Notes"
          onChange={(event) => setNotes(event.target.value)}
          onBlur={() => {
            if (notes !== (item.notes ?? ''))
              run(() => updateOutreachNotes({ id: item.id, notes }));
          }}
        />
      </div>
      <label className="flex flex-col gap-1 text-xs">
        Status
        <select
          className={selectClass}
          value={item.status}
          disabled={pending}
          onChange={(event) =>
            run(() =>
              updateOutreachStatus({ id: item.id, status: event.target.value as OutreachStatus }),
            )
          }
        >
          {OUTREACH_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs">
        Follow up{due ? <span className="text-destructive"> · due</span> : null}
        <input
          type="date"
          className={inputClass}
          defaultValue={item.follow_up_on ?? ''}
          disabled={pending}
          onChange={(event) =>
            run(() => updateFollowUp({ id: item.id, followUpOn: event.target.value || null }))
          }
        />
      </label>
      <div className="flex items-start gap-1 sm:pt-4">
        {confirmDelete ? (
          <>
            <Button
              type="button"
              size="xs"
              variant="destructive"
              disabled={pending}
              onClick={() => run(() => deleteOutreach(item.id))}
            >
              Delete
            </Button>
            <Button type="button" size="xs" variant="ghost" onClick={() => setConfirmDelete(false)}>
              Keep
            </Button>
          </>
        ) : (
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            aria-label="Delete entry"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2Icon />
          </Button>
        )}
      </div>
      {error ? (
        <p role="alert" className="text-destructive text-xs sm:col-span-4">
          {error}
        </p>
      ) : null}
    </li>
  );
}
