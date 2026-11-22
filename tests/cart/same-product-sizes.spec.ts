// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts
import { test, expect, Page } from '@playwright/test';

const PRODUCT_URL = 'https://md-fashion.ua/store/zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi';

const parsePrice = (s: string): number => parseInt(s.replace(/[^\d]/g, ''), 10);

async function addSize(page: Page, size: string) {
  await page.goto(PRODUCT_URL);
  await page.locator(`.product_size_button[data-size="${size}"]`).click();
  await expect(page.locator(`.product_size_button[data-size="${size}"]`)).toHaveClass(/active/);
  await page.locator('button.add_to_cart_product_btn').click();
  await expect(page.getByText('Додано в кошик').first()).toBeVisible();
}

async function readTotals(page: Page) {
  const text = await page.locator('body').innerText();
  const get = (label: string) => {
    const m = text.match(new RegExp(label + '\\s*\\n?\\s*(-?\\s*[\\d\\s\\u00a0]+)\\s*грн'));
    return m ? parsePrice(m[1]) : NaN;
  };
  return { sum: get('Сума замовлення'), discount: get('Загальна знижка'), total: get('Всього') };
}

test.describe('Корзина без оформления заказа', () => {
  test('Один товар в разных размерах', async ({ page }) => {
    // 1. Добавить WW0WW46138 размер S, вернуться на карточку, добавить размер M.
    await addSize(page, 'S');
    await addSize(page, 'M');

    await page.goto('https://md-fashion.ua/cart/index');
    const sizes = page.locator('span.enhanced-product-size');
    await expect(sizes).toHaveCount(2);
    await expect(sizes.nth(0)).toHaveAttribute('data-size', 'S');
    await expect(sizes.nth(1)).toHaveAttribute('data-size', 'M');
    await expect(page.getByText('2 товари')).toBeVisible();

    const two = await readTotals(page);
    expect(two.sum).toBeGreaterThan(0);
    expect(two.total).toBe(two.sum - Math.abs(two.discount));

    // 2. Добавить тот же товар в том же размере M ещё раз.
    // Фактическое поведение: поля количества нет, добавляется отдельная строка "Розмір: M".
    await addSize(page, 'M');
    await page.goto('https://md-fashion.ua/cart/index');
    await expect(page.getByText('3 товари')).toBeVisible();
    await expect(sizes).toHaveCount(3);
    await expect(sizes.nth(0)).toHaveAttribute('data-size', 'S');
    await expect(sizes.nth(1)).toHaveAttribute('data-size', 'M');
    await expect(sizes.nth(2)).toHaveAttribute('data-size', 'M');

    const three = await readTotals(page);
    expect(three.sum).toBe(Math.round((two.sum / 2) * 3));
    expect(three.total).toBe(three.sum - Math.abs(three.discount));
    expect(three.total).toBeGreaterThan(two.total);
  });
});
