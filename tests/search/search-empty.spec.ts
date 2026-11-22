// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Поиск товара', () => {
  test('Пустой запрос и только пробелы', async ({ page }) => {
    const response = await page.goto('https://md-fashion.ua/');
    expect(response?.status()).toBeLessThan(500);

    const searchbox = page.getByRole('searchbox', { name: 'Пошук', exact: true });

    // 1. На главной кликнуть в «Пошук» и нажать Enter без ввода.
    await searchbox.click();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/md-fashion\.ua\/store/);
    await expect(page).toHaveTitle(/Каталог всіх товарів/);

    // 2. Ввести только пробелы «   » и нажать Enter.
    const response2 = await page.goto('https://md-fashion.ua/');
    expect(response2?.status()).toBeLessThan(500);
    await searchbox.fill('   ');
    await searchbox.press('Enter');
    await expect(page).toHaveURL(/md-fashion\.ua\/store/);
    await expect(page).toHaveTitle(/Каталог всіх товарів/);
  });
});
