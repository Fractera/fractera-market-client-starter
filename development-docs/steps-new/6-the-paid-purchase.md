# Step 6 — The paid purchase in the cart (core step 862-15)

Serves: S-05, S-06, S-07, R-01, R-04, R-05
Stage: 1

## Asked

The architect, 2026-11-27 23:18 UTC (Telegram 1737), verbatim: «Следом после этого создавай как мы с тобой договорились покупку элементов. Для этого один из элементов сделать платным например один доллар попробуем его покупить через тестовой аккаунт Страйп».
The core's main agent: the cart shows the total and one button — «Получить» (free) or «Оплатить» (priced) — under a consent checkbox, unchecked by default, the button disabled until ticked: «Стартер передаётся сразу; возврата нет, кроме случаев, когда этого требует закон»; the button calls the core's POST /api/node/market/purchase `{ cart: [{ slug }], consent, lang }` → `paid` (the free path) · `already-ordered` («уже куплено», install from that order) · `awaiting-payer` (the cart becomes «Ждём оплату» with the order and the total, lines locked, nothing installed; the payer's window is the core's); the payer's «Готово» wakes this agent → POST /api/node/market/order → paid → «Купленные» with «Установить»; not paid → the cart says so and unlocks, the order kept; after a reload both pages read the core's orders (GET /api/node/market/orders). Money never passes through the node.
The shapes, from the core's main agent (2026-11-27 23:40): purchase → `{ ok, state, order: 'ord-<24 hex>', items: [{ slug, name, tag }], total: { amount, currency }, window? }` (already-ordered: `items: [{ slug, order }]`), a refusal `{ ok: false, reason }`; order → `{ ok, order, paid, items }`, 400 a bad id, 404 unknown; orders → `[{ order, at, paid, total, items, by }]`, newest first.

**Limits:** no card number, key or payment page here; the browser keeps nothing — the cart's waiting state is this element's own record plus the core's orders; one payment per cart.

**Substeps:**
1. Pass: main — [coded 2026-11-27; the market test OK with 9 new cases; the cart lock spoiled → FAILED 3, restored → OK] `lib/market`: the purchase body of the new contract, `orders()`; a table `market_orders` (order, state awaiting · unpaid · paid, total, slugs, window, at); `checkout({ consent, lang })` refuses without consent, handles the three states; `confirmPayment({ order })` (paid → settle and install; not paid → `unpaid`, the cart unlocks); `cartBody()` carries `awaiting` and locks its lines; reads reconcile with the core's orders (a paid order missing in «Купленные» is added). A command for the wake: `npm run market:check -- <order>`. Check: the market test against a stub of the core's shapes — free paid, priced awaiting-payer (locked, nothing installed), already-ordered, consent missing → 400, check paid → «Купленные», check unpaid → unlocked, reload from orders.
2. Pass: main — [coded 2026-11-27; prebuild RC=0; eyes wait for the core's deploy] the cart page: the consent checkbox (shadcn `Checkbox` + `Label`), «Получить» / «Оплатить» disabled until ticked; «Ждём оплату» with the order, the total, where the payer's window is and «Проверить оплату»; locked lines. Check: prebuild RC=0; eyes after the deploy at 1440 and 390 (free cart with the checkbox).
3. Live — [waiting: the core names the priced test starter's slug] the store's priced test starter (the core names its slug) → to the cart → «Оплатить» → awaiting → the payer pays in Stripe test mode → «Готово» → paid → «Купленные» → «Установить». Not provable before the slug exists.
4. Close: commit, reply-core, report.
