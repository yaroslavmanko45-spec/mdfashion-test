import type { Locator, Page, Response } from '@playwright/test';
import { BasePage } from './BasePage';
import { URLS } from './data';

export class HomePage extends BasePage {
  /** Ссылка «Російська» в шапке (в скрытом выпадающем меню языка). */
  readonly ruLanguageLink: Locator;

  constructor(page: Page) {
    super(page);
    this.ruLanguageLink = page.getByRole('link', { name: 'Російська' });
  }

  async open(): Promise<Response | null> {
    return this.goto(URLS.home);
  }

  /**
   * Переключение на русскую версию. Ссылка «Російська» находится в скрытом
   * выпадающем меню и не кликается во вьюпорте, поэтому переходим по её href.
   */
  async switchToRussian(): Promise<void> {
    const href = await this.ruLanguageLink.getAttribute('href');
    await this.goto(href!);
  }
}
