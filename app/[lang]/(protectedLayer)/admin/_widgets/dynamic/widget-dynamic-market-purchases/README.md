# widget-dynamic-market-purchases

The island of the page `/<lang>/admin/purchases` (step 3): what the core confirmed as received, version, author, «Установить ещё раз»; an honest empty state.

- **Where it stands:** the last item of the sequence in `admin/_pages/purchases/<lang>.json`; listed in `admin/_widgets/index.tsx`.
- **Words:** `words.i18n.ts`, chosen by the server (`index.tsx`) and passed as a prop.
- **Shapes and formatting:** `admin/_libs/market.ts`.
- **Data and actions:** not wired yet (substep 3-1 is the design pass) — the island shows its own skeleton; the main pass connects it
  through server-side calls of `lib/market` that check the architect's session (the browser never holds the node key).
- **Files:** `index.tsx` (server entry) · `view.client.tsx` (the island, its skeleton, empty and unavailable states).
