// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, PRODUCTS } from '../../pom';

test.describe('Страница товара', () => {
  test('Выбор размера и таблица размеров', async ({ productPage }) => {
    // 1. Открыть карточку, найти блок «Розмір» с вариантами XXS, XS, S, M, L.
    await productPage.open(PRODUCTS.blackDress.url);
    await expect(productPage.sizesTitle).toContainText('Розмір');
    await expect(productPage.sizes.first()).toBeVisible();
    // Ни один размер по умолчанию не выбран
    await expect(productPage.activeSizes).toHaveCount(0);

    // 2. Кликнуть «M».
    await productPage.selectSize('M');
    await expect(productPage.size('M')).toHaveClass(/active/);

    // Выбор другого размера снимает предыдущий
    await productPage.selectSize('S');
    await expect(productPage.size('S')).toHaveClass(/active/);
    await expect(productPage.size('M')).not.toHaveClass(/active/);

    // 3. Нажать «Таблиця розмірів».
    await productPage.sizeChartButton.click();
    await expect(productPage.sizeChartPopup).toBeVisible();

    // Закрывается крестиком
    await productPage.sizeChartClose.click();
    await expect(productPage.sizeChartPopup).toHaveCount(0);
  });
});
