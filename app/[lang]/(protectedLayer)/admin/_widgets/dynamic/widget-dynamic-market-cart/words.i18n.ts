// @local — the words of the widget «Корзина» (step 3); the server picks the language and passes them as a prop.
export type CartWords = {
  free: string
  added: string
  remove: string
  clear: string
  total: string
  get: string
  paidClosed: string
  loading: string
  empty: string
  emptyHint: string
  unavailable: string
}

const en: CartWords = {
  free: "Free",
  added: "added",
  remove: "Remove",
  clear: "Clear the cart",
  total: "Total",
  get: "Get",
  paidClosed: "Only free starters can be got here for now.",
  loading: "Loading the cart…",
  empty: "The cart is empty",
  emptyHint: "Put a starter here from the recommendations.",
  unavailable: "The cart did not load. The page itself works — try again later.",
}

const ru: CartWords = {
  free: "Бесплатно",
  added: "добавлен",
  remove: "Убрать",
  clear: "Очистить корзину",
  total: "Итого",
  get: "Получить",
  paidClosed: "Пока здесь можно получить только бесплатные стартеры.",
  loading: "Загружаю корзину…",
  empty: "Корзина пуста",
  emptyHint: "Положите сюда стартер со страницы рекомендаций.",
  unavailable: "Корзина не загрузилась. Сама страница работает — попробуйте позже.",
}

export const cartWords = (lang: string): CartWords => (lang === "ru" ? ru : en)
