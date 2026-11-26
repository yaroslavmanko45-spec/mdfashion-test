import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Страница 404 («Сторінка не знайдена»). */
export class NotFoundPage extends BasePage {
  readonly message: Locator;
  readonly homeLink: Locator;
  readonly fatalError: Locator;

  constructor(page: Page) {
    super(page);
    this.message = page.getByText('Сторінка не знайдена');
    this.homeLink = page.getByRole('link', { name: 'На головну' });
    this.fatalError = page.getByText('Fatal error');
  }
}
