// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, PRODUCTS, env, searchUrlPattern } from '../../pom';

test.describe('Поиск товара', () => {
  test('Поиск по артикулу WW0WW46138', async ({ page, homePage, searchResultsPage }) => {
    const sku = env('SEARCH_QUERY_SKU');
    const skuLower = env('SEARCH_QUERY_SKU_LOWER');
    const black = page.getByRole('link', { name: PRODUCTS.blackDress.name, exact: true });
    const navy = page.getByRole('link', { name: PRODUCTS.navyDress.name, exact: true });

    // 1. На главной ввести в «Пошук» «WW0WW46138» и нажать Enter.
    await homePage.open();
    await homePage.search(sku);
    await expect(page).toHaveURL(searchUrlPattern(sku));
    await expect(searchResultsPage.counter).toContainText(/з 3 товар/); // окончание зависит от браузера/локали: «товарів» или «товара»
    await expect(black).toBeVisible();
    await expect(navy).toBeVisible();
    await expect(searchResultsPage.noResultsText).toHaveCount(0);

    // 2. Ввести то же в нижнем регистре «ww0ww46138».
    await searchResultsPage.search(skuLower);
    await expect(page).toHaveURL(searchUrlPattern(skuLower));
    await expect(searchResultsPage.counter).toContainText(/з 3 товар/); // окончание зависит от браузера/локали: «товарів» или «товара»
    await expect(black).toBeVisible();
    await expect(navy).toBeVisible();
  });
});
