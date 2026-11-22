// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Поиск товара', () => {
  test('Запрос без результатов', async ({ page }) => {
    await page.goto('https://md-fashion.ua/');

    // 1. Ввести «ффффыыыы12345» и нажать Enter.
    const headerSearch = page.getByRole('searchbox', { name: 'Пошук', exact: true });
    await headerSearch.fill('ффффыыыы12345');
    await headerSearch.press('Enter');
    await expect(page).toHaveURL(/\/store\?s=/);
    await expect(page.getByRole('heading', { name: 'За вашим запитом нічого не знайдено' })).toBeVisible();
    await expect(page.getByText('Перевірте правопис або спробуйте використовувати більш загальний запит')).toBeVisible();
    await expect(page.getByText(/\d+\s*з\s*\d+\s*товар/)).toHaveCount(0);
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();

    // 2. Из этого состояния ввести «сукня» в поле поиска.
    await headerSearch.fill('сукня');
    await headerSearch.press('Enter');
    await expect(page).toHaveURL(/\/store\?s=/);
    await expect(page.getByRole('heading', { name: 'Товари за запитом «сукня»' })).toBeVisible();
    await expect(page.getByText('За вашим запитом нічого не знайдено')).toHaveCount(0);
  });
});
