// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Поиск товара', () => {
  test('Поиск по существующему запросу «сукня» (Enter)', async ({ page }) => {
    // 1. Открыть https://md-fashion.ua/ и ввести «сукня» в поле «Пошук»
    await page.goto('https://md-fashion.ua/');
    const search = page.getByRole('searchbox', { name: 'Пошук' });
    await search.click();
    await search.pressSequentially('сукня');

    await expect(page.getByText('Товари', { exact: true })).toBeVisible();
    await expect(page.getByText('Категорії', { exact: true })).toBeVisible();
    await expect(page.getByText('Пропозиції', { exact: true })).toBeVisible();
    await expect(page.getByText('Бренди', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Сукні-толстовки', { exact: true })).toBeVisible();
    await expect(page.getByText('Сукні-сорочки', { exact: true })).toBeVisible();
    await expect(page.getByText('сукня вечірня', { exact: true })).toBeVisible();
    await expect(page.getByText('сукня джинсова', { exact: true })).toBeVisible();
    await expect(page.getByText('Всі результати пошуку')).toBeVisible();

    // 2. Нажать Enter
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/store\?s=%D1%81%D1%83%D0%BA%D0%BD%D1%8F/);
    await expect(page).toHaveTitle('Каталог всіх товарів | Інтернет-магазин MD-Fashion');
    await expect(page.getByText(/^\d+ з [\d\s]+ товар/)).toBeVisible();
    await expect(page.getByText('Показати ще')).toBeVisible();
    await expect(page.getByText('грн').first()).toBeVisible();
    await expect(page.getByText(/сукня|сарафан/i).first()).toBeVisible();
  });
});
