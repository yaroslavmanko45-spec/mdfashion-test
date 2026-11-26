// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, PRODUCTS, parsePrice } from '../../pom';

test.describe('Корзина без оформления заказа', () => {
  test('Добавление товара с выбранным размером', async ({ page, productPage, cartPage }) => {
    const product = PRODUCTS.blackDress;

    // 1. Открыть карточку WW0WW46138, кликнуть размер «M», нажать «Додати в кошик».
    await productPage.open(product.url);
    await productPage.selectSize('M');
    await expect(productPage.size('M')).toHaveClass(/active/);
    const cardPriceText = (await productPage.priceCurrent.innerText()).trim();
    const cardPrice = parsePrice(cardPriceText);
    await productPage.addToCart({ waitForAdded: true });
    await expect(page).toHaveURL(/\/store\/zhinocha-chorna-suknya/);

    // 2. Открыть /cart/index (иконка корзины в шапке). Счётчик надёжно проверяется только здесь.
    await cartPage.openWithItems();
    await expect(cartPage.cartCounter).toHaveText('1');
    await expect(cartPage.heading).toBeVisible();
    await expect(cartPage.itemsCountLabel('1 товар')).toBeVisible();
    await expect(cartPage.firstItemRow.getByText(/^Tommy Hilfiger$/i)).toBeVisible();
    await expect(page.getByText(product.name).first()).toBeVisible();
    await expect(cartPage.sizeLabels).toBeVisible();
    await expect(cartPage.colorLabels).toBeVisible();
    await expect(page.getByText('Чорний', { exact: true }).first()).toBeVisible();

    // Блок «Ваше замовлення»
    await expect(cartPage.orderSummaryTitle).toBeVisible();
    const { sum, discount, total } = await cartPage.readTotals();
    expect(total).toBe(sum - discount);
    expect(total).toBe(cardPrice);
    await expect(page.getByText(cardPriceText).first()).toBeVisible();

    await expect(cartPage.promoToggle).toBeVisible();
    // Кнопка «Застосувати» скрыта, пока не раскрыт блок «Маєте промокод?»
    await expect(cartPage.promoApplyText).toBeAttached();
    // Только проверка наличия — НЕ нажимать
    await expect(cartPage.checkoutButton.first()).toBeVisible();
  });
});
