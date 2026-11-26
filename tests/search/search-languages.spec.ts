// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, SearchResultsPage, env } from '../../pom';

async function softOutcome(results: SearchResultsPage) {
  // Мягкая проверка: либо счётчик результатов, либо сообщение «нічого не знайдено»
  const counter = results.page.getByText(/\d+\s*(з|из)\s*\d+\s*товар/).first();
  const empty = results.page.getByRole('heading', { level: 2, name: /нічого не знайдено|ничего не найдено/i });
  await expect(counter.or(empty).first()).toBeVisible();
}

test.describe('Поиск товара', () => {
  test('Кириллица, латиница и украинская/русская формы', async ({ page, homePage, searchResultsPage }) => {
    const ruQuery = env('SEARCH_QUERY_RU');
    await homePage.open();

    // 1. Искать «платье» (рус.), затем «сукня» (укр.).
    for (const q of [ruQuery, env('SEARCH_QUERY_DRESS')]) {
      await homePage.search(q);
      await expect(page).toHaveURL(/\/store\?s=/);
      await softOutcome(searchResultsPage);
    }

    // 2. Искать «Tommy Hilfiger», затем «tommy hilfiger» и «томмі».
    for (const q of [env('SEARCH_QUERY_BRAND'), env('SEARCH_QUERY_BRAND_LOWER'), env('SEARCH_QUERY_BRAND_CYRILLIC')]) {
      await homePage.search(q);
      await expect(page).toHaveURL(/\/store\?s=/);
      await softOutcome(searchResultsPage);
    }

    // 3. Переключить язык ссылкой «Російська» в шапке и повторить поиск «платье».
    await homePage.open();
    await homePage.switchToRussian();
    await expect(page).toHaveURL(/\/ru\/?$/);

    await homePage.search(ruQuery, homePage.searchboxRu);
    await expect(page).toHaveURL(/\/ru\/store\?s=/);
    await expect(searchResultsPage.counterRu).toBeVisible();
  });
});
