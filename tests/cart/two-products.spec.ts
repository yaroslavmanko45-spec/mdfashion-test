// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

const toNumber = (s: string) => parseInt(s.replace(/[^\d]/g, ''), 10);

test.describe('Корзина без оформления заказа', () => {
  test('Два разных товара и итоговая сумма', async ({ page }) => {
    // 1. Добавить WW0WW46138 (размер M). Через поиск «сукня» открыть другой товар, выбрать доступный размер и добавить.
    await page.goto('https://md-fashion.ua/store/zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi');
    const sizeM = page.locator('.product_size_button[data-size="M"]');
    await sizeM.click();
    await expect(sizeM).toHaveClass(/active/);
    await page.locator('button.add_to_cart_product_btn').click();
    await expect(page.locator('header a[href="/cart/index"]').filter({ hasText: '1' })).toBeVisible();

    const searchbox = page.getByRole('searchbox', { name: 'Пошук', exact: true });
    await searchbox.fill('сукня');
    await searchbox.press('Enter');
    await expect(page).toHaveURL(/\/store\?s=/);

    const hrefs = await page.locator('a.products-item__link').evaluateAll(
      (els) => els.map((a) => (a as HTMLAnchorElement).href),
    );
    const secondHref = hrefs.find((h) => !h.includes('ww0ww46138'))!;
    expect(secondHref).toBeTruthy();
    await page.goto(secondHref);

    const firstSize = page.locator('.product_size_button').first();
    await firstSize.click();
    await expect(firstSize).toHaveClass(/active/);
    const selectedSize = (await firstSize.getAttribute('data-size'))!;
    await page.locator('button.add_to_cart_product_btn').click();
    await expect(page.locator('header a[href="/cart/index"]').filter({ hasText: '2' })).toBeVisible();

    await page.goto('https://md-fashion.ua/cart/index');
    await expect(page.getByText('2 товари', { exact: true })).toBeVisible();
    await expect(page.getByText('Жіноча чорна сукня SLIM 5X2 RIB').first()).toBeVisible();
    await expect(page.getByText('TOMMY HILFIGER', { exact: true }).first()).toBeVisible();
    await expect(page.locator('span.enhanced-product-size[data-size="M"]')).toBeVisible();
    await expect(page.locator('span.enhanced-product-size[data-size="' + selectedSize + '"]')).toBeVisible();
    await expect(page.getByText('Розмір:')).toHaveCount(2);
    await expect(page.getByText('Колір:')).toHaveCount(2);
    await expect(page.getByText('Чорний', { exact: true }).first()).toBeVisible();

    // 2. Сверить «Сума замовлення», «Загальна знижка», «Всього».
    const text = await page.locator('body').innerText();
    const start = text.indexOf('2 товари');
    const itemsPart = text.slice(start, text.indexOf('Ваше замовлення'));
    const orderPart = text.slice(text.indexOf('Ваше замовлення'));

    // Каждая позиция: «старая цена грн новая цена грн»
    const priceRe = /(\d[\d\s ]*)\s*грн\s+(\d[\d\s ]*)\s*грн/g;
    const items = [...itemsPart.matchAll(priceRe)].map((m) => ({
      old: toNumber(m[1]),
      current: toNumber(m[2]),
    }));
    expect(items).toHaveLength(2);

    const sum = toNumber(orderPart.match(/Сума замовлення\s*([\d\s ]+)\s*грн/)![1]);
    const discount = toNumber(orderPart.match(/Загальна знижка\s*-\s*([\d\s ]+)\s*грн/)![1]);
    const total = toNumber(orderPart.match(/Всього\s*([\d\s ]+)\s*грн/)![1]);

    // «Сума замовлення» считается по старым ценам
    expect(sum).toBe(items[0].old + items[1].old);
    expect(total).toBe(sum - discount);
    expect(total).toBe(items[0].current + items[1].current);
  });
});
