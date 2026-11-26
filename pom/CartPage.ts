import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { BasePage } from './BasePage';
import { URLS } from './data';
import { parsePrice } from './utils';

export interface CartTotals {
  /** «Сума замовлення» — сумма старых (до скидки) цен. */
  sum: number;
  /** «Загальна знижка» — положительное число. */
  discount: number;
  /** «Всього» — сумма текущих цен. */
  total: number;
}

export interface CartItemPrice {
  old: number;
  current: number;
}

export interface CartSnapshot {
  rows: number;
  size: string | null;
  total: number;
  counter: string;
}

/**
 * Корзина: /cart/index. Содержимое подгружается асинхронно — используйте waitForItems().
 * ВАЖНО: «Оформити замовлення» никогда не нажимать.
 */
export class CartPage extends BasePage {
  readonly heading: Locator;
  readonly itemSizes: Locator;
  readonly removeButtons: Locator;
  /** Кнопка подтверждения в попапе «Видалити товар». */
  readonly confirmRemoveButton: Locator;
  readonly firstItemRow: Locator;
  readonly orderSummaryTitle: Locator;
  readonly sizeLabels: Locator;
  readonly colorLabels: Locator;

  readonly promoToggle: Locator;
  readonly promoInput: Locator;
  readonly promoApplyText: Locator;
  readonly promoNotApplicableError: Locator;

  /** Только для проверки наличия. НЕ НАЖИМАТЬ. */
  readonly checkoutButton: Locator;
  /** Только для проверки наличия (может требовать логина). */
  readonly moveToFavorites: Locator;
  readonly recommendationsHeading: Locator;

  readonly emptyMessage: Locator;
  readonly backToShopping: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Кошик' }).first();
    this.itemSizes = page.locator('span.enhanced-product-size');
    this.removeButtons = page.locator('.remove-from-cart');
    this.confirmRemoveButton = page.locator('.exit-block__btn button:has-text("Видалити")');
    this.firstItemRow = page.locator('.product-description').first();
    this.orderSummaryTitle = page.getByText('Ваше замовлення').filter({ visible: true }).first();
    this.sizeLabels = page.getByText('Розмір:');
    this.colorLabels = page.getByText('Колір:');

    this.promoToggle = page.getByText('Маєте промокод?').first();
    this.promoInput = page.getByRole('textbox', { name: 'Промокод' });
    this.promoApplyText = page.locator('#store-promo-code-button'); // кнопка «Застосувати»
    this.promoNotApplicableError = page.getByText('Промокод не можна застосувати до даних товарів').first();

    this.checkoutButton = page.getByText('Оформити замовлення');
    this.moveToFavorites = page.getByText('Перемістити в Обране').first();
    this.recommendationsHeading = page.getByRole('heading', { name: /З цим товаром купують/ });

    this.emptyMessage = page.getByText('У вашому кошику немає товарів').first();
    this.backToShopping = page.getByText('Повернутися до покупок').first();
  }

  async open(): Promise<Response | null> {
    return this.goto(URLS.cart);
  }

  /**
   * Открыть корзину, в которой заведомо есть товары. Если корзина пришла пустой (в WebKit сессия корзины
   * иногда не успевает примениться), страница перезагружается.
   */
  async openWithItems(): Promise<void> {
    await this.open();
    await expect(async () => {
      await expect(this.itemSizes.first()).toBeVisible({ timeout: 8000 }).catch(async (e) => {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        throw e;
      });
    }).toPass({ timeout: 45_000 });
  }

  async waitForItems(): Promise<void> {
    await this.itemSizes.first().waitFor();
  }

  /** «1 товар», «2 товари», «3 товари» — точное совпадение. */
  itemsCountLabel(text: string): Locator {
    return this.page.getByText(text, { exact: true });
  }

  itemSize(size: string): Locator {
    return this.page.locator(`span.enhanced-product-size[data-size="${size}"]`);
  }

  async removeFirstItem(): Promise<void> {
    // Клик повторяется, пока не откроется попап подтверждения (скрипты корзины могут быть ещё не готовы).
    await expect(async () => {
      await this.removeButtons.first().click({ timeout: 3000 });
      await expect(this.confirmRemoveButton).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 20_000 });
    await this.confirmRemoveButton.click();
  }

  /** Ввести промокод и отправить Enter (кнопку «Застосувати» перекрывает плавающий виджет). */
  async applyPromo(code: string): Promise<void> {
    if (!(await this.promoInput.isVisible())) await this.promoToggle.click();
    await this.promoInput.fill(code);
    await this.promoInput.press('Enter');
  }

  /** Разбирает блок «Ваше замовлення»: Сума замовлення / Загальна знижка / Всього. */
  async readTotals(): Promise<CartTotals> {
    await this.page.getByText('Всього').first().waitFor();
    const text = await this.page.locator('body').innerText();
    const start = text.indexOf('Ваше замовлення');
    const order = start >= 0 ? text.slice(start) : text;
    const value = (label: string) => {
      const m = order.match(new RegExp(label + '\\s*-?\\s*([\\d\\s\\u00a0]+?)\\s*грн'));
      return m ? parsePrice(m[1]) : NaN;
    };
    return {
      sum: value('Сума замовлення'),
      discount: value('Загальна знижка'),
      total: value('Всього'),
    };
  }

  /** Цены позиций: пары «старая цена грн  текущая цена грн» в списке товаров. */
  async readItemPrices(): Promise<CartItemPrice[]> {
    const text = await this.page.locator('body').innerText();
    const start = text.search(/\d+ товар/);
    const itemsPart = text.slice(start, text.indexOf('Ваше замовлення'));
    const priceRe = /(\d[\d\s ]*)\s*грн\s+(\d[\d\s ]*)\s*грн/g;
    return [...itemsPart.matchAll(priceRe)].map((m) => ({
      old: parsePrice(m[1]),
      current: parsePrice(m[2]),
    }));
  }

  /** Снимок состояния корзины для сравнения до/после действий. */
  async snapshot(): Promise<CartSnapshot> {
    await this.waitForItems();
    const totals = await this.readTotals();
    return {
      rows: await this.removeButtons.count(),
      size: await this.itemSizes.first().getAttribute('data-size'),
      total: totals.total,
      counter: (await this.cartCounter.innerText()).trim(),
    };
  }
}
