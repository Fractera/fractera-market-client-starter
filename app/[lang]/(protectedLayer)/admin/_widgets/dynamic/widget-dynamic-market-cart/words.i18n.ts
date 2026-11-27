// @local — the words of the widget «Корзина» (step 3); the server picks the language and passes them as a prop.
export type CartWords = {
  free: string
  added: string
  remove: string
  clear: string
  total: string
  get: string
  pay: string
  awaiting: string
  awaitingHint: string
  order: string
  check: string
  unpaid: string
  paidDone: string
  stillUnpaid: string
  alreadyBought: string
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
  pay: "Pay",
  awaiting: "Waiting for the payment",
  awaitingHint: "The payment window is at the bottom of every page of the panel and in Telegram. The starters stay locked here until the payment arrives; nothing is installed before it.",
  order: "order",
  check: "Check the payment",
  unpaid: "The payment has not arrived. The cart is open again; the order is kept:",
  paidDone: "Paid. The starter is in «Bought» — install it there.",
  stillUnpaid: "The payment has not arrived yet.",
  alreadyBought: "Already bought — it installs from that order, with no second payment.",
  loading: "Loading the cart…",
  empty: "The cart is empty",
  emptyHint: "Put a starter here from the recommendations.",
  unavailable: "The cart did not load. The page itself works — try again later.",
  getting: "Getting…",
  gotDone: "Received. The core is installing it — see «Bought».",
  pending: "The core has not confirmed it yet:",
  failed: "It did not work:",
  consent: "The starter is delivered at once; there is no refund except where the law requires one.",
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
  pay: "Оплатить",
  awaiting: "Ждём оплату",
  awaitingHint: "Окно оплаты — внизу каждой страницы панели и в Telegram. Пока оплата не пришла, стартеры здесь заблокированы и ничего не устанавливается.",
  order: "заказ",
  check: "Проверить оплату",
  unpaid: "Оплата не пришла. Корзина снова открыта, заказ сохранён:",
  paidDone: "Оплачено. Стартер в «Купленных» — установите его там.",
  stillUnpaid: "Оплата пока не пришла.",
  alreadyBought: "Уже куплено — устанавливается из того заказа, без второй оплаты.",
  loading: "Загружаю корзину…",
  empty: "Корзина пуста",
  emptyHint: "Положите сюда стартер со страницы рекомендаций.",
  unavailable: "Корзина не загрузилась. Сама страница работает — попробуйте позже.",
  getting: "Получаю…",
  gotDone: "Получено. Ядро устанавливает стартер — смотрите «Купленные».",
  pending: "Ядро ещё не подтвердило:",
  failed: "Не получилось:",
  consent: "Стартер передаётся сразу; возврата нет, кроме случаев, когда этого требует закон",
  toPurchases: "Купленные",
  columns: { n: "№", starter: "Стартер", author: "Автор", price: "Цена", added: "Добавлен", actions: "Действия" },
  onlyFree: "Бесплатные",
  onlyFractera: "От Fractera",
  priceUp: "Цена ↑",
  priceDown: "Цена ↓",
}

export const cartWords = (lang: string): CartWords => (lang === "ru" ? ru : en)
