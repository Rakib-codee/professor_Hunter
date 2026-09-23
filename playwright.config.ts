import { defineConfig, devices } from '@playwright/test';

// Smoke tests against a running dev server (PLAN.md §10). Credentials for the fixture
// account come from .env.local (E2E_EMAIL / E2E_PASSWORD); values are never committed.
if (!process.env.CI) {
  try {
    process.loadEnvFile('.env.local');
  } catch {
    // No .env.local (e.g. fresh clone): tests that need a login will skip.
  }
}

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'mobile-chromium', use: { ...devices['Pixel 5'] } }],
  webServer: {
    command: process.env.PLAYWRIGHT_WEB_SERVER ?? 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
