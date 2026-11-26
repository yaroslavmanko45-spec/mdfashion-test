// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, PRODUCTS } from '../../pom';

test.describe('Корзина без оформления заказа', () => {
  test('Попытка добавления без выбора размера (валидация)', async ({ productPage, cartPage }) => {
    const productUrl = PRODUCTS.blackDress.url;

    // 1. Открыть карточку WW0WW46138, не выбирая размер, нажать «Додати в кошик».
    await productPage.open(productUrl);
    await productPage.addToCart();
    await expect(productPage.sizeError).toBeVisible();
    await expect(productPage.sizeError).toHaveText('Виберіть розмір');
    await expect(productPage.cartCounter).toHaveText('0');

    // Подтверждение: корзина пуста
    await cartPage.open();
    await expect(cartPage.cartCounter).toHaveText('0');
    await expect(cartPage.itemsCountLabel('1 товар')).toHaveCount(0);

    // 2. Выбрать «S» и снова нажать «Додати в кошик».
    await productPage.open(productUrl);
    await productPage.addToCart();
    await expect(productPage.sizeError).toBeVisible();
    // Выбор размера должен скрыть ошибку; если скрипты страницы ещё не готовы, клик теряется — повторяем.
    await expect(async () => {
      if (!(await productPage.size('S').evaluate((el) => el.classList.contains('active')))) await productPage.selectSize('S');
      await expect(productPage.size('S')).toHaveClass(/active/, { timeout: 3000 });
      await expect(productPage.sizeError).toBeHidden({ timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    await productPage.addToCart({ waitForAdded: true });

    // Подтверждение: товар добавлен с размером S
    await cartPage.openWithItems();
    await expect(cartPage.itemsCountLabel('1 товар')).toBeVisible();
    await expect(cartPage.itemSize('S').first()).toHaveText('S');
  });
});
