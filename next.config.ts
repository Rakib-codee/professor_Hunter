import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // CSV import and CV upload post files through Server Actions (2 MB cap each, PLAN.md §9).
  experimental: { serverActions: { bodySizeLimit: '3mb' } },
};

export default nextConfig;
