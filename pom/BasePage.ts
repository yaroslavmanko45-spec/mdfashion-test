import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { SearchSuggestions } from './components/SearchSuggestions';

/** Общие элементы всех страниц: шапка с поиском и корзиной, футер. */
export class BasePage {
  readonly page: Page;
  /** Поле «Пошук» в шапке. exact обязателен: на выдаче есть второе поле «Пошук за товаром або брендом». */
  readonly searchbox: Locator;
  /** Поле поиска в русской версии сайта (/ru). */
  readonly searchboxRu: Locator;
  readonly suggestions: SearchSuggestions;
  readonly banner: Locator;
  readonly footer: Locator;
  readonly headerCartLink: Locator;
  /** Счётчик корзины в шапке. На карточке товара обновляется нестабильно — надёжно проверять на /cart/index. */
  readonly cartCounter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchbox = page.getByRole('searchbox', { name: 'Пошук', exact: true });
    this.searchboxRu = page.getByRole('searchbox', { name: 'Поиск', exact: true });
    this.suggestions = new SearchSuggestions(page);
    this.banner = page.getByRole('banner');
    this.footer = page.getByRole('contentinfo');
    this.headerCartLink = page.locator('header a[href="/cart/index"]');
    this.cartCounter = page.locator('a.cart[href="/cart/index"] .counter').first();
  }

  async goto(url: string): Promise<Response | null> {
    // domcontentloaded: событие load на сайте ждёт десятки сторонних трекеров и в Firefox/WebKit может не наступать.
    const response = await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    // Скрипты сайта (Rocket Loader) инициализируются только после load — клики/ввод раньше теряются.
    // Ждём load ограниченное время и не падаем, если трекеры его затягивают.
    await this.page.waitForLoadState('load', { timeout: 30_000 }).catch(() => {});
    return response;
  }

  /** Ввести запрос в «Пошук» и нажать Enter. */
  async search(query: string, searchbox: Locator = this.searchbox): Promise<void> {
    await searchbox.fill(query);
    await searchbox.press('Enter');
  }

  /** Посимвольный ввод (нужен, чтобы открылись автоподсказки). */
  async typeInSearch(text: string): Promise<void> {
    // Обработчики поля навешиваются скриптами сайта (Rocket Loader) только после события load: ввод раньше
    // подсказки не открывает, а повторный ввод той же строки на той же странице подсказки уже не показывает.
    // Поэтому сначала ждём load, а повтор оставляем лишь как запасной вариант.
    await this.page.waitForLoadState('load', { timeout: 45_000 });
    let attempt = 0;
    await expect(async () => {
      // Повтор: перезагружаем страницу — это сбрасывает потерянные обработчики и кэш подсказок (актуально для WebKit).
      if (attempt++ > 0) {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.page.waitForLoadState('load', { timeout: 30_000 });
      }
      await this.searchbox.click();
      await this.searchbox.pressSequentially(text, { delay: 50 });
      await expect(this.page.locator('ul.search__list').first()).toBeVisible({ timeout: 8000 });
    }).toPass({ timeout: 80_000 });
  }

  /** Enter в пустом поле поиска. */
  async submitEmptySearch(): Promise<void> {
    await this.searchbox.click();
    await this.page.keyboard.press('Enter');
  }

  /** Иконка корзины в шапке, содержащая указанное число. */
  headerCartWithCount(count: number): Locator {
    return this.headerCartLink.filter({ hasText: String(count) });
  }
}
