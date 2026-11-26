// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, env, searchUrlPattern } from '../../pom';

test.describe('Поиск товара', () => {
  test('Автоподсказки: отображение и переход', async ({ page, browserName, homePage, productPage }) => {
    // Потенциальный баг приложения: в WebKit при загрузке страницы скрипт сайта падает с
    // «TypeError: null is not an object (evaluating 't.closest')» (assets/webpack/js/973313f.js),
    // после чего автоподсказки не открываются (запрос get-auto-fill-phrases не отправляется) вместо ожидаемого списка подсказок.
    test.fixme(browserName === 'webkit', 'WebKit: автоподсказки поиска не открываются из-за JS-ошибки сайта (t.closest)');
    test.slow(); // 5 шагов, каждый заново открывает главную и ждёт инициализации скриптов сайта
    const suggestions = homePage.suggestions;
    const dress = env('SEARCH_QUERY_DRESS');

    // 1. Ввести «сук» в «Пошук», дождаться выпадающего списка.
    await homePage.open();
    await homePage.typeInSearch(env('SEARCH_QUERY_PARTIAL'));
    const firstItem = suggestions.firstProduct();
    await expect(firstItem).toBeVisible();
    await expect(firstItem.locator('.brand')).toBeVisible();
    await expect(firstItem.locator('.name')).toBeVisible();
    await expect(firstItem.locator('.row p').first()).toContainText('грн');
    await expect(suggestions.categories.locator('li').first()).toBeVisible();
    await expect(suggestions.offers.locator('li').first()).toBeVisible();

    // 2. Кликнуть по первому товару в блоке «Товари».
    const firstName = (await suggestions.firstProductName().innerText()).trim();
    await suggestions.firstProductName().click();
    await expect(page).toHaveURL(/\/store\/.+/);
    await expect(productPage.h1).toContainText(firstName);

    // 3. Вернуться на главную, ввести «сукня», кликнуть подсказку «сукня вечірня» из «Пропозиції».
    await homePage.open();
    await homePage.typeInSearch(dress);
    // Список подсказок перерисовывается по мере прихода ответов — повторяем клик, если элемент успел отсоединиться.
    await expect(async () => {
      await suggestions.offer('вечірня').click({ timeout: 5000 });
      await expect(page).toHaveURL(/\/store\?s=/, { timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    await expect(page).toHaveURL(/\/store\?s=/);
    expect(decodeURIComponent(page.url())).toContain('s=сукня+вечірня');

    // 4. Ввести «сукня», кликнуть «Всі результати пошуку».
    await homePage.open();
    await homePage.typeInSearch(dress);
    // Плавающий виджет .cl-floating-box иногда перекрывает кнопку и перехватывает клик — шлём click напрямую элементу.
    await suggestions.allResultsLink.dispatchEvent('click');
    await expect(page).toHaveURL(searchUrlPattern(dress, { exact: true }));

    // 5. Ввести «сукня», кликнуть вне поля.
    await homePage.open();
    await homePage.typeInSearch(dress);
    await expect(suggestions.products).toBeVisible();
    // Клик в левый верхний угол, заведомо вне поля поиска и выпадающего списка (центр body в Firefox может попасть в список).
    await expect(async () => {
      await page.mouse.click(2, 2);
      await expect(suggestions.products).toBeHidden({ timeout: 3000 });
    }).toPass({ timeout: 20_000 });
  });
});
