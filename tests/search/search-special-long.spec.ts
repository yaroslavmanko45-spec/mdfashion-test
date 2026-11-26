// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, env } from '../../pom';

test.describe('Поиск товара', () => {
  test('Спецсимволы и очень длинная строка', async ({ page, homePage, searchResultsPage }) => {
    test.slow(); // 7 последовательных открытий главной + поиск; в Firefox каждая загрузка занимает ~10 с
    const dialogs: string[] = [];
    page.on('dialog', async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });

    const serverError = page.getByText(/(500|502|503|504)\s*(Internal|Bad|Service|Gateway|Server)|Server Error/i);

    // 1. Поочерёдно искать спецсимволы
    const xss = env('SEARCH_QUERY_XSS');
    const queries = [
      xss,
      env('SEARCH_QUERY_SQL_INJECTION'),
      env('SEARCH_QUERY_PERCENT'),
      env('SEARCH_QUERY_SPECIAL_CHARS'),
      env('SEARCH_QUERY_EMOJI'),
    ];
    for (const query of queries) {
      await homePage.open();
      await homePage.search(query);
      await expect(page).toHaveURL(/\/store/);
      await expect(searchResultsPage.h1.or(searchResultsPage.noResultsHeading).first()).toBeVisible();
      await expect(serverError).toHaveCount(0);
    }

    // Для XSS-запроса: выдача может быть как пустой, так и нечёткой (поиск недетерминирован) —
    // главное, что страница отрисовалась и скрипт не выполнился (проверка dialogs ниже).
    await homePage.open();
    await homePage.search(xss);
    await expect(page).toHaveURL(/\/store\?s=/);
    await expect(searchResultsPage.noResultsHeading.or(searchResultsPage.counter).or(searchResultsPage.h1).first()).toBeVisible({ timeout: 15_000 });

    // 2. Вставить строку из 1000 символов «а» и нажать Enter
    await homePage.open();
    await homePage.search(env('SEARCH_QUERY_LONG_CHAR').repeat(Number(env('SEARCH_QUERY_LONG_LENGTH'))));
    await expect(page).toHaveURL(/\/store/);
    await expect(serverError).toHaveCount(0);

    expect(dialogs).toEqual([]);
  });
});
