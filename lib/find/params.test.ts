import { describe, expect, test } from 'vitest';
import { findHref, parseFindParams, toggleInList } from './params';

describe('parseFindParams', () => {
  test('reads every filter from search params with safe defaults', () => {
    const parsed = parseFindParams({
      tags: 'Structural Engineering,Bridge Engineering',
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
    expect(parsed.tags).toEqual(['a']);
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
      '/find/civil-engineering?tags=A%2CB',
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
