// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Страница товара', () => {
  test('Выбор размера и таблица размеров', async ({ page }) => {
    // 1. Открыть карточку, найти блок «Розмір» с вариантами XXS, XS, S, M, L.
    await page.goto('https://md-fashion.ua/store/zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi');
    const sizes = page.locator('.product_sizes_block .product_size_button');
    await expect(page.locator('.product_sizes_block .product_info_title')).toContainText('Розмір');
    await expect(sizes.first()).toBeVisible();
    // Ни один размер по умолчанию не выбран
    await expect(page.locator('.product_sizes_block .product_size_button.active')).toHaveCount(0);

    // 2. Кликнуть «M».
    const sizeM = page.locator('.product_size_button[data-size="M"]');
    const sizeS = page.locator('.product_size_button[data-size="S"]');
    await sizeM.click();
    await expect(sizeM).toHaveClass(/active/);

    // Выбор другого размера снимает предыдущий
    await sizeS.click();
    await expect(sizeS).toHaveClass(/active/);
    await expect(sizeM).not.toHaveClass(/active/);

    // 3. Нажать «Таблиця розмірів».
    await page.locator('.size-chart-btn').click();
    const popup = page.locator('.size-popup__container');
    await expect(popup).toBeVisible();

    // Закрывается крестиком
    await popup.locator('.close').click();
    await expect(popup).toHaveCount(0);
  });
});
