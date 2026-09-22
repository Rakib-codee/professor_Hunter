// URL state for /find/[major] (PLAN.md §4): tags, uni, province, accepts, uniEmail, q, page.
// The URL is the only state; every filter change is a link.

export interface FindParams {
  tags: string[];
  uni: string | null;
  province: string | null;
  accepts: string[];
  uniEmail: boolean;
  q: string;
  page: number;
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const FIND_DEFAULTS: FindParams = {
  tags: [],
  uni: null,
  province: null,
  accepts: [],
  uniEmail: false,
  q: '',
  page: 1,
};

const ACCEPTS_VALUES = new Set(['confirmed', 'team-reported', 'unknown', 'no']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const QUERY_MAX = 100;
const TEXT_MAX = 100;
const LIST_MAX = 10;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

function list(value: string | string[] | undefined): string[] {
  return first(value)
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.length <= TEXT_MAX)
    .slice(0, LIST_MAX);
}

export function parseFindParams(raw: RawSearchParams): FindParams {
  const uni = first(raw.uni);
  const province = first(raw.province).trim().slice(0, TEXT_MAX);
  const page = Number.parseInt(first(raw.page), 10);
  return {
    tags: list(raw.tags),
    uni: UUID.test(uni) ? uni : null,
    province: province || null,
    accepts: list(raw.accepts).filter((value) => ACCEPTS_VALUES.has(value)),
    uniEmail: first(raw.uniEmail) === '1',
    q: first(raw.q).trim().slice(0, QUERY_MAX),
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

const PAGE_RESET_KEYS: (keyof FindParams)[] = [
  'tags',
  'uni',
  'province',
  'accepts',
  'uniEmail',
  'q',
];

/** Builds a link for `patch` applied to `current`. Any filter change resets the page. */
export function findHref(
  basePath: string,
  current: FindParams,
  patch: Partial<FindParams>,
): string {
  const resetsPage = PAGE_RESET_KEYS.some((key) => key in patch);
  const next: FindParams = {
    ...current,
    ...patch,
    page: resetsPage ? 1 : (patch.page ?? current.page),
  };

  const search = new URLSearchParams();
  if (next.tags.length > 0) search.set('tags', next.tags.join(','));
  if (next.uni) search.set('uni', next.uni);
  if (next.province) search.set('province', next.province);
  if (next.accepts.length > 0) search.set('accepts', next.accepts.join(','));
  if (next.uniEmail) search.set('uniEmail', '1');
  if (next.q) search.set('q', next.q);
  if (next.page > 1) search.set('page', String(next.page));

  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function toggleInList(values: readonly string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}
