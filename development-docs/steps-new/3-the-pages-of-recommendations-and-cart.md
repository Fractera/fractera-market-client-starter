# Step 3 — The pages of recommendations and the cart

Serves: S-03, S-04, S-05, S-06, S-07, R-01, R-02, R-03
Stage: 1

## Asked

The core's main agent, 2026-11-27 15:00: «спланируй шаг 3 — этап 1, страницы "Рекомендации", "Корзина", "Покупки" (только для архитектора)»;
the «yes» 2026-11-27 ~19:40: «yes, as written in the plan», widened in the same message: «search, cart, purchase and install through
the core's doors /api/node/market/*, your own key; payment hidden, the free path first; the stub replaced by the core's search door».
The core's doors measured 2026-11-27: `search`, `purchase`, `install`, `order` answer 401 without a key (exist); `cart` — 404.


The «yes» brought the free path of stage 3 into this step (purchase, order, install of a free starter, «Покупки» with reinstall).

**Exists and reused:** the doors' logic `lib/market/market.mjs` (step 2), the protected branch `app/[lang]/(protectedLayer)/admin`,
the architect's session (skill `use-auth`), shadcn parts (`parts_find` first: table, button, badge, empty state, tooltip).

**Limits:** architect only — anyone else gets the sign-in or 403; the browser never holds the node key — the widgets act through
server actions that check the architect's session and call `lib/market` directly; payment of a paid starter is hidden; no word «куплено» while nothing is bought; pages static where they can be, the lists are
dynamic islands with a skeleton.

**Substeps:**
1. Pass: design — three page skeletons in the admin branch: «Рекомендации» (grouped by task), «Корзина», «Покупки»; one dynamic widget
   per page from shadcn parts, every container with `data-block`. Check: `npm run eyes` screenshots of the three pages, phone and desktop.
   ✓ Done 2026-11-27: pages `admin/_pages/{recommendations,cart,purchases}`, islands `widget-dynamic-market-*`, shapes in
   `admin/_libs/market.ts`; prebuild RC=0; eyes at 1440 and 390 px on a temporary dev server — 200, skeletons drawn, no console errors.
2. Pass: main — «Рекомендации»: rows by task with every E-01 field (element, starter, source, simulated mark, page link, price,
   usefulness, why, status, time); buttons «Оставить» · «Удалить» · «В корзину» through server actions. Check: delete → the row leaves;
   the next search on that task does not bring it back.
3. Pass: main — «Корзина»: one line per starter, remove, clear, the total; «Оплатить» hidden for now; «уже куплен» refused.
   Check: «В корзину» twice → one line; total = sum of lines; no payment button is shown.
4. Pass: main — «Покупки»: what was bought, its version, author, «Установить ещё раз»; an honest empty state. Check: empty state renders.
4a. Pass: main — the stub replaced: `search()` of `lib/market/store.mjs` calls the core's `/api/node/market/search` with this
   element's own key; the stub stays only for the tests. Check: a live search answers `mode` other than «stub».
4b. Pass: main — the free path: «Получить» on a free starter in the cart → the core's `purchase` → `order` status → `install`; the row and
   «Покупки» show it bought only after the core says so (R-04). Payment of a paid starter stays hidden (not «оплата скоро» any more).
   Check: a free test starter goes the whole chain and a new element appears; «Установить ещё раз» asks no payment.
5. Pass: main — access: architect only. Check: the pages without a session → sign-in; with another role → refused.
6. Pass: texts — the words of the three pages in ru and en.
7. Close: full `npm run prebuild` RC=0, one build («Deploy» by the leader), the checks repeated live, `steps-done/3.md`, the links with
   `#block=` of each page.
