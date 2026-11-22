// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Поиск товара', () => {
  test('Регистр и лишние пробелы', async ({ page }) => {
    await page.goto('https://md-fashion.ua/');
    const search = page.getByRole('searchbox', { name: 'Пошук' });
    const counter = page.getByText(/\d+\s*з\s*\d+\s*товар/).first();

    // 1. Выполнить поиск «СУКНЯ».
    await search.fill('СУКНЯ');
    await search.press('Enter');
    await expect(page).toHaveURL(/\/store\?s=/);
    await expect(counter).toBeVisible();
    const upperCount = (await counter.innerText()).match(/з\s*(\d+)/)![1];

    // 2. Выполнить поиск «  сукня  » (пробелы до и после).
    await search.fill('  сукня  ');
    await search.press('Enter');
    await expect(page).toHaveURL(/\/store\?s=\+\+/);
    await expect(counter).toContainText(`з ${upperCount}`);

    // 3. Выполнить поиск «сукня   чорна» (несколько пробелов внутри).
    await search.fill('сукня   чорна');
    await search.press('Enter');
    await expect(page).toHaveURL(/\/store\?s=%D1%81%D1%83%D0%BA%D0%BD%D1%8F\+\+\+/);
    await expect(counter).toBeVisible();
    await expect(counter).not.toContainText(`з ${upperCount}`);
  });
});
