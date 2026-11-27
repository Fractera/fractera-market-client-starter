// The work of the door POST /api/recommend: Search the store for a task and list recommended starters.
// Gets what the caller sent (the JSON body) and who it is — `caller`, from its key:
// { kind: 'node' } the core or a native element, { kind: 'element', id } a neighbour — answer it with its own data
// only, the id from the key and never from the input. Returns { status, body }: 200 with the result, 400 or 422 with { error, reason }
// for input it cannot use. Pure: no request, no key — route.ts does that.
import { recommend } from '../../../lib/market/market.mjs'

export async function handle(input, caller) {
  return recommend(input, caller)
}
