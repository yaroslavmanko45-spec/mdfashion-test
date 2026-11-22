// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Страница товара', () => {
  test('Недоступные размеры и цвет', async ({ page }) => {
    const black = 'https://md-fashion.ua/store/zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi';
    const navy = 'https://md-fashion.ua/store/zhinocha-temno-synya-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-synii';

    // 1. Найти товар, у которого часть размеров отсутствует, и открыть карточку.
    // NB: на сайте недоступные размеры не помечаются классом disabled - они не рендерятся вообще.
    // У темно-синего варианта нет XXS и L (в отличие от чорного), открываем его.
    await page.goto(navy);
    const sizes = page.locator('.product_size_button');
    await expect(sizes).toHaveText(['XS', 'S', 'M']);
    await expect(page.locator('.product_size_button[data-size="XXS"]')).toHaveCount(0);
    await expect(page.locator('.product_size_button[data-size="L"]')).toHaveCount(0);
    // Все отображаемые размеры в наличии
    for (const q of await sizes.evaluateAll(els => els.map(e => Number((e as HTMLElement).dataset.quantity)))) {
      expect(q).toBeGreaterThan(0);
    }
    // Доступный размер выбирается
    await page.locator('.product_size_button[data-size="S"]').click();
    await expect(page.locator('.product_size_button[data-size="S"]')).toHaveClass(/active/);

    // 2. Переключить цвет на другой вариант модели.
    await page.goto(black);
    await expect(page.locator('h1')).toContainText('чорна');
    await expect(sizes).toHaveText(['XXS', 'XS', 'S', 'M', 'L']);
    await page.locator('a.color_carousel_item[href*="temno-synya"]').click();
    await expect(page).toHaveURL(navy);
    await expect(page.locator('h1')).toContainText('темно-синя');
    await expect(page.getByText('Колір: синій')).toBeVisible();
    await expect(page.locator('.color_carousel_item.active')).toHaveAttribute('href', navy);
    await expect(sizes).toHaveText(['XS', 'S', 'M']);
  });
});
