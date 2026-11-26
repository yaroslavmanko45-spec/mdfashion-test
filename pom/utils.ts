/** «6 853 грн» / «- 2 937 грн» → 6853 / 2937 (знак и разделители тысяч отбрасываются). */
export const parsePrice = (text: string | null | undefined): number =>
  parseInt((text ?? '').replace(/[^\d]/g, ''), 10);

/** Кодирование запроса так, как его отправляет форма поиска: пробел → «+». */
export const formEncode = (query: string): string => encodeURIComponent(query).replace(/%20/g, '+');

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** RegExp для URL выдачи по запросу: /store?s=<запрос>. exact — запрос должен быть концом URL. */
export const searchUrlPattern = (query: string, { exact = false } = {}): RegExp =>
  new RegExp(`/store\\?s=${escapeRegExp(formEncode(query))}${exact ? '$' : ''}`);

/** 6853 → «6 853» (формат цен на сайте). */
export const formatPrice = (value: number): string =>
  String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
