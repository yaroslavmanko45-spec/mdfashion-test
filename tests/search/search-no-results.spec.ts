// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, env } from '../../pom';

test.describe('Поиск товара', () => {
  test('Запрос без результатов', async ({ page, homePage, searchResultsPage }) => {
    const dress = env('SEARCH_QUERY_DRESS');
    await homePage.open();

    // 1. Ввести «ффффыыыы12345» и нажать Enter.
    await homePage.search(env('SEARCH_QUERY_NO_RESULTS'));
    await expect(page).toHaveURL(/\/store\?s=/);
    await expect(searchResultsPage.noResultsHeading).toBeVisible();
    await expect(searchResultsPage.noResultsHint).toBeVisible();
    await expect(page.getByText(/\d+\s*з\s*\d+\s*товар/)).toHaveCount(0);
    await expect(searchResultsPage.banner).toBeVisible();
    await expect(searchResultsPage.footer).toBeVisible();

    // 2. Из этого состояния ввести «сукня» в поле поиска.
    await searchResultsPage.search(dress);
    await expect(page).toHaveURL(/\/store\?s=/);
    await expect(searchResultsPage.resultsHeading(dress)).toBeVisible();
    await expect(searchResultsPage.noResultsHeading).toHaveCount(0);
  });
});
