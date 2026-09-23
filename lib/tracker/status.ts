import type { Enums } from '@/lib/supabase/database.types';

export type OutreachStatus = Enums<'outreach_status'>;

export const OUTREACH_STATUSES = [
  'sent',
  'replied_positive',
  'replied_conditional',
  'replied_negative',
  'no_reply',
  'bounced',
] as const satisfies readonly OutreachStatus[];

const LABELS: Record<OutreachStatus, string> = {
  sent: 'Sent, waiting',
  replied_positive: 'Replied – positive',
  replied_conditional: 'Replied – conditional',
  replied_negative: 'Replied – negative',
  no_reply: 'No reply',
  bounced: 'Bounced',
};

const REPLIED = new Set<OutreachStatus>([
  'replied_positive',
  'replied_conditional',
  'replied_negative',
]);

export function statusLabel(status: OutreachStatus): string {
  return LABELS[status];
}

export function isReplied(status: OutreachStatus): boolean {
  return REPLIED.has(status);
}

export interface OutreachSummary {
  total: number;
  replied: number;
  noReply: number;
  waiting: number;
  bounced: number;
}

export function summarize(rows: readonly { status: OutreachStatus }[]): OutreachSummary {
  return rows.reduce<OutreachSummary>(
    (acc, row) => ({
      total: acc.total + 1,
      replied: acc.replied + (isReplied(row.status) ? 1 : 0),
      noReply: acc.noReply + (row.status === 'no_reply' ? 1 : 0),
      waiting: acc.waiting + (row.status === 'sent' ? 1 : 0),
      bounced: acc.bounced + (row.status === 'bounced' ? 1 : 0),
    }),
    { total: 0, replied: 0, noReply: 0, waiting: 0, bounced: 0 },
  );
}
