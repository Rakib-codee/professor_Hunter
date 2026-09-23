import type { MetadataRoute } from 'next';
import { getPublicEnv } from '@/lib/env';
import { buildSitemap } from '@/lib/seo/routes';

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(getPublicEnv().NEXT_PUBLIC_SITE_URL);
}
