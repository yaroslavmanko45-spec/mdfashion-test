// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, Page } from '@playwright/test';

const CART = 'https://md-fashion.ua/cart/index';
const PRODUCT = 'https://md-fashion.ua/store/zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi';

async function cartState(page: Page) {
  await page.locator('span.enhanced-product-size').first().waitFor();
  await page.getByText('Всього').first().waitFor();
  const rows = await page.locator('.remove-from-cart').count();
  const size = await page.locator('span.enhanced-product-size').first().getAttribute('data-size');
  const bodyText = await page.locator('body').innerText();
  const m = bodyText.match(/Всього\s*([\d\s ]+?)\s*грн/);
  const total = m ? parseInt(m[1].replace(/\D/g, ''), 10) : NaN;
  const counter = (await page.locator('a.cart[href="/cart/index"] .counter').first().innerText()).trim();
  return { rows, size, total, counter };
}

test.describe('Корзина без оформления заказа', () => {
  test('Сохранение корзины после перезагрузки и навигации', async ({ context }) => {
    let page = await context.newPage();

    // 1. Добавить товар, нажать F5 на /cart/index.
    await page.goto(PRODUCT);
    await page.locator('.product_size_button[data-size="M"]').click();
    await expect(page.locator('.product_size_button[data-size="M"]')).toHaveClass(/active/);
    await page.locator('button.add_to_cart_product_btn').click();
    await expect(page.getByText('Додано в кошик').first()).toBeVisible();
    await page.goto(CART);
    const before = await cartState(page);
    expect(before.rows).toBe(1);
    expect(before.size).toBe('M');
    expect(before.total).toBeGreaterThan(0);
    expect(before.counter).toBe('1');

    await page.keyboard.press('F5');
    await page.waitForLoadState('domcontentloaded');
    expect(await cartState(page)).toEqual(before);

    // 2. Перейти на главную, в поиск и на карточку, затем снова открыть корзину.
    await page.goto('https://md-fashion.ua/');
    const search = page.getByRole('searchbox', { name: 'Пошук', exact: true });
    await search.fill('Tommy Hilfiger');
    await search.press('Enter');
    await page.waitForLoadState('domcontentloaded');
    await page.goto(PRODUCT);
    await page.goto(CART);
    expect(await cartState(page)).toEqual(before);

    // 3. Закрыть и заново открыть вкладку в том же контексте браузера.
    await page.close();
    page = await context.newPage();
    await page.goto(CART);
    expect(await cartState(page)).toEqual(before);

    // Очистка
    await page.locator('.remove-from-cart').first().click();
    await page.locator('.exit-block__btn button:has-text("Видалити")').click();
    await expect(page.locator('.remove-from-cart')).toHaveCount(0);
  });
});
