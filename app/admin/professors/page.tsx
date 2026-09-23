import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchProfessorsForAdmin } from '@/lib/data/admin';

export const metadata: Metadata = { robots: { index: false } };

export default async function AdminProfessorsPage({
  searchParams,
}: PageProps<'/admin/professors'>) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw) ?? '';
  const hits = await searchProfessorsForAdmin(q);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-[26px] leading-tight font-semibold tracking-tight">Professors</h1>
      <form action="/admin/professors" method="get" role="search" className="flex gap-2">
        <Input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by English or Chinese name"
          aria-label="Search"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>
      {q && hits.length === 0 ? (
        <p className="text-muted-foreground text-[15px]">No match.</p>
      ) : null}
      <ul className="ledger border-border border-y">
        {hits.map((hit) => (
          <li key={hit.id} className="flex items-center justify-between gap-3 py-2.5">
            <span className="flex flex-col">
              <span className="font-medium">
                {hit.name_en}
                {hit.name_cn ? (
                  <span lang="zh-Hans" className="text-muted-foreground ml-2 font-normal">
                    {hit.name_cn}
                  </span>
                ) : null}
              </span>
              <span className="text-muted-foreground text-[13px]">
                {[hit.field, hit.status, hit.has_email ? null : 'no email']
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </span>
            <Link href={`/admin/professors/${hit.id}`} className="text-primary hover:underline">
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
