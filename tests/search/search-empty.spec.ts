// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, env } from '../../pom';

test.describe('Поиск товара', () => {
  test('Пустой запрос и только пробелы', async ({ page, homePage }) => {
    const response = await homePage.open();
    expect(response?.status()).toBeLessThan(500);

    // 1. На главной кликнуть в «Пошук» и нажать Enter без ввода.
    await homePage.submitEmptySearch();
    await expect(page).toHaveURL(/md-fashion\.ua\/store/);
    await expect(page).toHaveTitle(/Каталог всіх товарів/);

    // 2. Ввести только пробелы «   » и нажать Enter.
    const response2 = await homePage.open();
    expect(response2?.status()).toBeLessThan(500);
    await homePage.search(env('SEARCH_QUERY_SPACES_ONLY'));
    await expect(page).toHaveURL(/md-fashion\.ua\/store/);
    await expect(page).toHaveTitle(/Каталог всіх товарів/);
  });
});
