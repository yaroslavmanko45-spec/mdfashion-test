// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Страница товара', () => {
  test('Фото и галерея', async ({ page }) => {
    // 1. Открыть карточку, проверить основное изображение и миниатюры.
    await page.goto('https://md-fashion.ua/store/zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi');

    // На десктопе галерея - swiper с 5 фото (отдельных миниатюр нет)
    const images = page.locator('.js-product-images-swiper img.zoom-img');
    await expect(images).toHaveCount(5);
    await expect(images.first()).toBeVisible();
    await expect(images.first()).toHaveAttribute('alt', /Жіноча чорна сукня SLIM 5X2 RIB/);

    // Lazy-load: прокручиваем каждое фото в зону видимости и проверяем naturalWidth > 0
    for (let i = 0; i < 5; i++) {
      await images.nth(i).scrollIntoViewIfNeeded();
      await expect
        .poll(async () => images.nth(i).evaluate((img: HTMLImageElement) => img.naturalWidth))
        .toBeGreaterThan(0);
    }

    // 2. Кликнуть по основному фото (увеличение).
    await images.first().click();
    const popup = page.locator('.product-preview-popup');
    await expect(popup).toBeVisible();
    const activeSlide = popup.locator('.swiper-slide-active');
    await expect(activeSlide).toHaveAttribute('aria-label', '1 / 5');
    await expect(activeSlide.locator('img')).toHaveAttribute('alt', /Жіноча чорна сукня SLIM 5X2 RIB 1/);
    await expect
      .poll(async () => activeSlide.locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);

    // Переключение на следующее фото в увеличенном просмотре
    await page.keyboard.press('ArrowRight');
    await expect(popup.locator('.swiper-slide-active')).toHaveAttribute('aria-label', '2 / 5');

    // Закрыть увеличенный просмотр
    await popup.locator('.close').click();
    await expect(popup).toHaveCount(0);
  });
});
