// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, PRODUCTS } from '../../pom';

test.describe('Страница товара', () => {
  test('Дополнительные элементы: наличие в магазинах и подарок', async ({ productPage }) => {
    await productPage.open(PRODUCTS.blackDress.url);

    // 1. Нажать «Самовивіз/Наявність в магазинах».
    // NB: без выбранного размера клик по кнопке ничего не открывает (запрашивается наличие по skuId) — сначала выбираем размер.
    await productPage.selectSize('M');
    await expect(productPage.size('M')).toHaveClass(/active/);
    await productPage.openStorePickup();
    await expect(productPage.storePickupItems.first()).toBeVisible();
    await productPage.storePickupClose.click();
    await expect(productPage.storePickupPopup).toBeHidden();

    // 2. Только проверить наличие кнопки «Натякнути на подарунок».
    await expect(productPage.giftHintButton).toBeVisible();
  });
});
