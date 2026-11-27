// @local — the words of the widget «Рекомендации» (step 3); the server picks the language and passes them as a prop.
export type RecommendationsWords = {
  task: string
  askedBy: string
  starters: string
  free: string
  simulated: string
  usefulness: string
  status: { waiting: string; kept: string; cart: string }
  keep: string
  delete: string
  toCart: string
  inCart: string
  bought: string
  open: string
  loading: string
  empty: string
  emptyHint: string
  unavailable: string
  searchLabel: string
  searchPlaceholder: string
  searchButton: string
  searching: string
  found: string
  nothingNew: string
  failed: string
}

const en: RecommendationsWords = {
  task: "Task",
  askedBy: "asked by",
  starters: "starters",
  free: "Free",
  simulated: "simulated",
  usefulness: "usefulness",
  status: { waiting: "waiting for your decision", kept: "kept", cart: "in the cart" },
  keep: "Keep",
  delete: "Delete",
  toCart: "To the cart",
  inCart: "In the cart",
  bought: "already bought",
  open: "Open the starter’s page",
  loading: "Loading the recommendations…",
  empty: "No recommendations yet",
  emptyHint: "They appear when an element of the project asks the store for a starter for its task.",
  unavailable: "The recommendations did not load. The page itself works — try again later.",
  searchLabel: "Find a starter in the Fractera store",
  searchPlaceholder: "What should the starter do? For example: a post by its title",
  searchButton: "Find",
  searching: "Searching…",
  found: "New starters in the list:",
  nothingNew: "The store has nothing new for this task.",
  failed: "It did not work:",
}

const ru: RecommendationsWords = {
  task: "Задача",
  askedBy: "просит",
  starters: "стартеров",
  free: "Бесплатно",
  simulated: "симуляция",
  usefulness: "польза",
  status: { waiting: "ждёт вашего решения", kept: "оставлен", cart: "в корзине" },
  keep: "Оставить",
  delete: "Удалить",
  toCart: "В корзину",
  inCart: "В корзине",
  bought: "уже куплен",
  open: "Открыть страницу стартера",
  loading: "Загружаю рекомендации…",
  empty: "Рекомендаций пока нет",
  emptyHint: "Они появляются, когда элемент проекта просит у магазина стартер под свою задачу.",
  unavailable: "Рекомендации не загрузились. Сама страница работает — попробуйте позже.",
  searchLabel: "Найти стартер в магазине Fractera",
  searchPlaceholder: "Что должен уметь стартер? Например: пост по заголовку",
  searchButton: "Найти",
  searching: "Ищу…",
  found: "Новых стартеров в списке:",
  nothingNew: "У магазина нет ничего нового под эту задачу.",
  failed: "Не получилось:",
}

export const recommendationsWords = (lang: string): RecommendationsWords => (lang === "ru" ? ru : en)
