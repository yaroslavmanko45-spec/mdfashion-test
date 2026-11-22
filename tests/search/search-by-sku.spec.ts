// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Поиск товара', () => {
  test('Поиск по артикулу WW0WW46138', async ({ page }) => {
    await page.goto('https://md-fashion.ua/');
    const search = page.getByRole('searchbox', { name: 'Пошук' });
    const black = page.getByRole('link', { name: 'Жіноча чорна сукня SLIM 5X2 RIB', exact: true });
    const navy = page.getByRole('link', { name: 'Жіноча темно-синя сукня SLIM 5X2 RIB', exact: true });

    // 1. На главной ввести в «Пошук» «WW0WW46138» и нажать Enter.
    await search.fill('WW0WW46138');
    await search.press('Enter');
    await expect(page).toHaveURL(/\/store\?s=WW0WW46138/);
    await expect(page.getByText('з 3 товарів')).toBeVisible();
    await expect(black).toBeVisible();
    await expect(navy).toBeVisible();
    await expect(page.getByText(/нічого не знайдено/i)).toHaveCount(0);

    // 2. Ввести то же в нижнем регистре «ww0ww46138».
    await search.fill('ww0ww46138');
    await search.press('Enter');
    await expect(page).toHaveURL(/\/store\?s=ww0ww46138/);
    await expect(page.getByText('з 3 товарів')).toBeVisible();
    await expect(black).toBeVisible();
    await expect(navy).toBeVisible();
  });
});
