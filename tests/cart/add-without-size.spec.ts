// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Корзина без оформления заказа', () => {
  test('Попытка добавления без выбора размера (валидация)', async ({ page }) => {
    const productUrl = 'https://md-fashion.ua/store/zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi';
    const addToCartBtn = page.locator('button.add_to_cart_product_btn');
    const sizeError = page.locator('.product_last_label_error');
    const cartCounter = page.locator('a.cart .counter').first();

    // 1. Открыть карточку WW0WW46138, не выбирая размер, нажать «Додати в кошик».
    await page.goto(productUrl);
    await addToCartBtn.click();
    await expect(sizeError).toBeVisible();
    await expect(sizeError).toHaveText('Виберіть розмір');
    await expect(cartCounter).toHaveText('0');

    // Подтверждение: корзина пуста
    await page.goto('https://md-fashion.ua/cart/index');
    await expect(cartCounter).toHaveText('0');
    await expect(page.getByText('1 товар')).toHaveCount(0);

    // 2. Выбрать «S» и снова нажать «Додати в кошик».
    await page.goto(productUrl);
    await addToCartBtn.click();
    await expect(sizeError).toBeVisible();
    await page.locator('.product_size_button[data-size="S"]').click();
    await expect(page.locator('.product_size_button[data-size="S"]')).toHaveClass(/active/);
    await addToCartBtn.click();
    await expect(sizeError).toBeHidden();

    // Подтверждение: товар добавлен с размером S
    await page.goto('https://md-fashion.ua/cart/index');
    await expect(page.getByText('1 товар')).toBeVisible();
    await expect(page.locator('.enhanced-product-size[data-size="S"]').first()).toHaveText('S');
  });
});
