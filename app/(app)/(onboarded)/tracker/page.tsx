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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div className="flex flex-col gap-3">
        <h1 className="heading-page">My tracker</h1>
        <dl className="flex flex-wrap gap-x-7 gap-y-3 text-[15px]" aria-label="Summary">
          {[
            ['sent', summary.total],
            ['waiting', summary.waiting],
            ['replied', summary.replied],
            ['no reply', summary.noReply],
            ...(summary.bounced > 0 ? [['bounced', summary.bounced] as const] : []),
          ].map(([label, count]) => (
            <div key={label} className="flex items-baseline gap-2">
              <dd className="display-figure text-[28px]">{count}</dd>
              <dt className="text-muted-foreground">{label}</dt>
            </div>
          ))}
        </dl>
      </div>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-base">
          Nothing tracked yet. Generate a draft from a professor page and press “I sent this”.{' '}
          <Link href="/find" className="text-primary hover:underline">
            Find professors
          </Link>
        </p>
      ) : (
        <ul className="ledger border-border border-y">
          {items.map((item) => (
            <OutreachRow key={item.id} item={item} />
          ))}
        </ul>
      )}
      <p className="text-muted-foreground text-[13px]">
        Marking an email as bounced also reports the address to us.
      </p>
    </div>
  );
}
