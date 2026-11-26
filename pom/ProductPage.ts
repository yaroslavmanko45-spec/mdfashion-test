import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { BasePage } from './BasePage';

/** Карточка товара: /store/<slug>. */
export class ProductPage extends BasePage {
  readonly h1: Locator;
  readonly productTitle: Locator;
  readonly priceCurrent: Locator;
  readonly oldPrice: Locator;

  // Размеры. Недоступные размеры на сайте не рендерятся вообще (нет disabled-состояния).
  readonly sizes: Locator;
  readonly sizesTitle: Locator;
  readonly activeSizes: Locator;
  readonly sizeError: Locator;

  // Корзина
  readonly addToCartButton: Locator;
  readonly addedToCartMessage: Locator;

  // Хлебные крошки
  readonly breadcrumbs: Locator;
  readonly breadcrumbItems: Locator;

  // Галерея и увеличенный просмотр
  readonly galleryImages: Locator;
  readonly previewPopup: Locator;
  readonly previewActiveSlide: Locator;
  readonly previewClose: Locator;

  // Таблица размеров
  readonly sizeChartButton: Locator;
  readonly sizeChartPopup: Locator;
  readonly sizeChartClose: Locator;

  // Самовывоз / наличие в магазинах
  readonly storePickupButton: Locator;
  readonly storePickupPopup: Locator;
  readonly storePickupItems: Locator;
  readonly storePickupClose: Locator;

  /** «Натякнути на подарунок» — только проверка видимости, не кликать. */
  readonly giftHintButton: Locator;

  // Цвета
  readonly activeColor: Locator;

  constructor(page: Page) {
    super(page);
    this.h1 = page.locator('h1');
    this.productTitle = page.locator('h1.product_title');
    this.priceCurrent = page.locator('.price_current').first();
    this.oldPrice = page.locator('.old_price');

    this.sizes = page.locator('.product_size_button');
    this.sizesTitle = page.locator('.product_sizes_block .product_info_title');
    this.activeSizes = page.locator('.product_sizes_block .product_size_button.active');
    this.sizeError = page.locator('.product_last_label_error');

    this.addToCartButton = page.locator('button.add_to_cart_product_btn');
    this.addedToCartMessage = page.getByText('Додано в кошик').first();

    this.breadcrumbs = page.locator('ul.breadcrumb');
    this.breadcrumbItems = this.breadcrumbs.locator('li');

    this.galleryImages = page.locator('.js-product-images-swiper img.zoom-img');
    this.previewPopup = page.locator('.product-preview-popup');
    this.previewActiveSlide = this.previewPopup.locator('.swiper-slide-active');
    this.previewClose = this.previewPopup.locator('.close');

    this.sizeChartButton = page.locator('.size-chart-btn');
    this.sizeChartPopup = page.locator('.size-popup__container');
    this.sizeChartClose = this.sizeChartPopup.locator('.close');

    this.storePickupButton = page.locator('.store-pickup');
    this.storePickupPopup = page.locator('.store-pickup-popup');
    this.storePickupItems = this.storePickupPopup.locator('.store-info');
    this.storePickupClose = this.storePickupPopup.locator('.close');

    this.giftHintButton = page.getByRole('button', { name: 'Натякнути на подарунок' });

    this.activeColor = page.locator('.color_carousel_item.active');
  }

  async open(url: string): Promise<Response | null> {
    return this.goto(url);
  }

  /** Открыть попап наличия в магазинах. Клик повторяется, пока не навесятся обработчики страницы. */
  async openStorePickup(): Promise<void> {
    await expect(async () => {
      await this.storePickupButton.click();
      await expect(this.storePickupPopup).toBeVisible({ timeout: 8000 });
    }).toPass({ timeout: 45_000 });
  }

  size(size: string): Locator {
    return this.page.locator(`.product_size_button[data-size="${size}"]`);
  }

  async selectSize(size: string): Promise<void> {
    await this.size(size).click();
  }

  /**
   * Нажать «Додати в кошик».
   * waitForAdded: дождаться «Додано в кошик» — без этого при быстром переходе в корзину добавление теряется.
   */
  async addToCart({ waitForAdded = false, responseTimeout = 0 } = {}): Promise<void> {
    const added = this.page.waitForResponse(
      (r) => r.request().method() === 'POST' && r.url().includes('/api/shopping-cart'),
      responseTimeout ? { timeout: responseTimeout } : undefined,
    );
    await this.addToCartButton.click();
    if (waitForAdded) {
      // Сообщение появляется раньше завершения запроса: ждём ответ API, иначе переход в корзину отменяет добавление.
      const response = await added;
      expect(response.ok()).toBeTruthy();
      await expect(this.addedToCartMessage).toBeVisible();
    } else {
      added.catch(() => {});
    }
  }

  /** Открыть карточку, выбрать размер и добавить в корзину с ожиданием подтверждения. */
  async addSizeToCart(url: string, size: string): Promise<void> {
    await this.open(url);
    // Скрипты карточки (Rocket Loader) стартуют после load — раньше клики по размеру/кнопке теряются.
    await this.page.waitForLoadState('load', { timeout: 45_000 });
    // Если скрипты карточки ещё не инициализированы, клик по «Додати в кошик» не отправляет запрос — повторяем.
    await expect(async () => {
      if (!(await this.size(size).evaluate((el) => el.classList.contains('active')))) await this.selectSize(size);
      await expect(this.size(size)).toHaveClass(/active/, { timeout: 3000 });
      await this.addToCart({ waitForAdded: true, responseTimeout: 15_000 });
    }).toPass({ timeout: 50_000 });
  }

  breadcrumbLink(href: string): Locator {
    return this.breadcrumbs.locator(`a[href="${href}"]`);
  }

  colorItem(hrefPart: string): Locator {
    return this.page.locator(`a.color_carousel_item[href*="${hrefPart}"]`);
  }

  /** Значения data-quantity у отображаемых размеров. */
  async sizeQuantities(): Promise<number[]> {
    return this.sizes.evaluateAll((els) => els.map((e) => Number((e as HTMLElement).dataset.quantity)));
  }

  /** naturalWidth изображения (0 — картинка не загрузилась / битая). */
  static naturalWidth(img: Locator): Promise<number> {
    return img.evaluate((el: HTMLImageElement) => el.naturalWidth);
  }
}
