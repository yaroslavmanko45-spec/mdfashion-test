// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

const toNumber = (s: string) => parseInt(s.replace(/[^\d]/g, ''), 10);

test.describe('Корзина без оформления заказа', () => {
  test('Добавление товара с выбранным размером', async ({ page }) => {
    // 1. Открыть карточку WW0WW46138, кликнуть размер «M», нажать «Додати в кошик».
    await page.goto('https://md-fashion.ua/store/zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi');
    const sizeM = page.locator('.product_size_button[data-size="M"]');
    await sizeM.click();
    await expect(sizeM).toHaveClass(/active/);
    const cardPriceText = (await page.locator('.price_current').first().innerText()).trim();
    const cardPrice = toNumber(cardPriceText);
    await page.locator('button:has-text("Додати в кошик")').click();
    await expect(page).toHaveURL(/\/store\/zhinocha-chorna-suknya/);
    await expect(page.locator('header a[href="/cart/index"]').filter({ hasText: '1' })).toBeVisible();

    // 2. Открыть /cart/index (иконка корзины в шапке).
    await page.goto('https://md-fashion.ua/cart/index');
    await expect(page.getByRole('heading', { name: 'Кошик' }).first()).toBeVisible();
    await expect(page.getByText('1 товар', { exact: true })).toBeVisible();
    await expect(page.getByText('TOMMY HILFIGER', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Жіноча чорна сукня SLIM 5X2 RIB').first()).toBeVisible();
    await expect(page.getByText('Розмір:')).toBeVisible();
    await expect(page.getByText('Колір:')).toBeVisible();
    await expect(page.getByText('Чорний', { exact: true }).first()).toBeVisible();

    // Блок «Ваше замовлення»
    await expect(page.getByText('Ваше замовлення')).toBeVisible();
    const body = page.locator('body');
    const orderText = await body.innerText();
    const section = orderText.slice(orderText.indexOf('Ваше замовлення'));
    const sum = toNumber(section.match(/Сума замовлення\s*\n?\s*([\d\s ]+)\s*грн/)![1]);
    const discount = toNumber(section.match(/Загальна знижка\s*\n?\s*-\s*([\d\s ]+)\s*грн/)![1]);
    const total = toNumber(section.match(/Всього\s*\n?\s*([\d\s ]+)\s*грн/)![1]);

    expect(total).toBe(sum - discount);
    expect(total).toBe(cardPrice);
    await expect(page.getByText(`${cardPriceText}`).first()).toBeVisible();

    await expect(page.getByText('Маєте промокод?')).toBeVisible();
    await expect(page.getByText('Застосувати')).toBeVisible();
    await expect(page.getByText('Оформити замовлення').first()).toBeVisible();
  });
});
