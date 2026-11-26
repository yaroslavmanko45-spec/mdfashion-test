import { test as base, expect } from '@playwright/test';
import { HomePage } from './HomePage';
import { SearchResultsPage } from './SearchResultsPage';
import { ProductPage } from './ProductPage';
import { CartPage } from './CartPage';
import { NotFoundPage } from './NotFoundPage';

type Pages = {
  homePage: HomePage;
  searchResultsPage: SearchResultsPage;
  productPage: ProductPage;
  cartPage: CartPage;
  notFoundPage: NotFoundPage;
};

/** test с page-object фикстурами. Все объекты работают с одной и той же `page`. */
export const test = base.extend<Pages>({
  homePage: async ({ page }, use) => use(new HomePage(page)),
  searchResultsPage: async ({ page }, use) => use(new SearchResultsPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  notFoundPage: async ({ page }, use) => use(new NotFoundPage(page)),
});

export { expect };
