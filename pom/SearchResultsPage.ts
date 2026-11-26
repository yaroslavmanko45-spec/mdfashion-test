import type { Locator, Page, Response } from '@playwright/test';
import { BasePage } from './BasePage';
import { URLS } from './data';

export interface ResultCardData {
  name: string;
  price: string;
  oldPrice: string;
  discount: string;
}

/** Выдача поиска / каталог: /store?s=<запрос>. */
export class SearchResultsPage extends BasePage {
  /** Счётчик вида «27 з 1631 товара». */
  readonly counter: Locator;
  /** Счётчик в русской версии: «27 из 1631 товар». */
  readonly counterRu: Locator;
  readonly noResultsHeading: Locator;
  readonly noResultsText: Locator;
  readonly noResultsHint: Locator;
  readonly showMoreButton: Locator;
  readonly productLinks: Locator;
  readonly h1: Locator;
  readonly priceTexts: Locator;

  constructor(page: Page) {
    super(page);
    this.counter = page.getByText(/\d+\s*з\s*\d+\s*товар/).first();
    this.counterRu = page.getByText(/\d+\s*из\s*\d+\s*товар/).first();
    this.noResultsHeading = page.getByRole('heading', { name: 'За вашим запитом нічого не знайдено' });
    this.noResultsText = page.getByText(/нічого не знайдено/i);
    this.noResultsHint = page.getByText('Перевірте правопис або спробуйте використовувати більш загальний запит');
    this.showMoreButton = page.getByText('Показати ще');
    this.productLinks = page.locator('a.products-item__link');
    this.h1 = page.getByRole('heading', { level: 1 });
    this.priceTexts = page.getByText('грн').filter({ visible: true }); // есть скрытый «грн» в фильтре цены
  }

  async open(query: string): Promise<Response | null> {
    return this.goto(URLS.search(query));
  }

  /** Заголовок «Товари за запитом «<запрос>»». */
  resultsHeading(query: string): Locator {
    return this.page.getByRole('heading', { name: `Товари за запитом «${query}»` });
  }

  /** Ссылка на товар в выдаче по окончанию href (slug). */
  productLink(slug: string): Locator {
    return this.page.locator(`a.products-item__link[href$="${slug}"]`);
  }

  /** Карточка товара в выдаче по slug. */
  productCard(slug: string): Locator {
    // Карточки других цветов содержат ссылку на этот slug в карусели цветов — берём первую (собственную) карточку.
    return this.page
      .locator('.catalogue-product')
      .filter({ has: this.page.locator(`a.products-item__link[href$="${slug}"]`) })
      .first();
  }

  async readCard(card: Locator): Promise<ResultCardData> {
    const text = async (selector: string) => (await card.locator(selector).innerText()).trim();
    return {
      name: await text('.product-info__name'),
      price: await text('.product-info__price__text_new'),
      oldPrice: await text('.product-info__price__text_old'),
      discount: await text('.product-wobler__item.sale'),
    };
  }

  /** Общее количество найденных товаров из счётчика «N з M товар…». */
  async totalCount(): Promise<string> {
    return (await this.counter.innerText()).match(/з\s*(\d+)/)![1];
  }

  /** href всех товаров на странице выдачи. */
  async productHrefs(): Promise<string[]> {
    await this.productLinks.nth(1).waitFor();
    return this.productLinks.evaluateAll((els) => els.map((a) => (a as HTMLAnchorElement).href));
  }
}
