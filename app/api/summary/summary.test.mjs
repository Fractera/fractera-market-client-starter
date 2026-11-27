// Samples of the door summary (`npm run test:summary`): exit code 1 on any miss.
import { handle } from './summary.mjs'
import { use } from '../../../lib/market/market.mjs'
import { memoryRepo } from '../../../lib/market/repo.mjs'

const repo = memoryRepo()
const row = (id, element, slug, status) => ({ id, task: `task ${element}`, element, slug, name: slug, source: 'fractera', simulated: false, page: null,
  description: null, price_amount: 0, price_currency: 'USD', usefulness: 0.5, why: '{}', bought: false, status, created_at: '', updated_at: '', author: 'Fractera' })
await repo.putRow(row('1', 'blog', 'post', 'waiting'))
await repo.putRow(row('2', 'blog', 'image', 'cart'))
await repo.putRow(row('3', 'shop', 'post', 'waiting'))
await repo.putRow(row('4', 'shop', 'old', 'deleted'))
await repo.addCart({ slug: 'image', name: 'image', price_amount: 3, price_currency: 'USD', added_at: '' })
await repo.putPurchase({ slug: 'a', name: 'a', tag: 'v1', author: 'Fractera', page: null, order_id: 'o1', at: '', install_state: 'installed', install_reason: null })
await repo.putPurchase({ slug: 'b', name: 'b', tag: 'v1', author: 'Fractera', page: null, order_id: 'o2', at: '', install_state: 'failed', install_reason: 'x' })
use({ repo })

let failures = 0
const expect = async (label, input, caller, want) => {
  const got = await handle(input, caller)
  const ok = JSON.stringify(got) === JSON.stringify(want)
  if (!ok) failures++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : `\n     got  ${JSON.stringify(got)}\n     want ${JSON.stringify(want)}`}`)
}
const node = { kind: 'node' }

await expect('the node: the whole project, a deleted row not counted', {}, node, { status: 200, body: {
  waiting: 2, cart: { lines: 1, total: { amount: 3, currency: 'USD' } }, bought: { all: 2, notInstalled: 1 },
  pages: { recommendations: '/ru/admin/recommendations', cart: '/ru/admin/cart', bought: '/ru/admin/purchases' } } })
await expect('?element=blog narrows to its tasks', { element: 'blog' }, node, { status: 200, body: {
  element: 'blog', found: 2, waiting: 1, inCart: 1,
  pages: { recommendations: '/ru/admin/recommendations?element=blog', cart: '/ru/admin/cart', bought: '/ru/admin/purchases' } } })
await expect('a neighbour gets its own counts, its id from the key', {}, { kind: 'element', id: 'shop' }, { status: 200, body: {
  element: 'shop', found: 1, waiting: 1, inCart: 0,
  pages: { recommendations: '/ru/admin/recommendations?element=shop', cart: '/ru/admin/cart', bought: '/ru/admin/purchases' } } })
await expect('a neighbour asking for another element is refused', { element: 'blog' }, { kind: 'element', id: 'shop' },
  { status: 403, body: { error: 'not_yours', reason: 'an element sees its own counts only' } })

if (failures) { console.error(`===TEST_SUMMARY_FAILED=== ${failures}`); process.exit(1) }
console.log('===TEST_SUMMARY_OK===')
