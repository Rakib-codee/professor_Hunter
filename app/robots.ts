import type { MetadataRoute } from 'next';
import { getPublicEnv } from '@/lib/env';
import { buildRobots } from '@/lib/seo/routes';

export default function robots(): MetadataRoute.Robots {
  return buildRobots(getPublicEnv().NEXT_PUBLIC_SITE_URL);
}
