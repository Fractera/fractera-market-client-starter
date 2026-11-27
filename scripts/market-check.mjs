// `npm run market:check -- <order>` — the agent's own hand when the payer's «Готово» wakes it (step 6): asks the core whether the
// order is paid; paid → «Купленные» and the install, not paid → the cart unlocks and says so. Prints one line; no model.
import { confirmPayment } from '../lib/market/market.mjs'

const order = process.argv[2]
const a = await confirmPayment({ order }, { kind: 'node' })
console.log(JSON.stringify(a.body))
console.log(a.status === 200 ? `===MARKET_CHECK_OK=== ${a.body.state}` : `===MARKET_CHECK_FAILED=== ${a.status}`)
process.exit(a.status === 200 ? 0 : 1)
