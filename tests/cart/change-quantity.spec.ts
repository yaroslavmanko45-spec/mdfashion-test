// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, Page } from '@playwright/test';

const PRODUCT_URL = 'https://md-fashion.ua/store/zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi';

async function addSizeM(page: Page) {
  await page.goto(PRODUCT_URL);
  await page.locator('.product_size_button[data-size="M"]').click();
  await page.locator('button.add_to_cart_product_btn').click();
  await expect(page.getByText('Додано в кошик').first()).toBeVisible();
}

function parseNumber(text: string): number {
  return parseInt(text.replace(/[^\d]/g, ''), 10);
}

test.describe('Корзина без оформления заказа', () => {
  test('Изменение количества и пересчёт суммы', async ({ page }) => {
    // 1. Добавить товар, открыть /cart/index и найти элемент изменения количества
    await addSizeM(page);
    await page.goto('https://md-fashion.ua/cart/index');
    const sizeRows = page.locator('span.enhanced-product-size');
    await expect(sizeRows).toHaveCount(1);

    const total = page.locator('xpath=//*[normalize-space(text())="Всього"]/parent::*').first();
    await expect(total).toContainText('грн');
    const singleTotal = parseNumber((await total.innerText()).replace('Всього', ''));
    expect(singleTotal).toBeGreaterThan(0);

    // DOCUMENTATION: на сайте в корзине НЕТ контрола количества (+/-, select, input).
    // Единственное видимое поле ввода на странице - поиск в шапке.
    const cartRow = page.locator('.product-description').first();
    await expect(cartRow.locator('input, select')).toHaveCount(0);
    await expect(cartRow.locator('[class*="qty"], [class*="quantity"], [class*="plus"], [class*="minus"]')).toHaveCount(0);
    await expect(cartRow.locator('.remove-from-cart')).toBeVisible();

    // Количество меняется только повторным добавлением того же товара/размера:
    // создаётся отдельная строка, а сумма пересчитывается как N x цена.
    await addSizeM(page);
    await page.goto('https://md-fashion.ua/cart/index');
    await expect(sizeRows).toHaveCount(2);
    await expect(page.getByText('2 товари')).toBeVisible();
    await expect(total).not.toContainText(String(singleTotal).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
    const doubledTotal = parseNumber((await total.innerText()).replace('Всього', ''));
    expect(doubledTotal).toBe(singleTotal * 2);
  });
});
