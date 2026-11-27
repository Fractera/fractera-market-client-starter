// The work of the door GET /api/summary: Counts of recommendations waiting, cart and bought not installed.
// Gets what the caller sent (the query string as an object) and who it is — `caller`, from its key:
// { kind: 'node' } the core or a native element, { kind: 'element', id } a neighbour — answer it with its own data
// only, the id from the key and never from the input. Returns { status, body }: 200 with the result, 400 or 422 with { error, reason }
// for input it cannot use. Pure: no request, no key — route.ts does that.
// The work lives with the other marketplace doors in lib/market/market.mjs (`summary`): the counts for the core's «Пульт» card (step 5).
import { summary } from '../../../lib/market/market.mjs'

export async function handle(input, caller) {
  return summary(input ?? {}, caller)
}
