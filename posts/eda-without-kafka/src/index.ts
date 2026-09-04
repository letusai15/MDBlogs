// Boot all services (registering their bus.on() subscriptions)
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
console.log('  Blog post: monalisadas-knowme.vercel.app')
console.log('═══════════════════════════════════════════════════════════════')

console.log('\n─── Pattern 1: In-process typed EventBus ─────────────────────\n')
console.log('Five independent services. Zero direct calls between them.\n')

placeOrder('alice',   120)   // payment ok   → dispatched
placeOrder('bob',     750)   // payment fail → cancelled + email alert
placeOrder('carol',   299)   // payment ok   → dispatched
cancelOrder('ORD-002', 'customer requested cancellation')

printStats()

runOutboxDemo()

console.log('\n═══════════════════════════════════════════════════════════════')
console.log('  Try it: add a new bus.on() in any service file.')
console.log('  The other services do not change at all.')
console.log('═══════════════════════════════════════════════════════════════\n')
