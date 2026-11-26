// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, NONEXISTENT_PRODUCT_URL, PRODUCTS } from '../../pom';

test.describe('Страница товара', () => {
  test('Несуществующий URL товара', async ({ page, notFoundPage }) => {
    // 1. Открыть https://md-fashion.ua/store/nonexistent-product-xyz-000.
    const response = await notFoundPage.goto(NONEXISTENT_PRODUCT_URL);
    expect(response?.status()).toBe(404);
    await expect(notFoundPage.message).toBeVisible();
    await expect(notFoundPage.banner).toBeVisible();
    await expect(notFoundPage.footer).toBeVisible();
    await expect(notFoundPage.homeLink).toBeVisible();
    await expect(notFoundPage.fatalError).toHaveCount(0);
    const title = await page.title();
    if (!title.trim()) {
      test.info().annotations.push({
        type: 'observation',
        description: 'Пустой title на странице 404 (возможный дефект SEO/UX)',
      });
    }

    // 2. Открыть существующий URL, изменив последний сегмент (убрав «-chornyi»).
    const response2 = await notFoundPage.goto(PRODUCTS.blackDress.url.replace(/-chornyi$/, ''));
    const status = response2?.status() ?? 0;
    expect(status).toBeLessThan(500);
    if (status === 404) {
      await expect(notFoundPage.message).toBeVisible();
    } else {
      expect(status).toBeLessThan(400);
    }
    await expect(notFoundPage.banner).toBeVisible();
    await expect(notFoundPage.footer).toBeVisible();
  });
});
