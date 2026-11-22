// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Страница товара', () => {
  test('Открытие по прямому URL и поведение страницы', async ({ page, context }) => {
    const path = '/store/zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi';
    const url = 'https://md-fashion.ua' + path;

    // 1. В новой вкладке открыть прямой URL товара.
    const tab = await context.newPage();
    const appErrors: string[] = [];
    tab.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const src = msg.location().url;
      // Игнорируем сторонние трекеры: оставляем ошибки без URL источника или с md-fashion.ua
      if (!src || src.includes('md-fashion.ua')) appErrors.push(msg.text());
    });
    tab.on('pageerror', (err) => appErrors.push(err.message));

    const response = await tab.goto(url);
    expect(response?.status()).toBe(200);
    await expect(tab).toHaveURL(url);
    expect(tab.url()).toBe(url);
    await expect(tab).toHaveTitle('Жіноча чорна сукня SLIM 5X2 RIB Tommy Hilfiger WW0WW46138 — MD-Fashion');
    await expect(tab.locator('h1')).toContainText('Жіноча чорна сукня SLIM 5X2 RIB');
    await expect(tab.locator('.price_current')).toBeVisible();
    expect(appErrors).toEqual([]);
    await tab.close();

    // 2. Нажать «Назад» браузера после перехода из выдачи поиска.
    await page.goto('https://md-fashion.ua/');
    const searchbox = page.getByRole('searchbox', { name: 'Пошук', exact: true });
    await searchbox.fill('WW0WW46138');
    await searchbox.press('Enter');
    await expect(page).toHaveURL('https://md-fashion.ua/store?s=WW0WW46138');

    await page.locator('a.products-item__link[href$="ww0ww46138-chornyi"]').click();
    await expect(page).toHaveURL(url);

    await page.goBack();
    await expect(page).toHaveURL('https://md-fashion.ua/store?s=WW0WW46138');
    await expect(page.locator('a.products-item__link[href$="ww0ww46138-chornyi"]')).toBeVisible();
  });
});
