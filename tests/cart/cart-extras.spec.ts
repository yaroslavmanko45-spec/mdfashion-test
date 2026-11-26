// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, PRODUCTS, env } from '../../pom';

test.describe('Корзина без оформления заказа', () => {
  test('Перемещение в обране и блок «З цим товаром купують»', async ({ page, productPage, cartPage }) => {
    // Подготовка: добавить товар (размер M) в корзину
    await productPage.addSizeToCart(PRODUCTS.blackDress.url, 'M');
    await cartPage.openWithItems();

    // 1. В корзине проверить блок «З цим товаром купують» и кнопку «Перемістити в Обране» (не кликать)
    await expect(cartPage.moveToFavorites).toBeVisible();
    await expect(cartPage.recommendationsHeading).toBeVisible();
    // Рекомендации приходят из рекламного фида и меняются — не привязываемся к конкретному товару.
    const recLink = cartPage.recommendationsHeading.locator('xpath=following::a[contains(@href,"/store/")][1]');
    await expect(recLink).toBeVisible();
    const recHref = (await recLink.getAttribute('href'))!;

    // 2. Ввести в поле «Маєте промокод?» заведомо неверный код «TEST000» и нажать «Застосувати»
    const before = await cartPage.readTotals();
    // Повторяем отправку: если скрипты корзины ещё не инициализировались, первый Enter теряется.
    await expect(async () => {
      await cartPage.applyPromo(env('PROMO_CODE_INVALID'));
      await expect(cartPage.promoNotApplicableError).toBeVisible({ timeout: 4000 });
    }).toPass({ timeout: 20_000 });
    expect((await cartPage.readTotals()).total).toBe(before.total);

    // Клик по рекомендации открывает карточку товара
    await recLink.click();
    await expect(page).toHaveURL(new RegExp(new URL(recHref, 'https://md-fashion.ua').pathname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
