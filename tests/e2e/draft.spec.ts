import { expect, login, requireFixture, test } from './fixtures';

// Smoke #3 (PLAN.md §9 week 3): draft with the mock provider → mark sent → tracker → mark replied.
// Needs LLM_PROVIDER=mock locally and the fixture login. Each run uses 1 of the 20 daily drafts.
const PROFESSOR_ID = '42d46bbb-1e33-45ee-95fd-016ba18424c3'; // Huang Feng, CUGB (dataset row)

test.describe('draft flow', () => {
  test('generate, mark sent, appears in tracker, mark replied', async ({ page }) => {
    requireFixture();
    await login(page, `/professor/${PROFESSOR_ID}/draft`);

    await page.getByRole('button', { name: 'Generate draft' }).click();
    const body = page.getByLabel('Email body');
    await expect(body).toHaveValue(/Dear Professor Huang Feng/, { timeout: 30_000 });
    await expect(page.getByLabel('Subject')).toHaveValue(/Prospective .* Applicant/);

    await page.getByRole('button', { name: 'I sent this' }).click();
    await expect(page.getByRole('status')).toContainText('Marked as sent');
    await page.getByRole('link', { name: 'Open tracker' }).click();

    await expect(page).toHaveURL(/\/tracker$/);
    const row = page.getByRole('listitem').filter({ hasText: 'Huang Feng' }).first();
    await row.getByLabel('Status').selectOption('replied_positive');
    await expect(row.getByText(/replied \d{4}-\d{2}-\d{2}/)).toBeVisible();
  });
});
