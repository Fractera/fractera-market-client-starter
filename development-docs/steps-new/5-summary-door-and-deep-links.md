# Step 5 — The summary door and deep links for the Mini App card

Serves: S-03, S-04
Stage: 1

## Asked

The core's main agent, 2026-11-27 ~22:00: the architect's answer (Telegram 1687, 21:58 UTC), verbatim: «Оплата только на сайте за реальные деньги» — recorded in the quiz (a decision and N-05). Variant A of `reports/research-telegram-mini-app-marketplace.md` is chosen, with B as its addition. This element's part: «GET /api/summary (keyed for the core and the node: counts waiting / in the cart with the total / bought not installed; ?element=<id> narrows to that element's tasks) and deep links that open one starter's card or one element's rows on your pages». The core builds the «Пульт» card on top of it; the custom element's card is a template release, the core's.

**Limits:** no model, one read of own data per call; a neighbour (`caller.kind === "element"`) gets its own element's counts only — the id from the key, never from the input; nothing else in the door card changes.

**Substeps:**
1. Pass: main — [coded 2026-11-27; test OK, the neighbour guard spoiled → FAILED 1, restored → OK] `npm run door:add -- summary --method GET`; `handle()`: node → `{ waiting, cart: { lines, total }, bought: { notInstalled } }`, `?element=<id>` → `{ element, found, waiting }`; an element caller → its own counts. Check: `npm run test:summary` with samples (node, element filter, a neighbour cannot ask for another id); live after the deploy: no key 401, with the key 200.
2. Pass: main — [coded 2026-11-27; `admin/_libs/deep-link.ts`; eyes wait for the core's deploy] deep links on the three pages: `?open=<slug>` opens that starter's card (recommendations, cart, bought), `?element=<id>` narrows «Рекомендованные элементы» to one element's rows (with a visible «Только элемент <id> · показать все»). Check: prebuild RC=0; eyes after the deploy on `/ru/admin/recommendations?open=fractera-test-image-starter` (the split with that card) and `?element=market`.
3. Close: commit, `describe:publish`, report; the core deploys and builds the card.
