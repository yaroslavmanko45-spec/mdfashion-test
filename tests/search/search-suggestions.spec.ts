// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Поиск товара', () => {
  test('Автоподсказки: отображение и переход', async ({ page }) => {
    const searchbox = page.getByRole('searchbox', { name: 'Пошук' });
    const productsBlock = page.locator('ul.search__list:has(h4:text-is("Товари"))');
    const categoriesBlock = page.locator('ul.search__list:has(h4:text-is("Категорії"))');
    const offersBlock = page.locator('ul.search__list:has(h4:text-is("Пропозиції"))');

    // 1. Ввести «сук» в «Пошук», дождаться выпадающего списка.
    await page.goto('https://md-fashion.ua/');
    await searchbox.pressSequentially('сук');
    const firstItem = productsBlock.locator('li').first();
    await expect(firstItem).toBeVisible();
    await expect(firstItem.locator('.brand')).toBeVisible();
    await expect(firstItem.locator('.name')).toBeVisible();
    await expect(firstItem.locator('.row p').first()).toContainText('грн');
    await expect(categoriesBlock.locator('li').first()).toBeVisible();
    await expect(offersBlock.locator('li').first()).toBeVisible();

    // 2. Кликнуть по первому товару в блоке «Товари».
    const firstName = (await productsBlock.locator('li .name').first().innerText()).trim();
    await productsBlock.locator('li .name').first().click();
    await expect(page).toHaveURL(/\/store\/.+/);
    await expect(page.locator('h1')).toContainText(firstName);

    // 3. Вернуться на главную, ввести «сукня», кликнуть подсказку «сукня вечірня» из «Пропозиції».
    await page.goto('https://md-fashion.ua/');
    await searchbox.pressSequentially('сукня');
    await offersBlock.locator('a:has-text("вечірня")').click();
    await expect(page).toHaveURL(/\/store\?s=/);
    expect(decodeURIComponent(page.url())).toContain('s=сукня+вечірня');

    // 4. Ввести «сукня», кликнуть «Всі результати пошуку».
    await page.goto('https://md-fashion.ua/');
    await searchbox.pressSequentially('сукня');
    await page.getByText('Всі результати пошуку').click();
    await expect(page).toHaveURL(/\/store\?s=%D1%81%D1%83%D0%BA%D0%BD%D1%8F$/);

    // 5. Ввести «сукня», кликнуть вне поля.
    await page.goto('https://md-fashion.ua/');
    await searchbox.pressSequentially('сукня');
    await expect(productsBlock).toBeVisible();
    await page.locator('body').click();
    await expect(productsBlock).toBeHidden();
  });
});
