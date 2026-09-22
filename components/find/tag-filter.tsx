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

// Multi-select chips as links: the URL is the state.
export function TagFilter({ basePath, params, tags, untagged }: TagFilterProps) {
  const chips = [...tags, ...(untagged > 0 ? [{ tag: OTHER_TAG, count: untagged }] : [])];
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Research tags">
      {chips.map(({ tag, count }) => {
        const active = params.tags.includes(tag);
        return (
          <li key={tag}>
            <Link
              href={findHref(basePath, params, { tags: toggleInList(params.tags, tag) })}
              aria-pressed={active}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors',
                active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-muted',
              )}
            >
              {tag === OTHER_TAG ? 'Other / unspecified' : tag}
              <span className={cn('text-xs', active ? 'opacity-80' : 'text-muted-foreground')}>
                {count}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
