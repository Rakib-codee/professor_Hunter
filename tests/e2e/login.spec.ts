import { expect, login, requireFixture, test } from './fixtures';

// Smoke #1 (PLAN.md §9 week 2): log in, land on the dashboard, log out.
test.describe('login', () => {
  test('rejects a wrong password with a friendly message and keeps the email', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('nobody+authtest@example.org');
    await page.getByLabel('Password').fill('definitely-wrong');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.locator('form').getByRole('alert')).toContainText(/incorrect|not accepted/i);
    await expect(page.getByLabel('Email')).toHaveValue('nobody+authtest@example.org');
  });

  test('signs in the fixture account and reaches the dashboard', async ({ page }) => {
    requireFixture();
    await login(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Hi |Dashboard/);
    await expect(page.getByText('Profile completeness')).toBeVisible();
    await page.getByRole('button', { name: 'Log out' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('redirects anonymous visitors from protected routes to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
  });
});
