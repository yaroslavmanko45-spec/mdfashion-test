// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Корзина без оформления заказа', () => {
  test('Счётчик корзины в шапке', async ({ page }) => {
    const counter = page.locator('a.cart[href="/cart/index"] .counter').first();
    const product1 = 'https://md-fashion.ua/store/zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi';
    const product2 = 'https://md-fashion.ua/store/zhinocha-temno-synya-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-synii';

    // 1. На чистом состоянии проверить иконку корзины в шапке.
    await page.goto('https://md-fashion.ua/cart/index');
    await expect(counter).toHaveText('0');

    // 2. Добавить товар (размер M), затем второй другой товар.
    // Примечание: на карточке товара счётчик обновляется нестабильно, поэтому проверяем его на /cart/index.
    await page.goto(product1);
    await page.locator('.product_size_button[data-size="M"]').click();
    await expect(page.locator('.product_size_button[data-size="M"]')).toHaveClass(/active/);
    await page.locator('button.add_to_cart_product_btn').click();
    await page.goto('https://md-fashion.ua/cart/index');
    await expect(counter).toHaveText('1');

    await page.goto(product2);
    await page.locator('.product_size_button[data-size="M"]').click();
    await expect(page.locator('.product_size_button[data-size="M"]')).toHaveClass(/active/);
    await page.locator('button.add_to_cart_product_btn').click();
    await page.goto('https://md-fashion.ua/cart/index');
    await expect(counter).toHaveText('2');

    // 3. Удалить все товары.
    const removeButtons = page.locator('.remove-from-cart');
    await expect(removeButtons).toHaveCount(2);

    await removeButtons.first().click();
    await page.locator('button:has-text("Видалити")').click();
    await expect(removeButtons).toHaveCount(1);
    await expect(counter).toHaveText('1');

    await removeButtons.first().click();
    await page.locator('button:has-text("Видалити")').click();
    await expect(removeButtons).toHaveCount(0);
    await expect(counter).toHaveText('0');
  });
});
