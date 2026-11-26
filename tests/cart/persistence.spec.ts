// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, PRODUCTS, CartPage, HomePage, ProductPage, env } from '../../pom';

test.describe('Корзина без оформления заказа', () => {
  test('Сохранение корзины после перезагрузки и навигации', async ({ context }) => {
    const url = PRODUCTS.blackDress.url;
    let page = await context.newPage();
    const productPage = new ProductPage(page);
    const homePage = new HomePage(page);
    let cartPage = new CartPage(page);

    // 1. Добавить товар, нажать F5 на /cart/index.
    await productPage.addSizeToCart(url, 'M');
    await cartPage.openWithItems();
    const before = await cartPage.snapshot();
    expect(before.rows).toBe(1);
    expect(before.size).toBe('M');
    expect(before.total).toBeGreaterThan(0);
    expect(before.counter).toBe('1');

    await page.keyboard.press('F5');
    await page.waitForLoadState('domcontentloaded');
    expect(await cartPage.snapshot()).toEqual(before);

    // 2. Перейти на главную, в поиск и на карточку, затем снова открыть корзину.
    await homePage.open();
    await homePage.search(env('SEARCH_QUERY_BRAND'));
    await page.waitForLoadState('domcontentloaded');
    await productPage.open(url);
    await cartPage.open();
    expect(await cartPage.snapshot()).toEqual(before);

    // 3. Закрыть и заново открыть вкладку в том же контексте браузера.
    await page.close();
    page = await context.newPage();
    cartPage = new CartPage(page);
    await cartPage.open();
    expect(await cartPage.snapshot()).toEqual(before);

    // Очистка
    await cartPage.removeFirstItem();
    await expect(cartPage.removeButtons).toHaveCount(0);
  });
});
