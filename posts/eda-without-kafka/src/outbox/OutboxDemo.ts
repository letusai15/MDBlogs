import { appendEvent, pollUnprocessed, markProcessed } from './EventStore'

// Simulates createOrder() — domain write + event in one "transaction"
function createOrder(orderId: string, customerId: string, total: number) {
  console.log(`  [DB write]  INSERT orders + INSERT events in one transaction`)
  // In real code: both writes are inside trx.transaction(async (trx) => { ... })
  appendEvent('order.created', { orderId, customerId, total })
  appendEvent('payment.requested', { orderId, amount: total })
}

// Simulates the background consumer process (runs on a cron / setInterval)
function processEvents() {
  const events = pollUnprocessed(20)
  if (events.length === 0) { console.log(`  [Consumer]  nothing to process`); return }

  for (const ev of events) {
    console.log(`  [Consumer]  handling ${ev.type} (id=${ev.id})  payload: ${JSON.stringify(ev.payload)}`)
    // Dispatch to the right handler
    if (ev.type === 'order.created')     handleOrderCreated(ev.payload)
    if (ev.type === 'payment.requested') handlePaymentRequested(ev.payload)
    markProcessed(ev.id)
  }
}

function handleOrderCreated(payload: Record<string, unknown>) {
  console.log(`  [Handler]   → notify warehouse for order ${payload.orderId}`)
}

function handlePaymentRequested(payload: Record<string, unknown>) {
  console.log(`  [Handler]   → charge card £${payload.amount} for order ${payload.orderId}`)
}

export function runOutboxDemo() {
  console.log('\n─── Pattern 2: Postgres outbox ───────────────────────────────\n')
  console.log('Step 1 — service writes domain change + event atomically:\n')
  createOrder('ORD-A1', 'alice', 120)
  createOrder('ORD-B2', 'bob', 340)

  console.log('\nStep 2 — background consumer polls and processes:\n')
  processEvents()

  console.log('\nStep 3 — poll again (nothing left):\n')
  processEvents()
}
