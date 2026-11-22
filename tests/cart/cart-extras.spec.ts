// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Корзина без оформления заказа', () => {
  test('Перемещение в обране и блок «З цим товаром купують»', async ({ page }) => {
    // Preparation: add product (size M) to the cart
    await page.goto('https://md-fashion.ua/store/zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi');
    await page.locator('.product_size_button[data-size="M"]').click();
    await page.locator('button.add_to_cart_product_btn').click();
    await expect(page.getByText('Додано в кошик').first()).toBeVisible();
    await page.goto('https://md-fashion.ua/cart/index');
    await expect(page.locator('span.enhanced-product-size').first()).toBeVisible();

    // 1. В корзине проверить блок «З цим товаром купують» и кнопку «Перемістити в Обране» (не кликать)
    await expect(page.getByText('Перемістити в Обране').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /З цим товаром купують/ })).toBeVisible();
    const recLink = page
      .getByRole('link', { name: 'Жіночі чорні шкіряні чоботи Ersilia' })
      .nth(1);
    await expect(recLink).toBeVisible();
    await expect(page.getByText('5 895 грн').first()).toBeVisible();

    // 2. Ввести в поле «Маєте промокод?» заведомо неверный код «TEST000» и нажать «Застосувати»
    const totalBlock = page.locator('div', { hasText: /^Всього/ }).last();
    await expect(totalBlock).toContainText('6 853 грн');
    await page.getByText('Маєте промокод?').first().click();
    const promoInput = page.getByRole('textbox', { name: 'Промокод' });
    await promoInput.fill('TEST000');
    // Enter submits the promo form (the floating widget may intercept clicks on the button)
    await promoInput.press('Enter');
    await expect(page.getByText('Промокод не можна застосувати до даних товарів').first()).toBeVisible();
    await expect(totalBlock).toContainText('6 853 грн');

    // Clicking a recommendation opens the product page
    await recLink.click();
    await expect(page).toHaveURL(/\/store\/zhinochi-chorni-shkiryani-choboty-ersilia/);
    await expect(page.getByRole('heading', { name: 'Жіночі чорні шкіряні чоботи', level: 1 })).toBeVisible();
  });
});
