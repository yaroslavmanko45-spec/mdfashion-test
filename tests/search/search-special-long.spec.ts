// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Поиск товара', () => {
  test('Спецсимволы и очень длинная строка', async ({ page }) => {
    const dialogs: string[] = [];
    page.on('dialog', async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });

    const searchbox = page.getByRole('searchbox', { name: 'Пошук', exact: true });
    const serverError = page.getByText(/(500|502|503|504)\s*(Internal|Bad|Service|Gateway|Server)|Server Error/i);

    // 1. Поочерёдно искать спецсимволы
    const queries = ['<script>alert(1)</script>', '" OR 1=1 --', '%', '&&??//', '😀'];
    for (const query of queries) {
      await page.goto('https://md-fashion.ua/');
      await searchbox.fill(query);
      await searchbox.press('Enter');
      await expect(page).toHaveURL(/\/store/);
      await expect(page.getByRole('heading', { level: 1 }).or(page.getByRole('heading', { name: 'За вашим запитом нічого не знайдено' })).first()).toBeVisible();
      await expect(serverError).toHaveCount(0);
    }

    // Для XSS-запроса явно проверяем пустую выдачу
    await page.goto('https://md-fashion.ua/');
    await searchbox.fill('<script>alert(1)</script>');
    await searchbox.press('Enter');
    await expect(page.getByRole('heading', { name: 'За вашим запитом нічого не знайдено' })).toBeVisible();

    // 2. Вставить строку из 1000 символов «а» и нажать Enter
    await page.goto('https://md-fashion.ua/');
    await searchbox.fill('а'.repeat(1000));
    await searchbox.press('Enter');
    await expect(page).toHaveURL(/\/store/);
    await expect(serverError).toHaveCount(0);

    expect(dialogs).toEqual([]);
  });
});
