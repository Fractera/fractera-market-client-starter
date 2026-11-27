# Research — offering the marketplace pages in a Telegram Mini App

Asked: the architect, Telegram 1682, 2026-11-27 21:50 UTC, verbatim: «Также мне понадобится твоё глубокое исследование на тему как правильно предложить данный интерфейс в mini app Telegram».
Passed by the core's main agent with its frame: a Mini App is one person's remote (navigation to the project's pages, a jump from a
section to a chat on its topic, short statistics, scheduled tasks, search); it never copies a page or an app's function — the person acts
on the real page by role (core law §6, step 848); a native element's Mini App is drawn by the core in three parts — token use, its site,
the chat (step 853); a marketplace part there is the core's to build, this element proposes it.
Written in English by the law of `development-docs/` (`check:dev-docs`, the owner 2026-10-06); the architect gets the summary in
Russian in the report. No code was written for this research.

## 1. What Telegram says (its own documentation only, read 2026-11-27)

Source A — https://core.telegram.org/bots/webapps (Bot API 10.1 on the page, «Recent changes», June 11, 2026).
Source B — https://core.telegram.org/bots/payments-stars.

- **Launch and deep links** (A, «Implementing Mini Apps», «Direct Link Mini Apps», «Launching the main Mini App»): seven ways; the
  ones that fit a remote are the main Mini App (profile button «Launch app», shown in the «Apps» tab of search), the menu button, an
  inline button under a bot message, and a direct link `https://t.me/<bot>/<app>?startapp=<command>` — the value arrives as
  `start_param`, so one link can open the app straight on «Корзина». `mode=compact` opens it at half height. The attachment menu is
  «currently only available for major advertisers» — not for us.
- **Bottom buttons** (A, «BottomButton», «BackButton», «SettingsButton»): `MainButton` (one primary action at the bottom),
  `SecondaryButton` (position left / right / top / bottom), `BackButton` in the header, `SettingsButton` in the context menu.
- **Theme** (A, «ThemeParams»): the app gets the user's theme in real time as CSS variables (`--tg-theme-bg-color`,
  `--tg-theme-button-color`, `--tg-theme-section-bg-color` …), light or dark (`colorScheme`).
- **Safe areas** (A, «SafeAreaInset», «ContentSafeAreaInset»): two insets — the device's (notch, navigation bar) and Telegram's own
  UI — to respect «especially when using fullscreen mode».
- **Design guidelines** (A, «Design Guidelines»): «mobile-first»; interactive elements «should mimic the style, behavior, and intent of
  UI components that already exist»; animations «ideally 60fps»; labels on all inputs and images; use the theme colours; respect both
  safe areas; fewer effects on low-performance Android devices.
- **Haptics** (A, «HapticFeedback»): impact, notification (success / warning / error), selection — and «Do not use this feedback when
  the user makes or confirms a selection».
- **Trust** (A, «Validating data received via the Mini App»): `initDataUnsafe` «should not be trusted»; the server validates `initData`
  (HMAC with the bot token) before acting. Whoever owns the bot — the core — validates.
- **Payments — the deciding rule** (B): «Payments for digital goods and services must be carried out exclusively in Telegram Stars»,
  «regardless of any other web portals, apps, services or payment providers you may have set up outside the Telegram ecosystem»;
  otherwise Telegram «cannot display your bot or mini-app to mobile users». A starter is a digital good. So a Mini App that sells
  starters by card — or carries a «Pay» button that leads to the card window — puts the whole node's Mini App at risk on phones.
  A Mini App that only shows and links (no sale inside Telegram) stays clear; a sale inside Telegram would have to be in Stars (XTR),
  with `/terms` and `/paysupport` commands and refunds through `refundStarPayment` (B).

## 2. Real catalogues looked at (2026-11-27)

- **FindMini** — https://www.findmini.app: rankings as the front door («Most popular TMAs», «Top growing bots», «Top grossing TMAs»),
  each row with rank, icon, name, users and a 1d/7d/30d change; categories with a growth figure; «+ Add your app» in the header; a QR
  code «to open FindMini.app in Telegram». Good: numbers first — a person sees what moves in one glance. Weak for a phone: wide tables.
- **Telegram Apps Center** — https://tapps.center: category chips on top (Wallets, Marketplaces …), cards with icon, name, one line and
  «Open». Good: the simplest list a thumb can scroll — one line per app and one button. Today it shows «Something new is coming»; no
  search on the page.
- **Telegram's own «Apps» tab** (A): a bot with a main Mini App is listed there; apps that «accept payments in Telegram Stars» may be
  featured in the Mini App Store. The announcement post t.me/BotNews/99 did not load as text — not read.

What we take: FindMini's «numbers first» (counters, not lists) and Apps Center's «one line, one button» — both fit a remote.

## 3. An idea taken from a skill

Skill `mobile-app-ui-design` (author ceorkm, 491★, 12k installs, as the core named it) — the idea only, no text: the primary actions
in the thumb zone (the lower third of the screen), touch targets ≥ 44 pt, an 8-point grid. In a Mini App the lower third is where
Telegram's own `MainButton` already sits — so the one action of the part goes there, not into our own markup.

## 4. Variants

**A. «Маркет» as a remote card (pick).** In the core's Mini App, inside its part «site» of this element: three counters in one card —
«Рекомендовано · ждут решения N», «В корзине N · итог», «Куплено · не установлено N»; a tap on a counter opens the real page
(`/ru/admin/recommendations`, `/cart`, `/purchases`) where the person acts by role; one search line «Найти стартер…» that sends the
task to this element's store search and answers with «найдено N — открыть»; a jump to the chat of the topic «Маркетплейс»; the
`MainButton` «Открыть рекомендации» when something waits. Nothing is bought, kept or deleted inside the Mini App.
Why: it is exactly the remote the law asks for, it never copies a page, and it keeps the Mini App clear of the Stars rule.

**B. Messages first, the Mini App as a link.** No part in the Mini App beyond one counter; the bot writes a message when new starters
land in the recommendations («Найдено 2 стартера для задачи: пост по заголовку — открыть») with an inline button / a `startapp` link that
opens the card of that starter. Good for attention; weak as a remote — no overview, the chat fills with notices. Best as an addition
to A (a notice on new recommendations), not instead of it.

**C. A small store inside the Mini App** — cards, «Оставить / Удалить / В корзину», the cart and «Оплатить» in Telegram. Refused:
it copies the pages (against §6, step 848), and a card payment for a digital good inside Telegram breaks the Stars rule (B) — the risk
is the node's Mini App hidden from mobile users. Possible only as a separate decision to sell in Stars.

## 5. Who builds what (variant A)

- **The core:** the «Маркет» card in its Mini App (part «site» of this element), the Telegram side — `initData` validation, theme
  variables, safe areas, `MainButton`, `BackButton`, the `startapp` links, the jump to the chat topic; it reads the counters from this
  element's door with the node key.
- **This element:** one door `GET /api/summary` → `{ waiting, cart: { lines, total }, bought: { notInstalled } }` (no model, one
  read of its own data); the store search door it already has (`POST /api/recommend`) for the search line; page links that open the
  card of one starter straight (`/ru/admin/recommendations?open=<slug>`) so a link from Telegram lands on the right row; the real pages
  already work at 390 px (step 4: the card as a 90 % drawer).
- Nothing here is built until the core and the architect say which variant.

## 6. The one question for the architect

Will starters ever be sold right inside Telegram for Stars, or is payment always only on the site? — the answer decides whether the
Mini App stays a remote that links to the cart (A) or one day takes a Stars payment (a separate step with `/terms`, `/paysupport`, refunds).
