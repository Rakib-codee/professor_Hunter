import { SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { FindParams } from '@/lib/find/params';

// GET form; only `q` changes, other filters ride along as hidden fields.
export function SearchBox({ basePath, params }: { basePath: string; params: FindParams }) {
  return (
    <form action={basePath} method="get" role="search" className="flex gap-2">
      {params.tags.length > 0 ? (
        <input type="hidden" name="tags" value={params.tags.join(',')} />
      ) : null}
      {params.uni ? <input type="hidden" name="uni" value={params.uni} /> : null}
      {params.province ? <input type="hidden" name="province" value={params.province} /> : null}
      {params.accepts.length > 0 ? (
        <input type="hidden" name="accepts" value={params.accepts.join(',')} />
      ) : null}
      {params.uniEmail ? <input type="hidden" name="uniEmail" value="1" /> : null}
      <Input
        type="search"
        name="q"
        defaultValue={params.q}
        placeholder="Search name, school or research area"
        aria-label="Search professors"
        maxLength={100}
      />
      <Button type="submit" variant="outline" size="icon" aria-label="Search" className="shrink-0">
        <SearchIcon />
      </Button>
    </form>
  );
}
