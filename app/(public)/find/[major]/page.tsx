import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ActiveFilters } from '@/components/find/active-filters';
import { FilterForm } from '@/components/find/filter-form';
import { FilterSheet } from '@/components/find/filter-sheet';
import { Pagination } from '@/components/find/pagination';
import { SearchBox } from '@/components/find/search-box';
import { TagFilter } from '@/components/find/tag-filter';
import { ProfessorCard } from '@/components/professor/professor-card';
import { fieldFromSlug } from '@/lib/constants';
import { getFacets, getSavedIds, searchProfessors } from '@/lib/data/professors';
import { getCurrentUserId } from '@/lib/data/students';
import { parseFindParams } from '@/lib/find/params';

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<'/find/[major]'>): Promise<Metadata> {
  const { major } = await params;
  const field = fieldFromSlug(major);
  if (!field) return { title: 'Find professors' };
  const [facets, find] = await Promise.all([
    getFacets(field).catch(() => null),
    searchParams.then(parseFindParams),
  ]);
  const isFiltered =
    find.tags.length > 0 ||
    find.uni ||
    find.province ||
    find.accepts.length > 0 ||
    find.uniEmail ||
    find.q ||
    find.page > 1;
  const description = facets
    ? `${facets.total} ${field} professors at ${facets.universities.length} Chinese universities: research areas, verification dates and whether they accept international students. Free for CSC applicants.`
    : `${field} professors at Chinese universities for CSC applicants.`;
  return {
    title: `${field} professors in China`,
    description,
    alternates: { canonical: `/find/${major}` },
    // Filtered and paginated views are not indexed; the canonical list is.
    robots: isFiltered ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { title: `${field} professors in China · Professor Hunter`, description },
  };
}

export default async function FindMajorPage({ params, searchParams }: PageProps<'/find/[major]'>) {
  const { major } = await params;
  const field = fieldFromSlug(major);
  if (!field) notFound();

  const basePath = `/find/${major}`;
  const find = parseFindParams(await searchParams);
  const userId = await getCurrentUserId();
  const [facets, result, savedIds] = await Promise.all([
    getFacets(field),
    searchProfessors(field, find),
    userId ? getSavedIds(userId) : Promise.resolve(new Set<string>()),
  ]);
  const activeFilters = [
    find.uni,
    find.province,
    find.uniEmail ? 'x' : null,
    ...find.accepts,
  ].filter(Boolean).length;

  const filters = <FilterForm basePath={basePath} params={find} facets={facets} />;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <div>
        <h1 className="text-[26px] leading-tight font-semibold tracking-tight">{field}</h1>
        <p className="text-muted-foreground tnum mt-1 text-base">
          {facets.total} professors across {facets.universities.length} universities
        </p>
      </div>
      <TagFilter basePath={basePath} params={find} tags={facets.tags} untagged={facets.untagged} />
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchBox basePath={basePath} params={find} />
        </div>
        <div className="md:hidden">
          <FilterSheet activeCount={activeFilters}>{filters}</FilterSheet>
        </div>
      </div>
      <ActiveFilters basePath={basePath} params={find} facets={facets} />
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <aside className="bg-muted hidden self-start rounded-sm p-4 md:block">{filters}</aside>
        <section className="flex flex-col gap-3" aria-label="Results">
          <p className="tnum text-base font-semibold">
            {result.total === 0
              ? 'No professors match. Try fewer filters.'
              : `${result.total} results`}
          </p>
          <div className="ledger border-border border-t">
            {result.items.map((professor) => (
              <ProfessorCard
                key={professor.id}
                professor={professor}
                saved={savedIds.has(professor.id)}
                isSignedIn={Boolean(userId)}
              />
            ))}
          </div>
          <Pagination basePath={basePath} params={find} total={result.total} />
        </section>
      </div>
    </div>
  );
}
