import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PAGE_SIZE } from '@/lib/data/professors';
import { findHref, type FindParams } from '@/lib/find/params';

export function Pagination({
  basePath,
  params,
  total,
}: {
  basePath: string;
  params: FindParams;
  total: number;
}) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return null;
  const page = Math.min(params.page, pages);
  return (
    <nav className="flex items-center justify-between gap-2" aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        render={
          page > 1 ? <Link href={findHref(basePath, params, { page: page - 1 })} /> : undefined
        }
      >
        Previous
      </Button>
      <span className="text-muted-foreground text-sm">
        Page {page} of {pages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= pages}
        render={
          page < pages ? <Link href={findHref(basePath, params, { page: page + 1 })} /> : undefined
        }
      >
        Next
      </Button>
    </nav>
  );
}
