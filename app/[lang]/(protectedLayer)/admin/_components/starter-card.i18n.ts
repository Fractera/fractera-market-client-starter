// @local — the words of the starter card (step 4-4), shared by «Рекомендованные элементы», «Корзина» and «Купленные».
export type StarterCardWords = {
  author: string
  source: string
  version: string
  simulated: string
  close: string
  price: string
  free: string
  can: string
  unknown: string
  why: string
  usefulness: string
  task: string
  askedBy: string
  storePage: string
  report: string
}

const en: StarterCardWords = {
  author: "author",
  source: "source",
  version: "version",
  simulated: "simulated",
  close: "Close the card",
  price: "Price",
  free: "Free",
  can: "What it can do",
  unknown: "The store gave no description.",
  why: "Why it fits",
  usefulness: "usefulness",
  task: "The task that asked for it",
  askedBy: "asked by",
  storePage: "The starter’s page in the store",
  report: "The store’s research report",
}

const ru: StarterCardWords = {
  author: "автор",
  source: "источник",
  version: "версия",
  simulated: "симуляция",
  close: "Закрыть карточку",
  price: "Цена",
  free: "Бесплатно",
  can: "Что умеет",
  unknown: "Магазин не дал описания.",
  why: "Почему подходит",
  usefulness: "польза",
  task: "Задача, для которой подобран",
  askedBy: "просит",
  storePage: "Страница стартера в магазине",
  report: "Исследовательский отчёт магазина",
}

export const starterCardWords = (lang: string): StarterCardWords => (lang === "ru" ? ru : en)
