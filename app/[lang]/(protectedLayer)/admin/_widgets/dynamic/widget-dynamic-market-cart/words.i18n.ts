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
  getting: string
  gotDone: string
  pending: string
  failed: string
  consent: string
  toPurchases: string
  columns: { n: string; starter: string; author: string; price: string; added: string; actions: string }
  onlyFree: string
  onlyFractera: string
  priceUp: string
  priceDown: string
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
  getting: "Getting…",
  gotDone: "Received. The core is installing it — see «Bought».",
  pending: "The core has not confirmed it yet:",
  failed: "It did not work:",
  consent: "By pressing «Get» you agree to immediate delivery; no refund unless the law requires one.",
  toPurchases: "Bought",
  columns: { n: "No.", starter: "Starter", author: "Author", price: "Price", added: "Added", actions: "Actions" },
  onlyFree: "Free",
  onlyFractera: "By Fractera",
  priceUp: "Price ↑",
  priceDown: "Price ↓",
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
  getting: "Получаю…",
  gotDone: "Получено. Ядро устанавливает стартер — смотрите «Купленные».",
  pending: "Ядро ещё не подтвердило:",
  failed: "Не получилось:",
  consent: "Нажимая «Получить», вы соглашаетесь на немедленную поставку; возврата нет, если его не требует закон.",
  toPurchases: "Купленные",
  columns: { n: "№", starter: "Стартер", author: "Автор", price: "Цена", added: "Добавлен", actions: "Действия" },
  onlyFree: "Бесплатные",
  onlyFractera: "От Fractera",
  priceUp: "Цена ↑",
  priceDown: "Цена ↓",
}

export const cartWords = (lang: string): CartWords => (lang === "ru" ? ru : en)
