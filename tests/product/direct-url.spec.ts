// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, PRODUCTS, ProductPage, URLS, env, formEncode } from '../../pom';

test.describe('Страница товара', () => {
  test('Открытие по прямому URL и поведение страницы', async ({ page, context, homePage, searchResultsPage }) => {
    const product = PRODUCTS.blackDress;
    const sku = env('SEARCH_QUERY_SKU');
    const searchUrl = `${URLS.store}?s=${formEncode(sku)}`;

    // 1. В новой вкладке открыть прямой URL товара.
    const tab = await context.newPage();
    const tabProduct = new ProductPage(tab);
    const appErrors: string[] = [];
    tab.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const src = msg.location().url;
      // WebKit репортит блокировки CSP для аналитики (gtm-ss.md-fashion.ua) как error — это не ошибка страницы.
      // Firefox: «Cookie “sc” has been rejected for invalid domain» — cookie стороннего трекера.
      if (/gtm-ss\.md-fashion\.ua|Content[ -]Security[ -]Policy|Cookie .* rejected|doubleclick\.net/i.test(msg.text())) return;
      // Игнорируем сторонние трекеры: оставляем ошибки без URL источника или с md-fashion.ua
      if (!src || src.includes('md-fashion.ua')) appErrors.push(msg.text());
    });
    // Firefox: «Cookie “sc” has been rejected for invalid domain» — cookie стороннего трекера; WebKit: блокировка CSP gtm-ss.
    tab.on('pageerror', (err) => {
      // WebKit: cross-origin frame doubleclick — тоже сторонний трекер.
      if (/gtm-ss\.md-fashion\.ua|Cookie .* rejected|Content[ -]Security[ -]Policy|doubleclick\.net/i.test(err.message)) return;
      appErrors.push(err.message);
    });

    const response = await tabProduct.open(product.url);
    expect(response?.status()).toBe(200);
    await expect(tab).toHaveURL(product.url);
    expect(tab.url()).toBe(product.url);
    await expect(tab).toHaveTitle(product.title);
    await expect(tabProduct.h1).toContainText(product.name);
    await expect(tabProduct.priceCurrent).toBeVisible();
    expect(appErrors).toEqual([]);
    await tab.close();

    // 2. Нажать «Назад» браузера после перехода из выдачи поиска.
    await homePage.open();
    await homePage.search(sku);
    await expect(page).toHaveURL(searchUrl);

    await searchResultsPage.productLink(product.slug).click();
    await expect(page).toHaveURL(product.url);

    await page.goBack();
    await expect(page).toHaveURL(searchUrl);
    await expect(searchResultsPage.productLink(product.slug)).toBeVisible();
  });
});
