// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Страница товара', () => {
  test('Переход в карточку из результатов поиска и сверка данных', async ({ page }) => {
    await page.goto('https://md-fashion.ua/');

    // 1. Выполнить поиск «WW0WW46138». Запомнить данные первой карточки и кликнуть по ней.
    const searchbox = page.getByRole('searchbox', { name: 'Пошук', exact: true });
    await searchbox.fill('WW0WW46138');
    await searchbox.press('Enter');

    const productName = 'Жіноча чорна сукня SLIM 5X2 RIB';
    const card = page.locator('.catalogue-product').filter({
      has: page.locator('a[href$="zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi"]'),
    });
    await expect(card).toBeVisible();

    const listName = (await card.locator('.product-info__name').innerText()).trim();
    const listPrice = (await card.locator('.product-info__price__text_new').innerText()).trim();
    const listOldPrice = (await card.locator('.product-info__price__text_old').innerText()).trim();
    const listDiscount = (await card.locator('.product-wobler__item.sale').innerText()).trim();
    expect(listName).toBe(productName);
    expect(listDiscount).toBe('-30%');

    await card.locator('a.products-item__link').click();

    // expect: URL и заголовок вкладки
    await expect(page).toHaveURL(/\/store\/zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi/);
    await expect(page).toHaveTitle('Жіноча чорна сукня SLIM 5X2 RIB Tommy Hilfiger WW0WW46138 — MD-Fashion');

    // expect: название, цены и скидка совпадают с выдачей
    await expect(page.locator('h1.product_title')).toContainText(listName);
    await expect(page.locator('.price_current')).toHaveText(listPrice);
    await expect(page.locator('.old_price')).toHaveText(listOldPrice);
    await expect(page.getByText(listDiscount, { exact: true })).toBeVisible();
  });
});
