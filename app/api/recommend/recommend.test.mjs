// Samples of the marketplace doors (`npm run test:recommend`): the stage 0 «ready» on a memory repo and the stub store. Exit 1 on a miss.
import { handle } from './recommend.mjs'
import { handle as choice } from '../choice/choice.mjs'
import { handle as cart } from '../cart/cart.mjs'
import { handle as history } from '../history/history.mjs'
import { handle as list } from '../recommendations/recommendations.mjs'
import { use, checkout, purchases, reinstall } from '../../../lib/market/market.mjs'
import { memoryRepo } from '../../../lib/market/repo.mjs'
import { stubSearch as search, install as coreInstall, installState as coreInstallState } from '../../../lib/market/store.mjs'

const sent = []
const calls = []
const fakeCore = {
  purchase: async (slugs) => { calls.push(['purchase', slugs]); return { ok: true, state: 'paid', order: 'ord-000000000000000000000001', items: slugs.map((s) => ({ slug: s, name: s, tag: 'v0.1.0' })) } },
  order: async (id) => { calls.push(['order', id]); return { ok: true, order: id, paid: true, items: [{ slug: 'fractera-test-post-starter', name: 'Тестовый пост', tag: 'v0.1.0' }] } },
  install: async (id, slug, again) => { calls.push(['install', id, slug, again]); return { ok: true, state: 'running' } },
  installState: async (id, slug) => { calls.push(['state', id, slug]); return { ok: true, state: 'installed', element: 'test-post' } },
}
use({ repo: memoryRepo(), search: async (e) => { sent.push(e); return search(e) }, core: fakeCore })
const node = { kind: 'node' }
let failures = 0
const check = (label, ok, got) => { if (!ok) failures++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : `\n     got ${JSON.stringify(got)}`}`) }

const r0 = await handle({ task: '' }, node)
check('empty task is refused', r0.status === 400, r0)
const r1 = await handle({ element: 'blog', task: 'публиковать посты', lang: 'ru' }, node)
check('first search: two rows, waiting', r1.status === 200 && r1.body.rows.length === 2 && r1.body.rows.every((r) => r.status === 'waiting'), r1)
check('R-04: says «рекомендовано, ждёт решения человека», no «куплено»', r1.body.says === 'рекомендовано, ждёт решения человека' && !JSON.stringify(r1.body).includes('куплено'), r1.body)
check('first search sent an empty history', sent[0].v === 2 && sent[0].request === 'публиковать посты' && sent[0].history.length === 0, sent[0])

const img = r1.body.rows.find((r) => r.name === 'Тестовая картинка')
const post = r1.body.rows.find((r) => r.name === 'Тестовый пост')
const d = await choice({ row: img.id, action: 'delete' }, node)
check('delete → deleted', d.status === 200 && d.body.row.status === 'deleted', d)

const r2 = await handle({ element: 'blog', task: 'публиковать посты' }, node)
check('second search carries the first one’s history', sent[1].history.some((h) => h.starter === 'fractera-test-image-starter' && h.action === 'rejected'), sent[1])
check('the deleted starter does not come back', r2.body.rows.length === 1 && r2.body.rows[0].name === 'Тестовый пост' && r2.body.added === 0, r2.body)

await choice({ row: post.id, action: 'cart' }, node)
const c2 = await cart({ action: 'add', starter: 'fractera-test-post-starter' }, node)
check('«cart» twice → one line, total = sum', c2.status === 200 && c2.body.lines.length === 1 && c2.body.total.amount === 0, c2)

const n1 = await choice({ row: post.id, action: 'keep' }, { kind: 'element', id: 'blog' })
check('a neighbour cannot choose for the person', n1.status === 403, n1)
const own = await list({}, { kind: 'element', id: 'other' })
check('a neighbour sees only its own rows', own.status === 200 && own.body.tasks.length === 0, own)
const h = await history({ task: 'публиковать посты' }, node)
check('history: rejected + kept', h.body.history.length === 2, h)
const cl = await cart({ action: 'clear' }, node)
check('clear empties the cart', cl.body.lines.length === 0, cl)
const after = await list({ task: 'публиковать посты' }, node)
check('after clear the row is «kept», not «cart»', after.body.tasks[0].rows[0].status === 'kept', after.body)

// The free path (3-4b): the cart → purchase → order → install; «bought» only after the core says paid.
await cart({ action: 'add', starter: 'fractera-test-post-starter' }, node)
const g = await checkout({}, node)
check('a free cart → paid, installed, order kept', g.status === 200 && g.body.state === 'paid' && calls.map((c) => c[0]).join() === 'purchase,order,install', { g, calls })
const pu = await purchases({}, node)
check('install sent the order and the starter, not «again»', calls.find((c) => c[0] === 'install')?.slice(1).join() === 'ord-000000000000000000000001,fractera-test-post-starter,false', calls)
check('«Покупки» shows it with its version; a running install is asked once and settles «installed»', pu.body.purchases.length === 1 && pu.body.purchases[0].version === 'v0.1.0' && pu.body.purchases[0].install.state === 'installed' && pu.body.purchases[0].install.reason === 'test-post', pu.body)
const again = await cart({ action: 'add', starter: 'fractera-test-post-starter' }, node)
check('a bought starter does not go to the cart again', again.status === 404 || again.status === 409, again)
const ri = await reinstall({ starter: 'fractera-test-post-starter' }, node) // installed before → again: true
check('install again: no purchase, same order, again: true', ri.status === 200 && calls.at(-1).join() === 'install,ord-000000000000000000000001,fractera-test-post-starter,true' && calls.filter((c) => c[0] === 'purchase').length === 1, calls)
// The core answers «already-ordered» for a starter this project ordered before: the old order is taken, no second payment.
const r3 = await handle({ element: 'blog', task: 'картинка' }, node)
const imgRow = r3.body.rows.find((r) => r.name === 'Тестовая картинка')
await choice({ row: imgRow.id, action: 'cart' }, node)
fakeCore.purchase = async (slugs) => { calls.push(['purchase', slugs]); return { ok: true, state: 'already-ordered', items: slugs.map((s) => ({ slug: s, order: 'ord-000000000000000000000002' })) } }
fakeCore.order = async (id) => { calls.push(['order', id]); return { ok: true, order: id, paid: true, items: [{ slug: 'fractera-test-image-starter', name: 'Тестовая картинка', tag: 'v0.1.0' }] } }
const ao = await checkout({}, node)
const pu2 = await purchases({}, node)
check('«already-ordered» → the old order is recorded and installed', ao.status === 200 && ao.body.orders[0] === 'ord-000000000000000000000002' && pu2.body.purchases.length === 2 && calls.some((c) => c.join() === 'install,ord-000000000000000000000002,fractera-test-image-starter,false'), { ao, calls })
fakeCore.install = async (id, slug, again) => { calls.push(['install', id, slug, again]); return { ok: false, reason: 'the starter is not in this order' } }
await reinstall({ starter: 'fractera-test-post-starter' }, node)
fakeCore.install = async (id, slug, again) => { calls.push(['install', id, slug, again]); return { ok: true, state: 'running' } }
await reinstall({ starter: 'fractera-test-post-starter' }, node)
check('after a failed install the button sends a first install (no «again»)', calls.at(-1).join() === 'install,ord-000000000000000000000001,fractera-test-post-starter,false', calls.at(-1))
const empty = await checkout({}, node)
check('an empty cart is refused', empty.status === 400, empty)
const paidRepo = memoryRepo()
await paidRepo.addCart({ slug: 'paid-starter', name: 'Paid', price_amount: 5, price_currency: 'USD', added_at: '' })
use({ repo: paidRepo })
const pd = await checkout({}, node)
check('a paid cart: payment hidden, nothing sent', pd.status === 402 && calls.filter((c) => c[0] === 'purchase').length === 2, pd)

// The exact wire body of the core's install door (the core's contract, 2026-11-27).
{
  const seen = []
  const realFetch = globalThis.fetch
  process.env.SETTINGS_SECRET = 'k'; process.env.ARCHITECT_URL = 'http://127.0.0.1:9'; delete process.env.NODE_DOMAIN_FILE
  globalThis.fetch = async (url, init = {}) => { seen.push({ url: String(url), method: init.method ?? 'GET', body: init.body ?? null }); return new Response('{"ok":true,"state":"running"}', { status: 200 }) }
  await coreInstall('ord-9adb22acd9ead131be080c96', 'fractera-test-post-starter')
  await coreInstall('ord-9adb22acd9ead131be080c96', 'fractera-test-post-starter', true)
  await coreInstallState('ord-9adb22acd9ead131be080c96', 'fractera-test-post-starter')
  globalThis.fetch = realFetch
  check('wire: POST install {order, slug}', seen[0].method === 'POST' && seen[0].url.endsWith('/api/node/market/install') && seen[0].body === '{"order":"ord-9adb22acd9ead131be080c96","slug":"fractera-test-post-starter"}', seen[0])
  check('wire: «again» only for install again', seen[1].body === '{"order":"ord-9adb22acd9ead131be080c96","slug":"fractera-test-post-starter","again":true}', seen[1])
  check('wire: GET install?order=&slug=', seen[2].method === 'GET' && seen[2].url.endsWith('/api/node/market/install?order=ord-9adb22acd9ead131be080c96&slug=fractera-test-post-starter'), seen[2])
}

if (failures) { console.error(`===TEST_RECOMMEND_FAILED=== ${failures}`); process.exit(1) }
console.log('===TEST_RECOMMEND_OK===')
