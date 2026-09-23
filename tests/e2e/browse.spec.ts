import { expect, test } from './fixtures';

// Smoke #2 (PLAN.md §9 week 2, DoD path): Civil → Geotechnical → list → professor page,
// on a 375 px viewport, without logging in.
test.describe('browse', () => {
  test('major picker → Civil Engineering → Geotechnical tag → professor page', async ({ page }) => {
    await page.goto('/find');
    await page.getByRole('link', { name: /Civil Engineering/ }).click();
    await expect(page).toHaveURL(/\/find\/civil-engineering$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Civil Engineering');

    await page.getByRole('link', { name: /^Geotechnical Engineering \d+$/ }).click();
    await expect(page).toHaveURL(/tags=Geotechnical/);
    const results = page.getByRole('region', { name: 'Results' });
    await expect(results.getByText(/\d+ results/)).toBeVisible();

    const firstProfessor = results.getByRole('link', { name: /\(.+\)|\w+/ }).first();
    const name = (await firstProfessor.textContent())?.trim() ?? '';
    await firstProfessor.click();
    await expect(page).toHaveURL(/\/professor\/[0-9a-f-]{36}$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(name.split(' ')[0]);
    await expect(page.getByRole('link', { name: 'Log in to reveal email' })).toBeVisible();
    await expect(page.getByText('Edit before sending')).toBeVisible();
  });

  test('filters and search live in the URL', async ({ page }) => {
    await page.goto('/find/civil-engineering?accepts=confirmed&q=rock');
    const results = page.getByRole('region', { name: 'Results' });
    await expect(results.getByText(/results|No professors/)).toBeVisible();
    await expect(page.getByRole('searchbox', { name: 'Search professors' })).toHaveValue('rock');
  });
});
