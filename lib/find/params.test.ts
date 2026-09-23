import { describe, expect, test } from 'vitest';
import { findHref, parseFindParams, toggleInList } from './params';

describe('parseFindParams', () => {
  test('reads every filter from search params with safe defaults', () => {
    const parsed = parseFindParams({
      tags: ['Structural Engineering', 'Bridge Engineering'],
      uni: '4e8f6d3e-7b1e-4a0c-9c5f-2f1a5c3d9e10',
      province: 'Beijing',
      accepts: 'confirmed,team-reported',
      uniEmail: '1',
      q: '  slope  ',
      page: '3',
    });
    expect(parsed).toEqual({
      tags: ['Structural Engineering', 'Bridge Engineering'],
      uni: '4e8f6d3e-7b1e-4a0c-9c5f-2f1a5c3d9e10',
      province: 'Beijing',
      accepts: ['confirmed', 'team-reported'],
      uniEmail: true,
      q: 'slope',
      page: 3,
    });
  });

  test('drops invalid values instead of failing', () => {
    const parsed = parseFindParams({
      uni: 'not-a-uuid',
      accepts: 'yes,confirmed',
      page: '-2',
      q: 'x'.repeat(300),
      tags: ['a', 'b'],
    });
    expect(parsed.uni).toBeNull();
    expect(parsed.accepts).toEqual(['confirmed']);
    expect(parsed.page).toBe(1);
    expect(parsed.q.length).toBe(100);
    // Repeated keys are merged (checkbox groups submit `tags=a&tags=b`).
    expect(parsed.tags).toEqual(['a', 'b']);
  });

  test('empty input yields defaults', () => {
    expect(parseFindParams({})).toEqual({
      tags: [],
      uni: null,
      province: null,
      accepts: [],
      uniEmail: false,
      q: '',
      page: 1,
    });
  });
});

describe('findHref', () => {
  test('serialises only non-default values and resets page when filters change', () => {
    const base = parseFindParams({ tags: 'A', page: '2' });
    expect(findHref('/find/civil-engineering', base, { tags: ['A', 'B'] })).toBe(
      '/find/civil-engineering?tags=A&tags=B',
    );
    expect(findHref('/find/civil-engineering', base, { page: 3 })).toBe(
      '/find/civil-engineering?tags=A&page=3',
    );
    expect(findHref('/find/civil-engineering', parseFindParams({}), {})).toBe(
      '/find/civil-engineering',
    );
    expect(findHref('/find/x', parseFindParams({}), { uniEmail: true, q: 'a b' })).toBe(
      '/find/x?uniEmail=1&q=a+b',
    );
  });
});

describe('toggleInList', () => {
  test('adds when absent, removes when present', () => {
    expect(toggleInList(['A'], 'B')).toEqual(['A', 'B']);
    expect(toggleInList(['A', 'B'], 'A')).toEqual(['B']);
  });
});

describe('parseFindParams with repeated query keys (HTML checkbox groups)', () => {
  test('merges repeated accepts values instead of keeping only the first', () => {
    const params = parseFindParams({ accepts: ['confirmed', 'team-reported'] });
    expect(params.accepts).toEqual(['confirmed', 'team-reported']);
  });

  test('merges repeated tags values and still drops empty and invalid entries', () => {
    const params = parseFindParams({
      tags: ['Geotechnical Engineering', ' Bridge Engineering ', ''],
      accepts: ['confirmed', 'bogus', ''],
    });
    expect(params.tags).toEqual(['Geotechnical Engineering', 'Bridge Engineering']);
    expect(params.accepts).toEqual(['confirmed']);
  });

  test('ignores empty uni and province values submitted by the filter form', () => {
    const params = parseFindParams({ uni: '', province: '' });
    expect(params.uni).toBeNull();
    expect(params.province).toBeNull();
  });
});

describe('tags whose name contains a comma', () => {
  const TAG = 'Cloud, Edge & Distributed Computing';

  test('survive a round trip through findHref and parseFindParams', () => {
    const href = findHref('/find/software-engineering', parseFindParams({}), { tags: [TAG] });
    const query = Object.fromEntries(new URL(href, 'http://x').searchParams);
    expect(parseFindParams(query).tags).toEqual([TAG]);
  });

  test('are kept whole when they arrive as one value or as repeated keys', () => {
    expect(parseFindParams({ tags: TAG }).tags).toEqual([TAG]);
    expect(parseFindParams({ tags: [TAG, 'Robotics, HCI & Embodied AI'] }).tags).toEqual([
      TAG,
      'Robotics, HCI & Embodied AI',
    ]);
  });

  test('accepts still splits its comma form from the checkbox group', () => {
    expect(parseFindParams({ accepts: 'confirmed,team-reported' }).accepts).toEqual([
      'confirmed',
      'team-reported',
    ]);
  });
});

describe('canUseGetRpc', () => {
  test('falls back to POST when an array element would break the PostgREST array literal', async () => {
    const { canUseGetRpc } = await import('@/lib/data/professors');
    expect(canUseGetRpc([['Geotechnical Engineering'], ['confirmed']])).toBe(true);
    expect(canUseGetRpc([['Cloud, Edge & Distributed Computing']])).toBe(false);
    expect(canUseGetRpc([['a"b']])).toBe(false);
    expect(canUseGetRpc([undefined, []])).toBe(true);
  });
});
