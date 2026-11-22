// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

const parsePrice = (s: string | null): number =>
  parseInt((s ?? '').replace(/[^\d]/g, ''), 10);

test.describe('Корзина без оформления заказа', () => {
  test('Удаление товара и пустая корзина', async ({ page }) => {
    const products = [
      'https://md-fashion.ua/store/zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi',
      'https://md-fashion.ua/store/zhinocha-temno-synya-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-synii',
    ];

    for (const url of products) {
      await page.goto(url);
      await page.locator('.product_size_button[data-size="M"]').click();
      await page.locator('button.add_to_cart_product_btn').click();
      await expect(page.getByText('Додано в кошик').first()).toBeVisible();
    }

    await page.goto('https://md-fashion.ua/cart/index');
    await expect(page.locator('span.enhanced-product-size').first()).toBeVisible();

    const removeButtons = page.locator('.remove-from-cart');
    const counter = page.locator('a.cart[href="/cart/index"] .counter').first();
    await expect(removeButtons).toHaveCount(2);
    await expect(page.getByText('2 товари')).toBeVisible();
    await expect(counter).toHaveText('2');

    const totalRow = page.getByText('Всього', { exact: true }).locator('xpath=following-sibling::*[1]');
    const sumRow = page.getByText('Сума замовлення', { exact: true }).locator('xpath=following-sibling::*[1]');
    const sumBefore = parsePrice(await sumRow.textContent());
    const totalBefore = parsePrice(await totalRow.textContent());

    // 1. Добавить два товара, в /cart/index нажать «Видалити» у одного.
    await removeButtons.first().click();
    await page.locator('.exit-block__btn button:has-text("Видалити")').click();

    await expect(removeButtons).toHaveCount(1);
    await expect(page.getByText('1 товар', { exact: true })).toBeVisible();
    await expect(counter).toHaveText('1');
    await expect(async () => {
      const sumAfter = parsePrice(await sumRow.textContent());
      const totalAfter = parsePrice(await totalRow.textContent());
      expect(sumAfter).toBeLessThan(sumBefore);
      expect(totalAfter).toBeLessThan(totalBefore);
    }).toPass();

    // 2. Нажать «Видалити» у последнего товара.
    await removeButtons.first().click();
    await page.locator('.exit-block__btn button:has-text("Видалити")').click();

    await expect(page.getByText('У вашому кошику немає товарів')).toBeVisible();
    await expect(page.getByText('Повернутися до покупок')).toBeVisible();
    await expect(removeButtons).toHaveCount(0);
    await expect(page.getByText('Оформити замовлення')).toHaveCount(0);
    await expect(counter).toHaveText('0');
  });
});
