// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, PRODUCTS, ProductPage } from '../../pom';

test.describe('Страница товара', () => {
  test('Фото и галерея', async ({ page, productPage }) => {
    const product = PRODUCTS.blackDress;

    // 1. Открыть карточку, проверить основное изображение и миниатюры.
    await productPage.open(product.url);

    // На десктопе галерея - swiper с 5 фото (отдельных миниатюр нет)
    const images = productPage.galleryImages;
    await expect(images).toHaveCount(5);
    await expect(images.first()).toBeVisible();
    await expect(images.first()).toHaveAttribute('alt', new RegExp(product.name));

    // Lazy-load: прокручиваем каждое фото в зону видимости и проверяем naturalWidth > 0
    for (let i = 0; i < 5; i++) {
      await images.nth(i).scrollIntoViewIfNeeded();
      await expect.poll(() => ProductPage.naturalWidth(images.nth(i))).toBeGreaterThan(0);
    }

    // 2. Кликнуть по основному фото (увеличение).
    await images.first().click();
    await expect(productPage.previewPopup).toBeVisible();
    const activeSlide = productPage.previewActiveSlide;
    await expect(activeSlide).toHaveAttribute('aria-label', '1 / 5');
    await expect(activeSlide.locator('img')).toHaveAttribute('alt', new RegExp(`${product.name} 1`));
    await expect.poll(() => ProductPage.naturalWidth(activeSlide.locator('img'))).toBeGreaterThan(0);

    // Переключение на следующее фото в увеличенном просмотре
    await page.keyboard.press('ArrowRight');
    await expect(productPage.previewActiveSlide).toHaveAttribute('aria-label', '2 / 5');

    // Закрыть увеличенный просмотр
    await productPage.previewClose.click();
    await expect(productPage.previewPopup).toHaveCount(0);
  });
});
