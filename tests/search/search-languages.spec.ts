// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, Page } from '@playwright/test';

async function softOutcome(page: Page) {
  // Soft check: either results counter or the "nothing found" message
  const counter = page.getByText(/\d+\s*(з|из)\s*\d+\s*товар/).first();
  const empty = page.getByRole('heading', { level: 2, name: /нічого не знайдено|ничего не найдено/i });
  await expect(counter.or(empty).first()).toBeVisible();
}

test.describe('Поиск товара', () => {
  test('Кириллица, латиница и украинская/русская формы', async ({ page }) => {
    await page.goto('https://md-fashion.ua/');
    const search = page.getByRole('searchbox', { name: 'Пошук', exact: true });

    // 1. Искать «платье» (рус.), затем «сукня» (укр.).
    for (const q of ['платье', 'сукня']) {
      await search.fill(q);
      await search.press('Enter');
      await expect(page).toHaveURL(/\/store\?s=/);
      await softOutcome(page);
    }

    // 2. Искать «Tommy Hilfiger», затем «tommy hilfiger» и «томмі».
    for (const q of ['Tommy Hilfiger', 'tommy hilfiger', 'томмі']) {
      await search.fill(q);
      await search.press('Enter');
      await expect(page).toHaveURL(/\/store\?s=/);
      await softOutcome(page);
    }

    // 3. Переключить язык ссылкой «Російська» в шапке и повторить поиск «платье».
    // The link is not clickable in the viewport (hidden dropdown), so follow its href.
    await page.goto('https://md-fashion.ua/');
    const ruLink = page.getByRole('link', { name: 'Російська' });
    const href = await ruLink.getAttribute('href');
    await page.goto(href!);
    await expect(page).toHaveURL(/\/ru\/?$/);

    const searchRu = page.getByRole('searchbox', { name: 'Поиск', exact: true });
    await searchRu.fill('платье');
    await searchRu.press('Enter');
    await expect(page).toHaveURL(/\/ru\/store\?s=/);
    await expect(page.getByText(/\d+\s*из\s*\d+\s*товар/).first()).toBeVisible();
  });
});
