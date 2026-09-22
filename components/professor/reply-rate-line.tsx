import type { ReplyStats } from '@/lib/data/professors';

// Only rendered when >= 5 outreach rows exist (the RPC returns nothing otherwise).
export function ReplyRateLine({ stats }: { stats: ReplyStats | null }) {
  if (!stats) return null;
  const rate = Math.round((stats.replied / stats.total) * 100);
  return (
    <p className="text-muted-foreground text-sm">
      {stats.replied} of {stats.total} students who emailed via Professor Hunter got a reply ({rate}
      %).
    </p>
  );
}
