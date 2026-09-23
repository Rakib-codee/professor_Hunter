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
import { ProfessorName } from '@/components/professor/professor-name';
import { cn } from 'cn';

interface OutreachRowProps {
  item: OutreachItem;
}

const selectClass =
  'border-input bg-background h-10 rounded-sm border px-2 text-[15px] outline-none focus-visible:ring-3';
const inputClass =
  'border-input bg-background tnum h-10 rounded-sm border px-2 text-[15px] outline-none focus-visible:ring-3';

// Status colour reuses the evidence families (DESIGN.md §3 tracker); waiting stays neutral.
const STATUS_CLASS: Record<OutreachStatus, string> = {
  sent: 'text-foreground',
  replied_positive: 'text-confirmed border-confirmed',
  replied_conditional: 'text-caution-foreground border-caution-foreground',
  replied_negative: 'text-negative-foreground border-negative-foreground',
  no_reply: 'text-muted-foreground',
  bounced: 'text-negative-foreground border-negative-foreground',
};

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

  return (
    <li
      className={cn(
        'flex flex-col gap-3 py-4 sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:items-start sm:gap-4',
        due && 'border-l-primary -ml-3 border-l-[3px] pl-3',
      )}
    >
      <div className="flex flex-col gap-1">
        {item.professor ? (
          <Link
            href={`/professor/${item.professor.id}`}
            className="hover:text-primary font-display text-[20px] leading-[1.2] underline-offset-4 hover:underline"
          >
            <ProfessorName nameEn={item.professor.name_en} nameCn={item.professor.name_cn} />
          </Link>
        ) : (
          <span className="font-display text-[20px] leading-[1.2]">Professor no longer listed</span>
        )}
        {item.professor?.university_name ? (
          <span className="text-muted-foreground text-[15px]">
            {item.professor.university_name}
          </span>
        ) : null}
        <span className="text-muted-foreground tnum flex flex-wrap gap-x-4 text-[13px]">
          <span>Sent {item.sent_on}</span>
          {item.reply_on ? <span>replied {item.reply_on}</span> : null}
        </span>
        <textarea
          className="border-input bg-background mt-1 min-h-10 w-full rounded-sm border px-2 py-1.5 text-[15px] outline-none focus-visible:ring-3"
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
      <label className="flex flex-col gap-1 text-[13px] font-medium">
        Status
        <select
          className={cn(selectClass, STATUS_CLASS[item.status])}
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
      <label className="flex flex-col gap-1 text-[13px] font-medium">
        <span className="flex gap-2">
          Follow up{due ? <span className="text-primary">due</span> : null}
        </span>
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
      <div className="flex items-start gap-1 sm:pt-6">
        {confirmDelete ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={pending}
              onClick={() => run(() => deleteOutreach(item.id))}
            >
              Delete
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
              Keep
            </Button>
          </>
        ) : (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Delete entry"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2Icon />
          </Button>
        )}
      </div>
      {error ? (
        <p role="alert" className="text-destructive text-[13px] sm:col-span-4">
          {error}
        </p>
      ) : null}
    </li>
  );
}
