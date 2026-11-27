// Samples of the marketplace doors (`npm run test:recommend`): the stage 0 «ready» on a memory repo and the stub store. Exit 1 on a miss.
import { handle } from './recommend.mjs'
import { handle as choice } from '../choice/choice.mjs'
import { handle as cart } from '../cart/cart.mjs'
import { handle as history } from '../history/history.mjs'
import { handle as list } from '../recommendations/recommendations.mjs'
import { use, checkout, purchases, reinstall } from '../../../lib/market/market.mjs'
import { memoryRepo } from '../../../lib/market/repo.mjs'
import { stubSearch as search } from '../../../lib/market/store.mjs'

const sent = []
const calls = []
const fakeCore = {
  purchase: async (slugs) => { calls.push(['purchase', slugs]); return { ok: true, state: 'paid', order: 'ord-000000000000000000000001', items: slugs.map((s) => ({ slug: s, name: s, tag: 'v0.1.0' })) } },
  order: async (id) => { calls.push(['order', id]); return { ok: true, order: id, paid: true, items: [{ slug: 'fractera-test-post-starter', name: 'Тестовый пост', tag: 'v0.1.0' }] } },
  install: async (id) => { calls.push(['install', id]); return { ok: true, state: 'installing' } },
  installState: async () => ({ ok: true, state: 'none' }),
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
check('«Покупки» shows it with its version', pu.body.purchases.length === 1 && pu.body.purchases[0].version === 'v0.1.0', pu.body)
const again = await cart({ action: 'add', starter: 'fractera-test-post-starter' }, node)
check('a bought starter does not go to the cart again', again.status === 404 || again.status === 409, again)
const ri = await reinstall({ starter: 'fractera-test-post-starter' }, node)
check('install again: no purchase, same order', ri.status === 200 && calls.at(-1)[0] === 'install' && calls.filter((c) => c[0] === 'purchase').length === 1, calls)
// The core answers «already-ordered» for a starter this project ordered before: the old order is taken, no second payment.
const r3 = await handle({ element: 'blog', task: 'картинка' }, node)
const imgRow = r3.body.rows.find((r) => r.name === 'Тестовая картинка')
await choice({ row: imgRow.id, action: 'cart' }, node)
fakeCore.purchase = async (slugs) => { calls.push(['purchase', slugs]); return { ok: true, state: 'already-ordered', items: slugs.map((s) => ({ slug: s, order: 'ord-000000000000000000000002' })) } }
fakeCore.order = async (id) => { calls.push(['order', id]); return { ok: true, order: id, paid: true, items: [{ slug: 'fractera-test-image-starter', name: 'Тестовая картинка', tag: 'v0.1.0' }] } }
const ao = await checkout({}, node)
const pu2 = await purchases({}, node)
check('«already-ordered» → the old order is recorded and installed', ao.status === 200 && ao.body.orders[0] === 'ord-000000000000000000000002' && pu2.body.purchases.length === 2 && calls.at(-1)[0] === 'install', { ao, calls })
const empty = await checkout({}, node)
check('an empty cart is refused', empty.status === 400, empty)
const paidRepo = memoryRepo()
await paidRepo.addCart({ slug: 'paid-starter', name: 'Paid', price_amount: 5, price_currency: 'USD', added_at: '' })
use({ repo: paidRepo })
const pd = await checkout({}, node)
check('a paid cart: payment hidden, nothing sent', pd.status === 402 && calls.filter((c) => c[0] === 'purchase').length === 2, pd)

if (failures) { console.error(`===TEST_RECOMMEND_FAILED=== ${failures}`); process.exit(1) }
console.log('===TEST_RECOMMEND_OK===')
