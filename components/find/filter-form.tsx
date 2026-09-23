import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Facets } from '@/lib/data/professors';
import type { FindParams } from '@/lib/find/params';
import { acceptsLabel } from '@/lib/utils/display';

interface FilterFormProps {
  basePath: string;
  params: FindParams;
  facets: Facets;
}

const ACCEPTS_OPTIONS = ['confirmed', 'team-reported', 'unknown', 'no'] as const;

// A plain GET form: submitting rewrites the URL, which is the only filter state.
// Tags and query are carried through as hidden fields so they survive a filter change.
export function FilterForm({ basePath, params, facets }: FilterFormProps) {
  const provinces = [
    ...new Set(facets.universities.map((u) => u.province).filter((p): p is string => Boolean(p))),
  ].sort();
  const selectClass =
    'border-input dark:bg-input/30 h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none';

  return (
    <form action={basePath} method="get" className="flex flex-col gap-4">
      {params.tags.length > 0 ? (
        <input type="hidden" name="tags" value={params.tags.join(',')} />
      ) : null}
      {params.q ? <input type="hidden" name="q" value={params.q} /> : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-uni">University</Label>
        <select id="filter-uni" name="uni" defaultValue={params.uni ?? ''} className={selectClass}>
          <option value="">All universities</option>
          {facets.universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.count})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-province">Province</Label>
        <select
          id="filter-province"
          name="province"
          defaultValue={params.province ?? ''}
          className={selectClass}
        >
          <option value="">All provinces</option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">International students</legend>
        {ACCEPTS_OPTIONS.map((value) => (
          <label key={value} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="accepts"
              value={value}
              defaultChecked={params.accepts.includes(value)}
            />
            {acceptsLabel(value).text}
            <span className="text-muted-foreground text-xs">{facets.accepts[value] ?? 0}</span>
          </label>
        ))}
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="uniEmail" value="1" defaultChecked={params.uniEmail} />
        University email only
      </label>
      <p className="text-muted-foreground -mt-2 text-xs">
        Tip: university addresses bounce less and get more replies than personal ones.
      </p>

      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Apply
        </Button>
        <a
          href={basePath}
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          type="button"
        >
          Clear
        </a>
      </div>
    </form>
  );
}
