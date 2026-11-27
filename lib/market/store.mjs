// @local — the one way this element reaches the Fractera store: search(envelope) in the store's search v2 standard.
// R-01: no store address and no key here. Today a stub answers in the v2 shape; when the core's store door (core step 862-2)
// exists, only the body of search() changes — it calls that door, and the core signs and sends.

const STARTERS = [
  { slug: 'fractera-test-post-starter', name: 'Тестовый пост', description: 'Test starter: one post.' },
  { slug: 'fractera-test-image-starter', name: 'Тестовая картинка', description: 'Test starter: one picture.' },
]

/** Search v2 request: { v: 2, node, element, request, lang?, budget?, limit?, history: [{ starter, action, task }] }. */
export async function search(envelope) {
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
    // The stub says what history it received, so a live check can prove the history went out (stage 0 «ready»).
    summary: `stub: ${items.length} item(s); history received: ${history.length}`,
    items,
  }
}
