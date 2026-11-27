# Step 2 — The recommendation list with the history of choices

Serves: S-01, R-01, R-03, R-04, E-01, E-02, E-03
Stage: 0

## Asked

The core's main agent, for the architect (`development-docs/pre-steps/handled/27-11-2026_11-40-00.md`):
«каждый поставляемый в комплекте MarketPlace клиент имеет возможность извлекать элементы из MarketPlace и хранить историю …». Stage 0 of the quiz: an element asks for a
recommendation — rows appear in the list; the task's history goes out with every search; the store is a stub with the same standard.

## What exists and is reused

- The template's door generator `npm run door:add` (route, key `X-Node-Key`, card) — skill `add-door`.
- The data link (`REMOTE_DATA_URL`, `X-Data-Secret`) — table rows in this element's own space of the node's data element; no own database file.
- The store's search v2 standard — held by the core (skill `marketplace`); this element never holds the store's address or a key (R-01).

## Limits

- R-01: no store or Lagrix address, no key, no payment, no install in this folder; every store call is one module that today answers
  from a stub and later calls the core's door (core step 862-2) — one switch, no other code changes.
- R-04: no answer to an asking element contains «куплено»; it hears «рекомендовано, ждёт решения человека» with the links.
- No pages in this step (stage 1), no bot search (stage 2), no payment (stage 3).

## Proposed answers to the open questions (taken as defaults; the architect may correct)

- Q-01: one task keeps at most 10 active rows; a new search adds only starters not in the task's history; a «deleted» row leaves the
  list at once and stays only in the history; above 10 the oldest «kept» row (never a cart row) moves to the history.
- Q-02: the Telegram summary comes with stage 2 (the bot), not with the pages.
- History mapping: a row's «deleted» → history «rejected»; «kept» and «in the cart» → «kept»; «bought» only from the core (stage 3).

## Substeps

1. **The contract.** Ask the core (`npm run ask-core`) for the store search v2 request and answer and the shape of the core's store door
   (862-2); write them into `development-docs/glossary.md` (terms) and this plan. Check: the answer quoted in this plan. Pass: main.
2. **The data.** Three kinds of rows in the own space of the data element: recommendation (E-01), cart line (E-02), choice history
   (E-03). Check: a row written and read back live through the data link. Pass: main.
3. **The store module with the stub.** `lib/store/` — one function `search({ task, element, lang, history })`; today a stub that keeps
   the standard's answer shape, marks Lagrix rows as simulated and records the history it received. Check: `grep` for `fractera.ai`,
   `lagrix` URLs and key names in the code returns nothing (R-01). Pass: main.
4. **Doors of the list.** `POST /api/recommend { element, task, lang }`, `GET /api/recommendations`, `POST /api/choice { row,
   keep|delete|cart }` by `npm run door:add`. Check live: a call without `X-Node-Key` → refused; two calls on one task → the stub shows
   the second carried the first's history; after `delete` the next search does not return that starter; no answer has «куплено». Pass: main.
5. **Doors of the cart and the history.** `GET|POST /api/cart` (add · remove · clear, total), `GET /api/history`. Check live: «cart» twice
   for one starter → one row; the total equals the sum of rows; a starter marked bought is refused from the cart (R-03). Pass: main.
6. **Close.** Full `npm run prebuild` green (RC read first), one rebuild for all, the live checks repeated on the running element,
   `steps-done/2.md`, quiz stage 0 items → their state, `npm run development`, the passport description refined
   (`accepts`, `returns`) and `npm run describe:publish`. Pass: main.

## Done when

The quiz's stage 0 «ready»: two requests on one task — the second carries the first's history; a request without the project key is
refused. Each check above with its command and its line; what could not be checked said plainly.
