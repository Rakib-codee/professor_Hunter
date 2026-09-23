import Link from 'next/link';
import { cn } from 'cn';
import { OTHER_TAG, type FacetTag } from '@/lib/data/professors';
import { findHref, toggleInList, type FindParams } from '@/lib/find/params';

interface TagFilterProps {
  basePath: string;
  params: FindParams;
  tags: FacetTag[];
  untagged: number;
}

// Multi-select chips as links: the URL is the state. One scrolling row on phones so the
// results stay near the top; wraps on wider screens (DESIGN.md §3).
export function TagFilter({ basePath, params, tags, untagged }: TagFilterProps) {
  const chips = [...tags, ...(untagged > 0 ? [{ tag: OTHER_TAG, count: untagged }] : [])];
  return (
    <ul className="chip-row -mx-4 px-4 md:mx-0 md:px-0" aria-label="Research tags">
      {chips.map(({ tag, count }) => {
        const active = params.tags.includes(tag);
        return (
          <li key={tag} className="shrink-0">
            <Link
              href={findHref(basePath, params, { tags: toggleInList(params.tags, tag) })}
              aria-pressed={active}
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-sm border px-3 text-[15px] whitespace-nowrap transition-colors',
                active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-control hover:bg-muted',
              )}
            >
              {tag === OTHER_TAG ? 'Other / unspecified' : tag}
              <span
                className={cn('tnum text-[13px]', active ? 'opacity-80' : 'text-muted-foreground')}
              >
                {count}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
