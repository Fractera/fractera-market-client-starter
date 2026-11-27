# widget-dynamic-market-recommendations

The island of the page `/<lang>/admin/recommendations` (step 3, table since 4-1): one table of every recommended starter on this element's own `table-tools` (`components/table/`) — the store search in its top card, the filters «Бесплатные» and «От Fractera», the price sort ↑ / ↓, «Сбросить отбор», № · starter · author · price · task · state · actions, rows per page and pages; keep · delete · to the cart.

- **Where it stands:** the last item of the sequence in `admin/_pages/recommendations/<lang>.json`; listed in `admin/_widgets/index.tsx`.
- **Words:** `words.i18n.ts`, chosen by the server (`index.tsx`) and passed as a prop.
- **Shapes and formatting:** `admin/_libs/market.ts`.
- **Filters and sort** work on the rows the page already has (no door); the top field is the store search, never a row filter.
- **Files:** `index.tsx` (server entry) · `view.client.tsx` (the table, its skeleton, empty and unavailable states).

**Door (step 3-2…4b):** `island.client.tsx` calls `/<lang>/admin/api/market` (`marketCall` of `admin/_libs/market.ts`) — the architect's session is checked there; the store, the purchase and the install go through the core's doors `/api/node/market/*` with this element's own key (`lib/market/store.mjs`).
