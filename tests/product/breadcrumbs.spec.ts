// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Страница товара', () => {
  test('Хлебные крошки', async ({ page }) => {
    const productUrl = 'https://md-fashion.ua/store/zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi';
    const breadcrumbs = page.locator('ul.breadcrumb');

    // 1. Открыть карточку и посмотреть крошки.
    await page.goto(productUrl);
    await expect(breadcrumbs.locator('li')).toHaveText([
      'Головна',
      'Каталог',
      'Жінкам',
      'Одяг',
      'Сукні',
      'Сукні-светри',
      'Tommy Hilfiger',
      'Жіноча чорна сукня SLIM 5X2 RIB Tommy Hilfiger WW0WW46138',
    ]);

    // 2. Кликнуть по «Сукні».
    await breadcrumbs.locator('a[href="/store/women/odyah/sukni"]').click();
    await expect(page).toHaveURL('https://md-fashion.ua/store/women/odyah/sukni');
    await expect(page.getByRole('heading', { level: 1, name: 'Сукні' })).toBeVisible();
    await expect(page.locator('a[href*="/store/"]:has(img)').first()).toBeVisible();

    // 3. Нажать «Головна».
    await page.goto(productUrl);
    await breadcrumbs.locator('a[href="/"]').click();
    await expect(page).toHaveURL('https://md-fashion.ua/');
  });
});
