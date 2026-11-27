// @local — the one way this element reaches the Fractera store: the core's doors /api/node/market/* with this element's own key
// (R-01: no store address and no store key here — the core signs and sends). `stubSearch` stays for the door tests only.
import { coreUrlOf } from '../neighbour.mjs'

async function core(path, init = {}, env = process.env) {
  const key = String(env.SETTINGS_SECRET ?? '').trim()
  const base = coreUrlOf(env)
  if (!key || !base) return { ok: false, status: 503, reason: !key ? 'no key of this element' : 'the address of the core is unknown' }
  try {
    const r = await fetch(`${base}/api/node/market/${path}`, {
      ...init,
      headers: { 'X-Node-Key': key, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
      cache: 'no-store',
      signal: AbortSignal.timeout(90_000),
    })
    const body = await r.json().catch(() => null)
    if (!body) return { ok: false, status: 502, reason: `the core answered ${r.status} without JSON` }
    return r.ok ? body : { ok: false, status: r.status, ...body }
  } catch (e) {
    return { ok: false, status: 502, reason: `the core did not answer: ${e?.message ?? e}` }
  }
}

/** Search v2 through the core: the core adds the node and this element, signs, and returns the store's v2 answer. */
export async function search(envelope) {
  const request = String(envelope?.request ?? '').slice(0, 500)
  const body = { request, lang: envelope?.lang ?? 'ru', limit: envelope?.limit ?? 8, history: envelope?.history ?? [] }
  const a = await core('search', { method: 'POST', body: JSON.stringify(body) })
  if (a?.v !== 2) return { v: 2, error: 'store_unavailable', reason: a?.reason ?? 'no v2 answer' }
  return a
}

/** The payer's consent the core requires: immediate delivery, no refund unless the law requires one. */
export const CONSENT = { immediateDelivery: true, noRefund: true }

/** The core's purchase door (862-15): `{ cart: [{ slug }], consent, lang }` → paid · awaiting-payer · already-ordered. */
export const purchase = (slugs, lang = 'ru') =>
  core('purchase', { method: 'POST', body: JSON.stringify({ cart: slugs.map((slug) => ({ slug })), consent: CONSENT, lang }) })
/** The node's records of orders, newest first: `[{ order, at, paid, total, items, by }]` (a bare list or `{ orders }`). */
export const orders = async () => {
  const a = await core('orders')
  if (Array.isArray(a)) return { ok: true, orders: a }
  return a?.ok === false ? a : { ok: true, orders: Array.isArray(a?.orders) ? a.orders : [] }
}
export const order = (id) => core('order', { method: 'POST', body: JSON.stringify({ order: id }) })
/** The core's install contract: POST {order, slug} — `again: true` only for «Установить ещё раз»; GET ?order=&slug= →
 *  state running | installed (element) | failed (reason) | none. */
export const install = (id, slug, again = false) =>
  core('install', { method: 'POST', body: JSON.stringify(again ? { order: id, slug, again: true } : { order: id, slug }) })
export const installState = (id, slug) => core(`install?order=${encodeURIComponent(id)}&slug=${encodeURIComponent(slug)}`)

const STARTERS = [
  { slug: 'fractera-test-post-starter', name: 'Тестовый пост', description: 'Test starter: one post.' },
  { slug: 'fractera-test-image-starter', name: 'Тестовая картинка', description: 'Test starter: one picture.' },
]

/** The stub in the v2 shape — for the door tests only. */
export async function stubSearch(envelope) {
  const request = String(envelope?.request ?? '')
  if (envelope?.v !== 2 || request.length < 1 || request.length > 1000) {
    return { v: 2, error: 'bad-request', reason: 'v must be 2 and request 1-1000 characters' }
  }
  const history = Array.isArray(envelope.history) ? envelope.history : []
  const rejected = new Set(history.filter((h) => h.action === 'rejected' && h.task === request).map((h) => h.starter))
  const bought = new Set(history.filter((h) => h.action === 'bought').map((h) => h.starter))
  const limit = Math.min(8, Math.max(1, Number(envelope.limit) || 8))
  const items = STARTERS.filter((s) => !rejected.has(s.slug)).slice(0, limit).map((s) => ({
    name: s.name, kind: 'starter', slug: s.slug,
    url: `stub://store/starters/${s.slug}`, page: `stub://store/starters/${s.slug}`,
    author: { name: 'Fractera', github: 'fractera' }, repository: s.slug, repositoryAccess: 'private',
    description: s.description,
    price: { amount: 0, currency: 'USD', per: 'once' },
    usefulness: [{ context: request, score: 0.5 }],
    whyFits: { matchedWords: [], score: 0.5, closeness: 0.5, usefulness: 0.5, price: 1, context: request },
    bought: bought.has(s.slug), install: { needs: [] },
    validation: { tag: 'stub', commit: '', researchedAt: '', model: '', effort: '', costUsd: 0, report: '' },
  }))
  return {
    v: 2, mode: 'stub',
    caller: { node: envelope.node ?? null, element: envelope.element ?? null, verified: false },
    stored: false,
    summary: `stub: ${items.length} item(s); history received: ${history.length}`,
    items,
  }
}
