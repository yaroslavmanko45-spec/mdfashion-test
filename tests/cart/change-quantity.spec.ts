// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, PRODUCTS } from '../../pom';

test.describe('Корзина без оформления заказа', () => {
  test('Изменение количества и пересчёт суммы', async ({ productPage, cartPage }) => {
    const url = PRODUCTS.blackDress.url;

    // 1. Добавить товар, открыть /cart/index и найти элемент изменения количества
    await productPage.addSizeToCart(url, 'M');
    await cartPage.openWithItems();
    await expect(cartPage.itemSizes).toHaveCount(1);

    const single = await cartPage.readTotals();
    expect(single.total).toBeGreaterThan(0);

    // DOCUMENTATION: на сайте в корзине НЕТ контрола количества (+/-, select, input).
    // Единственное видимое поле ввода на странице - поиск в шапке.
    const cartRow = cartPage.firstItemRow;
    await expect(cartRow.locator('input, select')).toHaveCount(0);
    await expect(cartRow.locator('[class*="qty"], [class*="quantity"], [class*="plus"], [class*="minus"]')).toHaveCount(0);
    await expect(cartRow.locator('.remove-from-cart')).toBeVisible();

    // Количество меняется только повторным добавлением того же товара/размера:
    // создаётся отдельная строка, а сумма пересчитывается как N x цена.
    await productPage.addSizeToCart(url, 'M');
    await cartPage.openWithItems();
    await expect(cartPage.itemSizes).toHaveCount(2);
    await expect(cartPage.itemsCountLabel('2 товари')).toBeVisible();
    const doubled = await cartPage.readTotals();
    expect(doubled.total).toBe(single.total * 2);
  });
});
