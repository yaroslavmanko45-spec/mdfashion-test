// spec: specs/md-fashion-search-product-cart.md
// seed: tests/seed.spec.ts

import { test, expect, PRODUCTS, env } from '../../pom';

test.describe('Корзина без оформления заказа', () => {
  test('Два разных товара и итоговая сумма', async ({ page, productPage, searchResultsPage, cartPage }) => {
    const product = PRODUCTS.blackDress;

    // 1. Добавить WW0WW46138 (размер M). Через поиск «сукня» открыть другой товар, выбрать доступный размер и добавить.
    await productPage.addSizeToCart(product.url, 'M');

    await productPage.search(env('SEARCH_QUERY_DRESS'));
    await expect(page).toHaveURL(/\/store\?s=/);

    const hrefs = await searchResultsPage.productHrefs();
    const secondHref = hrefs.find((h) => !h.includes(product.sku.toLowerCase()))!;
    expect(secondHref).toBeTruthy();
    await productPage.open(secondHref);

    // В разметке есть скрытые шаблонные размеры (data-size="size") — берём первый видимый.
    const selectedSize = (await productPage.sizes.filter({ visible: true }).first().getAttribute('data-size'))!;
    await productPage.addSizeToCart(secondHref, selectedSize);

    await cartPage.openWithItems();
    await expect(cartPage.cartCounter).toHaveText('2');
    await expect(cartPage.itemsCountLabel('2 товари')).toBeVisible();
    await expect(page.getByText(product.name).first()).toBeVisible();
    await expect(cartPage.firstItemRow.getByText(/^Tommy Hilfiger$/i)).toBeVisible();
    await expect(cartPage.itemSize('M')).toBeVisible();
    await expect(cartPage.itemSize(selectedSize)).toBeVisible();
    await expect(cartPage.sizeLabels).toHaveCount(2);
    await expect(cartPage.colorLabels).toHaveCount(2);
    await expect(page.getByText('Чорний', { exact: true }).first()).toBeVisible();

    // 2. Сверить «Сума замовлення», «Загальна знижка», «Всього».
    const items = await cartPage.readItemPrices();
    expect(items).toHaveLength(2);
    const { sum, discount, total } = await cartPage.readTotals();

    // «Сума замовлення» считается по старым ценам
    expect(sum).toBe(items[0].old + items[1].old);
    expect(total).toBe(sum - discount);
    expect(total).toBe(items[0].current + items[1].current);
  });
});
