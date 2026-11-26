// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, PRODUCTS, env } from '../../pom';

test.describe('Страница товара', () => {
  test('Переход в карточку из результатов поиска и сверка данных', async ({ page, homePage, searchResultsPage, productPage }) => {
    const product = PRODUCTS.blackDress;
    await homePage.open();

    // 1. Выполнить поиск «WW0WW46138». Запомнить данные первой карточки и кликнуть по ней.
    await homePage.search(env('SEARCH_QUERY_SKU'));

    const card = searchResultsPage.productCard(product.slug);
    await expect(card).toBeVisible();

    const listed = await searchResultsPage.readCard(card);
    expect(listed.name).toBe(product.name);
    expect(listed.discount).toMatch(/^-\d+%$/); // размер скидки меняется (распродажа) — не хардкодим

    await card.locator('a.products-item__link').first().click();

    // expect: URL и заголовок вкладки
    await expect(page).toHaveURL(new RegExp(`/store/${product.slug}`));
    await expect(page).toHaveTitle(product.title);

    // expect: название, цены и скидка совпадают с выдачей
    await expect(productPage.productTitle).toContainText(listed.name);
    await expect(productPage.priceCurrent).toHaveText(listed.price);
    await expect(productPage.oldPrice).toHaveText(listed.oldPrice);
    await expect(page.getByText(listed.discount, { exact: true })).toBeVisible();
  });
});
