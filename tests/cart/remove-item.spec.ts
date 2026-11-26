// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, PRODUCTS } from '../../pom';

test.describe('Корзина без оформления заказа', () => {
  test('Удаление товара и пустая корзина', async ({ productPage, cartPage }) => {
    for (const product of [PRODUCTS.blackDress, PRODUCTS.navyDress]) {
      await productPage.addSizeToCart(product.url, 'M');
    }

    await cartPage.openWithItems();
    await cartPage.waitForItems();

    const counter = cartPage.cartCounter;
    await expect(cartPage.removeButtons).toHaveCount(2);
    await expect(cartPage.itemsCountLabel('2 товари')).toBeVisible();
    await expect(counter).toHaveText('2');
    const before = await cartPage.readTotals();

    // 1. Добавить два товара, в /cart/index нажать «Видалити» у одного.
    await cartPage.removeFirstItem();

    await expect(cartPage.removeButtons).toHaveCount(1);
    await expect(cartPage.itemsCountLabel('1 товар')).toBeVisible();
    await expect(counter).toHaveText('1');
    await expect(async () => {
      const after = await cartPage.readTotals();
      expect(after.sum).toBeLessThan(before.sum);
      expect(after.total).toBeLessThan(before.total);
    }).toPass();

    // 2. Нажать «Видалити» у последнего товара.
    await cartPage.removeFirstItem();

    await expect(cartPage.emptyMessage).toBeVisible();
    await expect(cartPage.backToShopping).toBeVisible();
    await expect(cartPage.removeButtons).toHaveCount(0);
    await expect(cartPage.checkoutButton).toBeHidden(); // кнопка остаётся в DOM скрытой
    await expect(counter).toHaveText('0');
  });
});
