// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, env, searchUrlPattern } from '../../pom';

test.describe('Поиск товара', () => {
  test('Регистр и лишние пробелы', async ({ page, homePage, searchResultsPage }) => {
    const upper = env('SEARCH_QUERY_DRESS_UPPER');
    const withSpaces = env('SEARCH_QUERY_DRESS_SPACES');
    const innerSpaces = env('SEARCH_QUERY_DRESS_BLACK_SPACES');

    await homePage.open();
    const counter = searchResultsPage.counter;

    // 1. Выполнить поиск «СУКНЯ».
    await homePage.search(upper);
    await expect(page).toHaveURL(/\/store\?s=/);
    await expect(counter).toBeVisible();
    const upperCount = await searchResultsPage.totalCount();

    // 2. Выполнить поиск «  сукня  » (пробелы до и после).
    await searchResultsPage.search(withSpaces);
    await expect(page).toHaveURL(searchUrlPattern(withSpaces));
    await expect(counter).toContainText(`з ${upperCount}`);

    // 3. Выполнить поиск «сукня   чорна» (несколько пробелов внутри).
    await searchResultsPage.search(innerSpaces);
    await expect(page).toHaveURL(searchUrlPattern(innerSpaces));
    await expect(counter).toBeVisible();
    await expect(counter).not.toContainText(`з ${upperCount}`);
  });
});
