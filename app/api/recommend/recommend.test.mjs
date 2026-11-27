// Samples of the marketplace doors (`npm run test:recommend`): the stage 0 «ready» on a memory repo and the stub store. Exit 1 on a miss.
import { handle } from './recommend.mjs'
import { handle as choice } from '../choice/choice.mjs'
import { handle as cart } from '../cart/cart.mjs'
import { handle as history } from '../history/history.mjs'
import { handle as list } from '../recommendations/recommendations.mjs'
import { use } from '../../../lib/market/market.mjs'
import { memoryRepo } from '../../../lib/market/repo.mjs'
import { search } from '../../../lib/market/store.mjs'

const sent = []
use({ repo: memoryRepo(), search: async (e) => { sent.push(e); return search(e) } })
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

if (failures) { console.error(`===TEST_RECOMMEND_FAILED=== ${failures}`); process.exit(1) }
console.log('===TEST_RECOMMEND_OK===')
