// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Страница товара', () => {
  test('Дополнительные элементы: наличие в магазинах и подарок', async ({ page }) => {
    await page.goto('https://md-fashion.ua/store/zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi');

    // 1. Нажать «Самовивіз/Наявність в магазинах».
    await page.locator('.store-pickup').click();
    const popup = page.locator('.store-pickup-popup');
    await expect(popup).toBeVisible();
    await expect(popup.locator('.store-info').first()).toBeVisible();
    await popup.locator('.close').click();
    await expect(popup).toBeHidden();

    // 2. Только проверить наличие кнопки «Натякнути на подарунок».
    await expect(page.getByRole('button', { name: 'Натякнути на подарунок' })).toBeVisible();
  });
});
