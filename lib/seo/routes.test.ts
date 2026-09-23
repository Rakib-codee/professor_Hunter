import { describe, expect, test } from 'vitest';
import { MAJORS } from '@/lib/constants';
import { buildRobots, buildSitemap, PRIVATE_PATH_PREFIXES } from './routes';

const SITE = 'https://professor-hunter.vercel.app';

describe('buildRobots', () => {
  test('allows the public site and points crawlers at the sitemap', () => {
    const robots = buildRobots(SITE);
    expect(robots.sitemap).toBe(`${SITE}/sitemap.xml`);
    const rules = Array.isArray(robots.rules) ? robots.rules[0] : robots.rules;
    expect(rules.userAgent).toBe('*');
    expect(rules.allow).toBe('/');
  });

  test('disallows professor pages and every private area (PLAN.md Q19)', () => {
    const rules = buildRobots(SITE).rules;
    const disallow = (Array.isArray(rules) ? rules[0] : rules).disallow;
    for (const prefix of [
      '/professor/',
      '/dashboard',
      '/tracker',
      '/saved',
      '/profile',
      '/onboarding',
      '/admin',
      '/api/',
      '/auth/',
    ]) {
      expect(disallow).toContain(prefix);
    }
    expect(disallow).toEqual(PRIVATE_PATH_PREFIXES);
  });

  test('never disallows a public browse or legal path', () => {
    const rules = buildRobots(SITE).rules;
    const disallow = (Array.isArray(rules) ? rules[0] : rules).disallow as string[];
    for (const publicPath of ['/find', '/privacy', '/terms', '/login', '/signup']) {
      expect(disallow.some((prefix) => publicPath.startsWith(prefix))).toBe(false);
    }
  });
});

describe('buildSitemap', () => {
  const sitemap = buildSitemap(SITE);
  const urls = sitemap.map((entry) => entry.url);

  test('lists home, major picker and one entry per major', () => {
    expect(urls).toContain(`${SITE}/`);
    expect(urls).toContain(`${SITE}/find`);
    for (const major of MAJORS) expect(urls).toContain(`${SITE}/find/${major.slug}`);
  });

  test('lists legal pages and login/signup, nothing private, no professor pages', () => {
    for (const path of ['/privacy', '/terms', '/disclaimer', '/data-notice', '/login', '/signup']) {
      expect(urls).toContain(`${SITE}${path}`);
    }
    for (const url of urls) {
      const path = url.slice(SITE.length);
      expect(PRIVATE_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))).toBe(false);
    }
  });

  test('has unique absolute urls without a trailing-slash mix-up', () => {
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) expect(url.startsWith(`${SITE}/`)).toBe(true);
    expect(urls.filter((url) => url !== `${SITE}/` && url.endsWith('/'))).toEqual([]);
  });

  test('strips a trailing slash from the site url', () => {
    expect(buildSitemap(`${SITE}/`).map((entry) => entry.url)).toEqual(urls);
    expect(buildRobots(`${SITE}/`).sitemap).toBe(`${SITE}/sitemap.xml`);
  });

  test('ranks the browse pages above legal pages', () => {
    const priority = (path: string) =>
      sitemap.find((entry) => entry.url === `${SITE}${path}`)?.priority ?? 0;
    expect(priority('/')).toBeGreaterThanOrEqual(priority('/find'));
    expect(priority('/find/civil-engineering')).toBeGreaterThan(priority('/privacy'));
  });
});
