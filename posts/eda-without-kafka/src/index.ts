// Boot order matters here — services need to register their bus.on() subscriptions
// before any events are emitted. Import them first, then start firing events.
import './services/InventoryService'
import './services/EmailService'
import './services/PaymentService'
import './services/FulfillmentService'
import './services/AnalyticsService'

import { placeOrder, cancelOrder } from './services/OrderService'
import { printStats }             from './services/AnalyticsService'
import { runOutboxDemo }          from './outbox/OutboxDemo'

console.log('═══════════════════════════════════════════════════════════════')
console.log('  EDA without Kafka — two patterns in action')
console.log('  Read the post: monalisadas-knowme.vercel.app')
console.log('═══════════════════════════════════════════════════════════════')

// ── Pattern 1: In-process EventBus ──────────────────────────────────────────
// Five services, zero direct calls between them.
// Watch the output — one bus.emit() in OrderService triggers everything below it.

console.log('\n─── Pattern 1: In-process typed EventBus ─────────────────────\n')
console.log('Five independent services. Zero direct calls between them.\n')

placeOrder('alice', 120)    // payment ok   → dispatched
placeOrder('bob',   750)    // payment fail → email alert + fulfillment cancels
placeOrder('carol', 299)    // payment ok   → dispatched
cancelOrder('ORD-002', 'customer requested cancellation')

// AnalyticsService has been listening the whole time — just counting quietly.
printStats()

// ── Pattern 2: Postgres outbox ──────────────────────────────────────────────
// Same events, but now they survive a process crash.
// The domain write and event write are atomic — one transaction, all-or-nothing.
runOutboxDemo()

console.log('\n═══════════════════════════════════════════════════════════════')
console.log('  Your turn: add a new bus.on() in any service file.')
console.log('  None of the other services need to change.')
console.log('  That\'s the whole point.')
console.log('═══════════════════════════════════════════════════════════════\n')
