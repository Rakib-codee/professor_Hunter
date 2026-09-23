import type { Json } from '@/lib/supabase/database.types';

// Shape of admin_stats() (0001_init.sql), parsed defensively.

export interface AdminStats {
  users: number;
  drafts: number;
  outreachByStatus: Record<string, number>;
  replyRateByUniversity: { name: string; sent: number; replied: number }[];
  openReports: number;
}

const num = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;
const rec = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export function parseAdminStats(raw: Json | null | undefined): AdminStats {
  const data = rec(raw);
  const byStatus = Object.fromEntries(
    Object.entries(rec(data.outreach_by_status)).flatMap(([k, v]) =>
      typeof v === 'number' ? [[k, v]] : [],
    ),
  );
  const universities = Array.isArray(data.reply_rate_by_university)
    ? data.reply_rate_by_university.flatMap((row) => {
        const r = rec(row);
        return typeof r.name_en === 'string'
          ? [{ name: r.name_en, sent: num(r.sent), replied: num(r.replied) }]
          : [];
      })
    : [];
  return {
    users: num(data.users),
    drafts: num(data.drafts),
    outreachByStatus: byStatus,
    replyRateByUniversity: universities,
    openReports: num(data.open_reports),
  };
}
