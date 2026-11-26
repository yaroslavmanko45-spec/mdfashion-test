export const BASE_URL = 'https://md-fashion.ua';

export const URLS = {
  home: `${BASE_URL}/`,
  store: `${BASE_URL}/store`,
  cart: `${BASE_URL}/cart/index`,
  dressesCategory: `${BASE_URL}/store/women/odyah/sukni`,
  search: (query: string) => `${BASE_URL}/store?s=${encodeURIComponent(query)}`,
};

const BLACK_DRESS_SLUG = 'zhinocha-chorna-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-chornyi';
const NAVY_DRESS_SLUG = 'zhinocha-temno-synya-suknya-slim-5x2-rib-tommy-hilfiger-ww0ww46138-synii';

export const PRODUCTS = {
  /** Основной тестовый товар: «Жіноча чорна сукня SLIM 5X2 RIB» Tommy Hilfiger. */
  blackDress: {
    sku: 'WW0WW46138',
    name: 'Жіноча чорна сукня SLIM 5X2 RIB',
    fullName: 'Жіноча чорна сукня SLIM 5X2 RIB Tommy Hilfiger WW0WW46138',
    title: 'Жіноча чорна сукня SLIM 5X2 RIB Tommy Hilfiger WW0WW46138 — MD-Fashion',
    slug: BLACK_DRESS_SLUG,
    url: `${BASE_URL}/store/${BLACK_DRESS_SLUG}`,
    sizes: ['XXS', 'XS', 'S', 'M', 'L'],
  },
  /** Тот же артикул в тёмно-синем цвете — часть размеров отсутствует. */
  navyDress: {
    sku: 'WW0WW46138',
    name: 'Жіноча темно-синя сукня SLIM 5X2 RIB',
    slug: NAVY_DRESS_SLUG,
    url: `${BASE_URL}/store/${NAVY_DRESS_SLUG}`,
    sizes: ['XS', 'S', 'M'],
  },
};

export const NONEXISTENT_PRODUCT_URL = `${BASE_URL}/store/nonexistent-product-xyz-000`;
