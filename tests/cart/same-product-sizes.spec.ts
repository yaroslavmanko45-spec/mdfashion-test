// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, PRODUCTS } from '../../pom';

test.describe('Корзина без оформления заказа', () => {
  test('Один товар в разных размерах', async ({ productPage, cartPage }) => {
    const url = PRODUCTS.blackDress.url;
    const sizes = cartPage.itemSizes;

    // 1. Добавить WW0WW46138 размер S, вернуться на карточку, добавить размер M.
    await productPage.addSizeToCart(url, 'S');
    await productPage.addSizeToCart(url, 'M');

    await cartPage.openWithItems();
    await expect(sizes).toHaveCount(2);
    await expect(sizes.nth(0)).toHaveAttribute('data-size', 'S');
    await expect(sizes.nth(1)).toHaveAttribute('data-size', 'M');
    await expect(cartPage.itemsCountLabel('2 товари')).toBeVisible();

    const two = await cartPage.readTotals();
    expect(two.sum).toBeGreaterThan(0);
    expect(two.total).toBe(two.sum - two.discount);

    // 2. Добавить тот же товар в том же размере M ещё раз.
    // Фактическое поведение: поля количества нет, добавляется отдельная строка "Розмір: M".
    await productPage.addSizeToCart(url, 'M');
    await cartPage.openWithItems();
    await expect(cartPage.itemsCountLabel('3 товари')).toBeVisible();
    await expect(sizes).toHaveCount(3);
    await expect(sizes.nth(0)).toHaveAttribute('data-size', 'S');
    await expect(sizes.nth(1)).toHaveAttribute('data-size', 'M');
    await expect(sizes.nth(2)).toHaveAttribute('data-size', 'M');

    const three = await cartPage.readTotals();
    expect(three.sum).toBe(Math.round((two.sum / 2) * 3));
    expect(three.total).toBe(three.sum - three.discount);
    expect(three.total).toBeGreaterThan(two.total);
  });
});
