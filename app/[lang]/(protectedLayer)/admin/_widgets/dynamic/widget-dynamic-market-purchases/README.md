# widget-dynamic-market-purchases

The island of the page `/<lang>/admin/purchases` (step 3): what the core confirmed as received, version, author, «Установить ещё раз»; an honest empty state.

- **Where it stands:** the last item of the sequence in `admin/_pages/purchases/<lang>.json`; listed in `admin/_widgets/index.tsx`.
- **Words:** `words.i18n.ts`, chosen by the server (`index.tsx`) and passed as a prop.
- **Shapes and formatting:** `admin/_libs/market.ts`.
- **Data and actions:** not wired yet (substep 3-1 is the design pass) — the island shows its own skeleton; the main pass connects it
  through server-side calls of `lib/market` that check the architect's session (the browser never holds the node key).
- **Files:** `index.tsx` (server entry) · `view.client.tsx` (the island, its skeleton, empty and unavailable states).

**Door (step 3-2…4b):** `island.client.tsx` calls `/<lang>/admin/api/market` (`marketCall` of `admin/_libs/market.ts`) — the architect's session is checked there; the store, the purchase and the install go through the core's doors `/api/node/market/*` with this element's own key (`lib/market/store.mjs`).
