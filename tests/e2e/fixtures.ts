import { expect, test as base, type Page } from '@playwright/test';

// The fixture account is a real row in Supabase (see PLAN.md §10 "Test fixtures").
// Its email carries the +authtest tag so it is never mistaken for a student.
export const FIXTURE_EMAIL = process.env.E2E_EMAIL ?? 'professorhunter.help+authtest@outlook.com';
const FIXTURE_PASSWORD = process.env.E2E_PASSWORD;

export async function login(page: Page, next = '/dashboard'): Promise<void> {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel('Email').fill(FIXTURE_EMAIL);
  await page.getByLabel('Password').fill(FIXTURE_PASSWORD ?? '');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(new RegExp(`${next.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
}

export const test = base.extend({});

/** Skips the test when no fixture password is configured (fresh clone, CI without secrets). */
export function requireFixture(): void {
  test.skip(!FIXTURE_PASSWORD, 'E2E_PASSWORD not set; add it to .env.local to run login tests');
}

export { expect };
