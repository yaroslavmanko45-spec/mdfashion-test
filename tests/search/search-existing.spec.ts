// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, env, searchUrlPattern } from '../../pom';

test.describe('Поиск товара', () => {
  test('Поиск по существующему запросу «сукня» (Enter)', async ({ page, browserName, homePage, searchResultsPage }) => {
    // Потенциальный баг приложения: в WebKit при загрузке главной скрипт сайта падает с
    // «TypeError: null is not an object (evaluating 't.closest')» (assets/webpack/js/973313f.js),
    // после чего автоподсказки не открываются (запрос get-auto-fill-phrases не отправляется) вместо ожидаемого списка подсказок.
    // В Chromium/Firefox та же ошибка проявляется реже.
    test.fixme(browserName === 'webkit', 'WebKit: автоподсказки поиска не открываются из-за JS-ошибки сайта (t.closest)');

    const query = env('SEARCH_QUERY_DRESS');

    // 1. Открыть https://md-fashion.ua/ и ввести «сукня» в поле «Пошук»
    await homePage.open();
    await homePage.typeInSearch(query);

    const suggestions = homePage.suggestions;
    await expect(suggestions.sectionTitle('Товари')).toBeVisible();
    await expect(suggestions.sectionTitle('Категорії')).toBeVisible();
    await expect(suggestions.sectionTitle('Пропозиції')).toBeVisible();
    await expect(suggestions.sectionTitle('Бренди')).toBeVisible();
    await expect(suggestions.item('Сукні-толстовки')).toBeVisible();
    await expect(suggestions.item('Сукні-сорочки')).toBeVisible();
    await expect(suggestions.item('сукня вечірня')).toBeVisible();
    await expect(suggestions.item('сукня джинсова')).toBeVisible();
    await expect(suggestions.allResultsLink).toBeVisible();

    // 2. Нажать Enter
    await homePage.searchbox.press('Enter');

    await expect(page).toHaveURL(searchUrlPattern(query));
    await expect(page).toHaveTitle('Каталог всіх товарів | Інтернет-магазин MD-Fashion');
    await expect(searchResultsPage.counter).toBeVisible();
    await expect(searchResultsPage.showMoreButton).toBeVisible();
    await expect(searchResultsPage.priceTexts.first()).toBeVisible();
    await expect(page.getByText(/сукня|сарафан/i).first()).toBeVisible();
  });
});
