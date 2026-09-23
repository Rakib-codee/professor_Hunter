import { XIcon } from 'lucide-react';
import Link from 'next/link';
import { OTHER_TAG, type Facets } from '@/lib/data/professors';
import { findHref, type FindParams } from '@/lib/find/params';
import { acceptsLabel, type AcceptsIntl } from '@/lib/utils/display';

// Filters in effect, each removable (DESIGN.md §3 professor list). Makes the selection visible
// even when the matching chip has scrolled out of view on a phone.
export function ActiveFilters({
  basePath,
  params,
  facets,
}: {
  basePath: string;
  params: FindParams;
  facets: Facets;
}) {
  const items: { key: string; label: string; href: string }[] = [
    ...params.tags.map((tag) => ({
      key: `tag:${tag}`,
      label: tag === OTHER_TAG ? 'Other / unspecified' : tag,
      href: findHref(basePath, params, { tags: params.tags.filter((item) => item !== tag) }),
    })),
    ...(params.uni
      ? [
          {
            key: 'uni',
            label: facets.universities.find((u) => u.id === params.uni)?.name ?? 'University',
            href: findHref(basePath, params, { uni: null }),
          },
        ]
      : []),
    ...(params.province
      ? [
          {
            key: 'province',
            label: params.province,
            href: findHref(basePath, params, { province: null }),
          },
        ]
      : []),
    ...params.accepts.map((value) => ({
      key: `accepts:${value}`,
      label: acceptsLabel(value as AcceptsIntl).text,
      href: findHref(basePath, params, {
        accepts: params.accepts.filter((item) => item !== value),
      }),
    })),
    ...(params.uniEmail
      ? [
          {
            key: 'uniEmail',
            label: 'University email only',
            href: findHref(basePath, params, { uniEmail: false }),
          },
        ]
      : []),
    ...(params.q
      ? [{ key: 'q', label: `“${params.q}”`, href: findHref(basePath, params, { q: '' }) }]
      : []),
  ];
  if (items.length === 0) return null;
  return (
    <ul className="enter flex flex-wrap gap-2" aria-label="Filters in effect">
      {items.map((item) => (
        <li key={item.key}>
          <Link
            href={item.href}
            className="bg-primary/10 text-primary hover:bg-primary/15 inline-flex min-h-8 items-center gap-1.5 rounded-sm px-2.5 text-[13px] font-medium"
            aria-label={`Remove filter ${item.label}`}
          >
            {item.label}
            <XIcon className="size-3.5" aria-hidden="true" />
          </Link>
        </li>
      ))}
      {items.length > 1 ? (
        <li>
          <Link
            href={basePath}
            className="text-muted-foreground inline-flex min-h-8 items-center px-1 text-[13px] underline underline-offset-4"
          >
            Clear all
          </Link>
        </li>
      ) : null}
    </ul>
  );
}
