// Samples of the marketplace doors (`npm run test:recommend`): the stage 0 «ready» on a memory repo and the stub store. Exit 1 on a miss.
import { handle } from './recommend.mjs'
import { handle as choice } from '../choice/choice.mjs'
import { handle as cart } from '../cart/cart.mjs'
import { handle as history } from '../history/history.mjs'
import { handle as list } from '../recommendations/recommendations.mjs'
import { use, checkout, purchases, reinstall, confirmPayment, cart as cartOf } from '../../../lib/market/market.mjs'
import { memoryRepo } from '../../../lib/market/repo.mjs'
import { stubSearch as search, install as coreInstall, installState as coreInstallState, purchase as corePurchase } from '../../../lib/market/store.mjs'

const sent = []
const calls = []
const fakeCore = {
  purchase: async (slugs) => { calls.push(['purchase', slugs]); return { ok: true, state: 'paid', order: 'ord-000000000000000000000001', items: slugs.map((s) => ({ slug: s, name: s, tag: 'v0.1.0' })) } },
  order: async (id) => { calls.push(['order', id]); return { ok: true, order: id, paid: true, items: [{ slug: 'fractera-test-post-starter', name: 'Тестовый пост', tag: 'v0.1.0' }] } },
  install: async (id, slug, again) => { calls.push(['install', id, slug, again]); return { ok: true, state: 'running' } },
  installState: async (id, slug) => { calls.push(['state', id, slug]); return { ok: true, state: 'installed', element: { id: 'test-post', address: 'https://test-post.example.org' } } },
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
const nc = await checkout({}, node)
check('no consent ticked → 400, nothing sent to the core', nc.status === 400 && nc.body.error === 'consent_required' && !calls.some((c) => c[0] === 'purchase'), nc)
const g = await checkout({ consent: true }, node)
check('a free cart → paid, installed, order kept', g.status === 200 && g.body.state === 'paid' && calls.map((c) => c[0]).join() === 'purchase,order,install', { g, calls })
const pu = await purchases({}, node)
check('install sent the order and the starter, not «again»', calls.find((c) => c[0] === 'install')?.slice(1).join() === 'ord-000000000000000000000001,fractera-test-post-starter,false', calls)
check('«Купленные» shows it with its version; a running install is asked once and settles «installed» with its element and address', pu.body.purchases.length === 1 && pu.body.purchases[0].version === 'v0.1.0' && pu.body.purchases[0].install.state === 'installed' && pu.body.purchases[0].install.element?.id === 'test-post' && pu.body.purchases[0].install.element?.address === 'https://test-post.example.org', pu.body)
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
const ao = await checkout({ consent: true }, node)
const pu2 = await purchases({}, node)
check('«already-ordered» → the old order is recorded and installed', ao.status === 200 && ao.body.orders[0] === 'ord-000000000000000000000002' && pu2.body.purchases.length === 2 && calls.some((c) => c.join() === 'install,ord-000000000000000000000002,fractera-test-image-starter,false'), { ao, calls })
fakeCore.install = async (id, slug, again) => { calls.push(['install', id, slug, again]); return { ok: false, reason: 'the starter is not in this order' } }
await reinstall({ starter: 'fractera-test-post-starter' }, node)
fakeCore.install = async (id, slug, again) => { calls.push(['install', id, slug, again]); return { ok: true, state: 'running' } }
await reinstall({ starter: 'fractera-test-post-starter' }, node)
check('after a failed install the button sends a first install (no «again»)', calls.at(-1).join() === 'install,ord-000000000000000000000001,fractera-test-post-starter,false', calls.at(-1))
fakeCore.install = async () => ({ ok: false, reason: 'this order is already installed here: mpso1' })
await reinstall({ starter: 'fractera-test-post-starter' }, node) // stored as «failed» with the core's English reason
fakeCore.installState = async (id, slug) => { calls.push(['state', id, slug]); return { ok: true, state: 'installed', element: 'mpso1' } }
const pu3 = await purchases({}, node)
const was = pu3.body.purchases.find((x) => x.starter === 'fractera-test-post-starter')
check('a failed purchase is asked again on read and turns «installed» with its element', was.install.state === 'installed' && was.install.element?.id === 'mpso1' && was.install.reason === null && calls.at(-1).join() === 'state,ord-000000000000000000000001,fractera-test-post-starter', was)
fakeCore.install = async (id, slug, again) => { calls.push(['install', id, slug, again]); return { ok: true, state: 'running' } }
const empty = await checkout({ consent: true }, node)
check('an empty cart is refused', empty.status === 400, empty)
// Step 6 — a priced cart: the core opens the payer's window, the cart waits locked, nothing installed; the payer's «Готово» → the check.
{
  const paidRepo = memoryRepo()
  await paidRepo.addCart({ slug: 'paid-starter', name: 'Paid', price_amount: 1, price_currency: 'USD', added_at: '' })
  const ORD = 'ord-0000000000000000000000aa'
  let paid = false
  const coreOrders = []
  const pc = []
  use({ repo: paidRepo, core: {
    purchase: async (slugs, lang) => { pc.push(['purchase', slugs, lang]); coreOrders.unshift({ order: ORD, at: '', paid: false, total: { amount: 1, currency: 'USD' }, items: [{ slug: 'paid-starter', name: 'Paid', tag: 'v1.0.0' }], by: 'market' }); return { ok: true, state: 'awaiting-payer', order: ORD, items: [{ slug: 'paid-starter', name: 'Paid', tag: 'v1.0.0' }], total: { amount: 1, currency: 'USD' }, window: 'w-1' } },
    order: async (id) => { pc.push(['order', id]); return id === ORD ? { ok: true, order: id, paid, items: [{ slug: 'paid-starter', name: 'Paid', tag: 'v1.0.0' }] } : { ok: false, status: 404, reason: 'unknown order' } },
    orders: async () => ({ ok: true, orders: coreOrders.map((o) => ({ ...o, paid })) }),
    install: async (id, slug, again) => { pc.push(['install', id, slug, again]); return { ok: true, state: 'running' } },
    installState: async () => ({ ok: true, state: 'running' }),
  } })
  const aw = await checkout({ consent: true, lang: 'ru' }, node)
  check('a priced cart → awaiting-payer with the order and the total; nothing installed', aw.status === 202 && aw.body.state === 'awaiting-payer' && aw.body.order === ORD && aw.body.total.amount === 1 && !pc.some((c) => c[0] === 'install'), { aw, pc })
  const c1 = await cartOf({}, node)
  check('the cart reads «awaiting» with its lines locked', c1.body.awaiting?.order === ORD && c1.body.lines[0].locked === true, c1.body)
  const rm = await cartOf({ action: 'remove', starter: 'paid-starter' }, node)
  check('a locked cart refuses a change', rm.status === 409, rm)
  const twice = await checkout({ consent: true }, node)
  check('no second purchase while the order waits', twice.status === 409 && pc.filter((c) => c[0] === 'purchase').length === 1, twice)
  const no = await confirmPayment({ order: ORD }, node)
  const c2 = await cartOf({}, node)
  check('the check, not paid → «unpaid», the cart unlocks, the line stays, the order kept', no.body.state === 'unpaid' && c2.body.awaiting === null && c2.body.unpaid?.order === ORD && c2.body.lines.length === 1 && !c2.body.lines[0].locked, { no, c2: c2.body })
  const bad = await confirmPayment({ order: 'nope' }, node)
  const unknown = await confirmPayment({ order: 'ord-0000000000000000000000bb' }, node)
  check('a bad order id → 400, an unknown one → 404', bad.status === 400 && unknown.status === 404, { bad, unknown })
  await checkout({ consent: true }, node) // the person pays again from the unlocked cart: the same order comes back
  paid = true
  const ok = await confirmPayment({ order: ORD }, node)
  const pu6 = await purchases({}, node)
  const c3 = await cartOf({}, node)
  check('the check, paid → «Купленные» with its version, the install started, the cart empty', ok.body.state === 'paid' && pu6.body.purchases.some((x) => x.starter === 'paid-starter' && x.version === 'v1.0.0') && pc.some((c) => c.join() === `install,${ORD},paid-starter,false`) && c3.body.lines.length === 0 && c3.body.awaiting === null, { ok, pu6: pu6.body, c3: c3.body })

  // After a reload: a paid order the page never settled (the payer paid, nobody pressed) is read from the core's orders.
  const freshRepo = memoryRepo()
  use({ repo: freshRepo })
  const pu7 = await purchases({}, node)
  check('a reload reads the core\'s orders: the paid order appears in «Купленные», no install started by itself', pu7.body.purchases.some((x) => x.starter === 'paid-starter') && pc.filter((c) => c[0] === 'install').length === 1, { pu7: pu7.body, pc })
}

// The exact wire body of the core's purchase door (862-15).
{
  const seen = []
  const realFetch = globalThis.fetch
  process.env.SETTINGS_SECRET = 'k'; process.env.ARCHITECT_URL = 'http://127.0.0.1:9'; delete process.env.NODE_DOMAIN_FILE
  globalThis.fetch = async (url, init = {}) => { seen.push({ url: String(url), method: init.method ?? 'GET', body: init.body ?? null }); return new Response('{"ok":true,"state":"awaiting-payer"}', { status: 200 }) }
  await corePurchase(['a-starter'], 'ru')
  globalThis.fetch = realFetch
  check('wire: POST purchase {cart:[{slug}], consent, lang}', seen[0].method === 'POST' && seen[0].url.endsWith('/api/node/market/purchase') && seen[0].body === '{"cart":[{"slug":"a-starter"}],"consent":{"immediateDelivery":true,"noRefund":true},"lang":"ru"}', seen[0])
}

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
