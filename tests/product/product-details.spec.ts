// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Страница товара', () => {
  test('Содержимое карточки: артикул, характеристики, бонусы', async ({ page }) => {
    // 1. Открыть карточку по прямому URL.
    await page.goto('https://md-fashion.ua/store/zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi');
    await expect(page).toHaveURL(/ww0ww46138/);
    const body = page.locator('body');
    await expect(page.getByText('Tommy Hilfiger WW0WW46138').first()).toBeVisible();
    await expect(body).toContainText(/\d[\d\s]*грн\s*\d[\d\s]*грн/);
    await expect(body).toContainText(/\+\d+ бонус/);
    await expect(page.getByText('для учасників клубної програми MD Fashion')).toBeVisible();
    await expect(page.getByText('Колір: чорний').first()).toBeVisible();

    // 2. Найти строку «Артикул».
    await expect(page.getByText('Артикул', { exact: true })).toBeVisible();
    await expect(page.getByText('WW0WW46138', { exact: true })).toBeVisible();

    // 3. Просмотреть блок «Інформація про товар».
    await expect(page.getByText('Інформація про товар')).toBeVisible();
    await expect(page.getByText('Застібка: куліска')).toBeVisible();
    await expect(page.getByText('Довжина: міді')).toBeVisible();
    await expect(page.getByText('Матеріал: віскоза')).toBeVisible();
    await expect(page.getByText('Склад: 95% віскоза, 5% еластан')).toBeVisible();
    await expect(page.getByText('Розмір на моделі: S')).toBeVisible();
    await expect(page.getByText('Зріст: 176 см')).toBeVisible();
    await expect(page.getByText('Доставка по Україні').first()).toBeVisible();
    await expect(page.getByText('до 5 днів').first()).toBeVisible();
  });
});
