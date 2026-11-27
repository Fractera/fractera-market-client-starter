// @local — the words of the widget «Купленные» (steps 3, 4-3); the server picks the language and passes them as a prop.
export type PurchasesWords = {
  version: string
  author: string
  got: string
  bought: string
  element: string
  install: string
  reinstall: string
  installing: string
  loading: string
  empty: string
  emptyHint: string
  unavailable: string
  state: Record<string, string>
  /** One line under a state that is not «installed» — in place of the core's own reason. */
  hint: Record<string, string>
  installStarted: string
  failed: string
  notStarted: string
  columns: { n: string; starter: string; author: string; version: string; got: string; state: string; actions: string }
  notInstalled: string
  onlyFractera: string
}

const en: PurchasesWords = {
  version: "version",
  author: "author",
  got: "bought",
  bought: "Bought",
  element: "element",
  install: "Install",
  reinstall: "Install again",
  installing: "Installing…",
  loading: "Loading what was bought…",
  empty: "Nothing bought yet",
  emptyHint: "A starter appears here only after the core of the project confirms it was bought.",
  unavailable: "The list did not load. The page itself works — try again later.",
  state: { none: "Not installed", running: "Installing", started: "Installing", installing: "Installing", installed: "Installed", done: "Installed", failed: "Install failed" },
  hint: {
    none: "Bought, not installed yet — press «Install».",
    running: "The core is installing it — reload the page to see the result.",
    started: "The core is installing it — reload the page to see the result.",
    installing: "The core is installing it — reload the page to see the result.",
    failed: "The core could not install it. Press «Install» to try again — no new payment.",
  },
  installStarted: "The core started the install — no new payment. Reload the page to see the result.",
  failed: "It did not work:",
  notStarted: "The install did not start. Try again in a minute.",
  columns: { n: "No.", starter: "Starter", author: "Author", version: "Version", got: "Bought", state: "State", actions: "Actions" },
  notInstalled: "Not installed",
  onlyFractera: "By Fractera",
}

const ru: PurchasesWords = {
  version: "версия",
  author: "автор",
  got: "куплен",
  bought: "Куплен",
  element: "элемент",
  install: "Установить",
  reinstall: "Установить ещё раз",
  installing: "Устанавливается…",
  loading: "Загружаю купленные…",
  empty: "Купленных пока нет",
  emptyHint: "Стартер появится здесь только после того, как ядро проекта подтвердит покупку.",
  unavailable: "Список не загрузился. Сама страница работает — попробуйте позже.",
  state: { none: "Не установлен", running: "Устанавливается", started: "Устанавливается", installing: "Устанавливается", installed: "Установлен", done: "Установлен", failed: "Установка не удалась" },
  hint: {
    none: "Куплен, но ещё не установлен — нажмите «Установить».",
    running: "Ядро устанавливает стартер — обновите страницу, чтобы увидеть итог.",
    started: "Ядро устанавливает стартер — обновите страницу, чтобы увидеть итог.",
    installing: "Ядро устанавливает стартер — обновите страницу, чтобы увидеть итог.",
    failed: "Ядро не смогло установить стартер. Нажмите «Установить», чтобы попробовать снова, — без новой оплаты.",
  },
  installStarted: "Ядро начало установку — без новой оплаты. Обновите страницу, чтобы увидеть итог.",
  failed: "Не получилось:",
  notStarted: "Установка не началась. Попробуйте ещё раз через минуту.",
  columns: { n: "№", starter: "Стартер", author: "Автор", version: "Версия", got: "Куплен", state: "Состояние", actions: "Действия" },
  notInstalled: "Не установленные",
  onlyFractera: "От Fractera",
}

export const purchasesWords = (lang: string): PurchasesWords => (lang === "ru" ? ru : en)
