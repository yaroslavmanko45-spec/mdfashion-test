import type { Locator, Page } from '@playwright/test';

export type SuggestionSection = 'Товари' | 'Категорії' | 'Пропозиції' | 'Бренди';

/** Выпадающий блок автоподсказок под полем «Пошук» в шапке. */
export class SearchSuggestions {
  readonly products: Locator;
  readonly categories: Locator;
  readonly offers: Locator;
  readonly allResultsLink: Locator;

  constructor(private readonly page: Page) {
    this.products = this.section('Товари');
    this.categories = this.section('Категорії');
    this.offers = this.section('Пропозиції');
    this.allResultsLink = page.getByText('Всі результати пошуку');
  }

  section(title: SuggestionSection): Locator {
    return this.page.locator(`ul.search__list:has(h4:text-is("${title}"))`);
  }

  sectionTitle(title: SuggestionSection): Locator {
    return this.section(title).locator('h4').first();
  }

  /** Пункт подсказки (категория, фраза и т.п.) по точному тексту. */
  item(text: string): Locator {
    return this.page.locator('ul.search__list').getByText(text, { exact: true }).first();
  }

  firstProduct(): Locator {
    return this.products.locator('li').first();
  }

  firstProductName(): Locator {
    return this.products.locator('li .name').first();
  }

  offer(text: string): Locator {
    return this.offers.locator(`a:has-text("${text}")`);
  }
}
