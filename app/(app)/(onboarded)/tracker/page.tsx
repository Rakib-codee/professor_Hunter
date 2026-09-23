import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { OutreachRow } from '@/components/tracker/outreach-row';
import { getOutreach } from '@/lib/data/outreach';
import { getCurrentUserId } from '@/lib/data/students';
import { summarize } from '@/lib/tracker/status';

export const metadata: Metadata = { title: 'Tracker' };

export default async function TrackerPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login?next=/tracker');
  const items = await getOutreach(userId);
  const summary = summarize(items);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My tracker</h1>
        <p className="text-muted-foreground text-sm">
          {summary.total} sent · {summary.waiting} waiting · {summary.replied} replied ·{' '}
          {summary.noReply} no reply
          {summary.bounced > 0 ? ` · ${summary.bounced} bounced` : ''}
        </p>
      </div>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nothing tracked yet. Generate a draft from a professor page and press “I sent this”.{' '}
          <Link href="/find" className="text-primary hover:underline">
            Find professors
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <OutreachRow key={item.id} item={item} />
          ))}
        </ul>
      )}
      <p className="text-muted-foreground text-xs">
        Marking an email as bounced also reports the address to us.
      </p>
    </div>
  );
}
