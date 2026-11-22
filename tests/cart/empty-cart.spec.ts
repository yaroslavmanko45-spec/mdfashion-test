// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Корзина без оформления заказа', () => {
  test('Пустая корзина при прямом открытии', async ({ page }) => {
    // 1. В чистом контексте открыть https://md-fashion.ua/cart/index.
    const response = await page.goto('https://md-fashion.ua/cart/index');
    expect(response?.status()).toBeLessThan(400);

    await expect(page.getByText('У вашому кошику немає товарів').first()).toBeVisible();
    await expect(page.getByText('Повернутися до покупок').first()).toBeVisible();
    await expect(page.getByText('Оформити замовлення')).toHaveCount(0);
    await expect(page.locator('a.cart[href="/cart/index"] .counter').first()).toHaveText('0');
  });
});
