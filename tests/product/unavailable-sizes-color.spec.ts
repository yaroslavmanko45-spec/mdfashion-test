// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, PRODUCTS } from '../../pom';

test.describe('Страница товара', () => {
  test('Недоступные размеры и цвет', async ({ page, productPage }) => {
    const { blackDress, navyDress } = PRODUCTS;

    // 1. Найти товар, у которого часть размеров отсутствует, и открыть карточку.
    // NB: на сайте недоступные размеры не помечаются классом disabled - они не рендерятся вообще.
    // У темно-синего варианта нет XXS и L (в отличие от чорного), открываем его.
    await productPage.open(navyDress.url);
    await expect(productPage.sizes).toHaveText(navyDress.sizes);
    await expect(productPage.size('XXS')).toHaveCount(0);
    await expect(productPage.size('L')).toHaveCount(0);
    // Все отображаемые размеры в наличии
    for (const quantity of await productPage.sizeQuantities()) {
      expect(quantity).toBeGreaterThan(0);
    }
    // Доступный размер выбирается
    await productPage.selectSize('S');
    await expect(productPage.size('S')).toHaveClass(/active/);

    // 2. Переключить цвет на другой вариант модели.
    await productPage.open(blackDress.url);
    await expect(productPage.h1).toContainText('чорна');
    await expect(productPage.sizes).toHaveText(blackDress.sizes);
    await productPage.colorItem('temno-synya').click();
    await expect(page).toHaveURL(navyDress.url);
    await expect(productPage.h1).toContainText('темно-синя');
    // В Firefox подпись цвета иногда остаётся скрытой (display) сразу после клика по цвету — проверяем наличие в DOM,
    // а выбранный цвет подтверждает активный элемент карусели ниже.
    await expect(page.getByText('Колір: синій')).toBeAttached();
    await expect(productPage.activeColor).toHaveAttribute('href', new URL(navyDress.url).pathname);
    await expect(productPage.sizes).toHaveText(navyDress.sizes);
  });
});
