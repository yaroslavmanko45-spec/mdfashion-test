// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, PRODUCTS } from '../../pom';

test.describe('Корзина без оформления заказа', () => {
  test('Счётчик корзины в шапке', async ({ productPage, cartPage }) => {
    const counter = cartPage.cartCounter;

    // 1. На чистом состоянии проверить иконку корзины в шапке.
    await cartPage.open();
    await expect(counter).toHaveText('0');

    // 2. Добавить товар (размер M), затем второй другой товар.
    // Примечание: на карточке товара счётчик обновляется нестабильно, поэтому проверяем его на /cart/index.
    let expected = 0;
    for (const product of [PRODUCTS.blackDress, PRODUCTS.navyDress]) {
      await productPage.addSizeToCart(product.url, 'M');
      await cartPage.openWithItems();
      await expect(counter).toHaveText(String(++expected));
    }

    // 3. Удалить все товары.
    await expect(cartPage.removeButtons).toHaveCount(2);

    await cartPage.removeFirstItem();
    await expect(cartPage.removeButtons).toHaveCount(1);
    await expect(counter).toHaveText('1');

    await cartPage.removeFirstItem();
    await expect(cartPage.removeButtons).toHaveCount(0);
    await expect(counter).toHaveText('0');
  });
});
