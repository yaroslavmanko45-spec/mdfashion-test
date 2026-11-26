// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, PRODUCTS } from '../../pom';

test.describe('Страница товара', () => {
  test('Содержимое карточки: артикул, характеристики, бонусы', async ({ page, productPage }) => {
    const product = PRODUCTS.blackDress;

    // 1. Открыть карточку по прямому URL.
    await productPage.open(product.url);
    await expect(page).toHaveURL(/ww0ww46138/);
    const body = page.locator('body');
    await expect(page.getByText(`Tommy Hilfiger ${product.sku}`).first()).toBeVisible();
    await expect(body).toContainText(/\d[\d\s]*грн\s*\d[\d\s]*грн/);
    await expect(body).toContainText(/\+\d+ бонус/);
    await expect(page.getByText('для учасників клубної програми MD Fashion')).toBeVisible();
    await expect(page.getByText('Колір: чорний').first()).toBeVisible();

    // 2. Найти строку «Артикул».
    await expect(page.getByText('Артикул', { exact: true })).toBeVisible();
    await expect(page.getByText(product.sku, { exact: true })).toBeVisible();

    // 3. Просмотреть блок «Інформація про товар».
    await expect(page.getByText('Інформація про товар')).toBeVisible();
    for (const line of [
      'Застібка: куліска',
      'Довжина виробу: міді',
      'Склад: 95% віскоза, 5% еластан',
      'Розмір на моделі: S',
      'Зріст: 176 см',
    ]) {
      await expect(page.getByText(line)).toBeVisible();
    }
    await expect(page.getByText('Доставка по Україні').first()).toBeVisible();
    await expect(page.getByText('до 5 днів').first()).toBeVisible();
  });
});
