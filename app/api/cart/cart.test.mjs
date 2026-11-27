// Samples of the door cart (`npm run test:cart`): the whole flow lives in recommend.test.mjs; here — the refused input.
import { handle } from './cart.mjs'
import { use } from '../../../lib/market/market.mjs'
import { memoryRepo } from '../../../lib/market/repo.mjs'

use({ repo: memoryRepo() })
const got = await handle({ action: 'nonsense', row: '' }, { kind: 'node' })
const ok = ['choice', 'cart'].includes('cart') ? got.status === 400 : got.status === 200
console.log(`${ok ? 'ok  ' : 'FAIL'} cart answers ${got.status}`)
if (!ok) { console.error('===TEST_CART_FAILED=== 1'); process.exit(1) }
console.log('===TEST_CART_OK===')
