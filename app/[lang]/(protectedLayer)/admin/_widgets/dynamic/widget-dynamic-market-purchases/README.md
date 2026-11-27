# widget-dynamic-market-purchases

The island of the page «Купленные» `/<lang>/admin/purchases` (steps 3, 4-3): what the core confirmed as bought, version, author; «Куплен» and the install state apart (installed → its element and address); «Установить» until installed, «Установить ещё раз» only after; an honest empty state.

- **Where it stands:** the last item of the sequence in `admin/_pages/purchases/<lang>.json`; listed in `admin/_widgets/index.tsx`.
- **Words:** `words.i18n.ts`, chosen by the server (`index.tsx`) and passed as a prop.
- **Shapes and formatting:** `admin/_libs/market.ts`.
- **Files:** `index.tsx` (server entry) · `island.client.tsx` (data and the install) · `view.client.tsx` (the rows, skeleton, empty and unavailable states).

**Door (step 3-2…4b):** `island.client.tsx` calls `/<lang>/admin/api/market` (`marketCall` of `admin/_libs/market.ts`) — the architect's session is checked there; the store, the purchase and the install go through the core's doors `/api/node/market/*` with this element's own key (`lib/market/store.mjs`).
