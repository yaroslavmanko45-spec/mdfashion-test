// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Страница товара', () => {
  test('Несуществующий URL товара', async ({ page }) => {
    // 1. Открыть https://md-fashion.ua/store/nonexistent-product-xyz-000.
    const response = await page.goto('https://md-fashion.ua/store/nonexistent-product-xyz-000');
    expect(response?.status()).toBe(404);
    await expect(page.getByText('Сторінка не знайдена')).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(page.getByRole('link', { name: 'На головну' })).toBeVisible();
    await expect(page.getByText('Fatal error')).toHaveCount(0);
    const title = await page.title();
    if (!title.trim()) {
      test.info().annotations.push({
        type: 'observation',
        description: 'Пустой title на странице 404 (возможный дефект SEO/UX)',
      });
    }

    // 2. Открыть существующий URL, изменив последний сегмент (убрав «-chornyi»).
    const response2 = await page.goto(
      'https://md-fashion.ua/store/zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138',
    );
    const status = response2?.status() ?? 0;
    expect(status).toBeLessThan(500);
    if (status === 404) {
      await expect(page.getByText('Сторінка не знайдена')).toBeVisible();
    } else {
      expect(status).toBeLessThan(400);
    }
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });
});
