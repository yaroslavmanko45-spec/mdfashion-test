// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../pom';

test.describe('Корзина без оформления заказа', () => {
  test('Пустая корзина при прямом открытии', async ({ cartPage }) => {
    // 1. В чистом контексте открыть https://md-fashion.ua/cart/index.
    const response = await cartPage.open();
    expect(response?.status()).toBeLessThan(400);

    await expect(cartPage.emptyMessage).toBeVisible();
    await expect(cartPage.backToShopping).toBeVisible();
    await expect(cartPage.checkoutButton).toBeHidden(); // кнопка есть в DOM (.not-empty-container), но скрыта
    await expect(cartPage.cartCounter).toHaveText('0');
  });
});
