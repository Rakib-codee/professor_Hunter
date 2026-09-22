import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
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
      {page > 1 ? (
        <Link
          href={findHref(basePath, params, { page: page - 1 })}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Previous
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
      )}
      <span className="text-muted-foreground text-sm">
        Page {page} of {pages}
      </span>
      {page < pages ? (
        <Link
          href={findHref(basePath, params, { page: page + 1 })}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Next
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      )}
    </nav>
  );
}
