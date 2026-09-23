import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// DB security tests (PLAN.md §10): run against a real Supabase project over REST.
// `npm run test:db`. Needs NEXT_PUBLIC_SUPABASE_URL + publishable key; the
// authenticated cases also need E2E_PASSWORD. Nothing here uses the secret key.
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  test: {
    environment: 'node',
    include: ['tests/db/**/*.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
});
