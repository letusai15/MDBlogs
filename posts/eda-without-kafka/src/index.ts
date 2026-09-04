import { bus } from './EventBus'

// ── Domain events ────────────────────────────────────────────────────────────
interface OrderPlaced    { orderId: string; amount: number; customer: string }
interface PaymentProcessed { orderId: string; status: 'ok' | 'failed' }

// ── Subscribers (independent, no knowledge of each other) ────────────────────
bus.on<OrderPlaced>('order.placed', async ({ orderId, customer }) => {
  console.log(`[Inventory]   reserving stock for order ${orderId}`)
})

bus.on<OrderPlaced>('order.placed', async ({ orderId, amount, customer }) => {
  console.log(`[Email]       sending confirmation to ${customer} for £${amount}`)
})

bus.on<PaymentProcessed>('payment.processed', async ({ orderId, status }) => {
  if (status === 'ok') {
    console.log(`[Fulfillment] dispatching order ${orderId}`)
  } else {
    console.log(`[Fulfillment] cancelling order ${orderId} — payment failed`)
  }
})

// ── Producer (knows only about events, not subscribers) ──────────────────────
async function placeOrder(customer: string, amount: number) {
  const orderId = `ORD-${Date.now()}`
  console.log(`\n→ Placing order: ${orderId} (${customer}, £${amount})`)
  await bus.emit<OrderPlaced>('order.placed', { orderId, amount, customer })

  // Payments over £500 fail in this demo
  const status: 'ok' | 'failed' = amount < 500 ? 'ok' : 'failed'
  console.log(`→ Payment ${status}: ${orderId}`)
  await bus.emit<PaymentProcessed>('payment.processed', { orderId, status })
}

// ── Run the demo ─────────────────────────────────────────────────────────────
;(async () => {
  console.log('=== EDA without Kafka — in-process EventBus demo ===\n')
  console.log('Three independent subscribers listen to the same events.')
  console.log('The producer knows nothing about who is listening.\n')

  await placeOrder('Alice', 120)   // succeeds
  await placeOrder('Bob',   750)   // payment fails

  console.log('\n=== Done. Try adding a new subscriber in EventBus.ts! ===')
})()
