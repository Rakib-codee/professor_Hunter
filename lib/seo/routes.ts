import type { MetadataRoute } from 'next';
import { MAJORS } from '@/lib/constants';

// robots.txt and sitemap.xml content (PLAN.md §Q19: professor pages are never indexed;
// only the landing, browse and legal pages are). Pure functions so they are unit-testable;
// app/robots.ts and app/sitemap.ts only inject the site URL.

/** Path prefixes crawlers must not index: per-professor pages, everything behind login, APIs. */
export const PRIVATE_PATH_PREFIXES: readonly string[] = [
  '/professor/',
  '/dashboard',
  '/tracker',
  '/saved',
  '/profile',
  '/onboarding',
  '/admin',
  '/api/',
  '/auth/',
];

const LEGAL_PATHS = ['/privacy', '/terms', '/disclaimer', '/data-notice'] as const;
const AUTH_PATHS = ['/login', '/signup'] as const;

const PRIORITY = { home: 1, browse: 0.9, major: 0.8, auth: 0.5, legal: 0.3 } as const;

function normalizeSiteUrl(siteUrl: string): string {
  return siteUrl.replace(/\/+$/, '');
}

export function buildRobots(siteUrl: string): MetadataRoute.Robots {
  const site = normalizeSiteUrl(siteUrl);
  return {
    rules: { userAgent: '*', allow: '/', disallow: [...PRIVATE_PATH_PREFIXES] },
    sitemap: `${site}/sitemap.xml`,
  };
}

export function buildSitemap(siteUrl: string): MetadataRoute.Sitemap {
  const site = normalizeSiteUrl(siteUrl);
  const entry = (
    path: string,
    priority: number,
    changeFrequency: 'weekly' | 'monthly' | 'yearly',
  ): MetadataRoute.Sitemap[number] => ({ url: `${site}${path}`, priority, changeFrequency });

  return [
    entry('/', PRIORITY.home, 'weekly'),
    entry('/find', PRIORITY.browse, 'weekly'),
    ...MAJORS.map((major) => entry(`/find/${major.slug}`, PRIORITY.major, 'weekly')),
    ...AUTH_PATHS.map((path) => entry(path, PRIORITY.auth, 'yearly')),
    ...LEGAL_PATHS.map((path) => entry(path, PRIORITY.legal, 'monthly')),
  ];
}
