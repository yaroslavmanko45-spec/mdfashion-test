// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, PRODUCTS, URLS } from '../../pom';

test.describe('Страница товара', () => {
  test('Хлебные крошки', async ({ page, productPage }) => {
    const product = PRODUCTS.blackDress;

    // 1. Открыть карточку и посмотреть крошки.
    await productPage.open(product.url);
    await expect(productPage.breadcrumbItems).toHaveText([
      'Головна',
      'Каталог',
      'Жінкам',
      'Одяг',
      'Сукні',
      'Сукні-светри',
      'Tommy Hilfiger',
      product.fullName,
    ]);

    // 2. Кликнуть по «Сукні».
    await productPage.breadcrumbLink('/store/women/odyah/sukni').click();
    await expect(page).toHaveURL(URLS.dressesCategory);
    await expect(page.getByRole('heading', { level: 1, name: 'Сукні' })).toBeVisible();
    await expect(page.locator('a[href*="/store/"]:has(img)').first()).toBeVisible();

    // 3. Нажать «Головна».
    await productPage.open(product.url);
    await productPage.breadcrumbLink('/').click();
    await expect(page).toHaveURL(URLS.home);
  });
});
