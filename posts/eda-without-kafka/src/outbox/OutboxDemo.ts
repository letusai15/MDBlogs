import { appendEvent, pollUnprocessed, markProcessed } from './EventStore'

// The outbox pattern solves a specific problem: what if the service crashes
// after the domain write but before it publishes the event?
// The in-process bus from Pattern 1 can't help you there — it's in memory.
//
// The fix: write the event to the database in the same transaction as your domain change.
// If the transaction commits, the event exists. If it rolls back, the event never existed.
// A separate background process then picks up unprocessed events and handles them.
// This is the outbox pattern — and you already have the infrastructure: your existing DB.

// Simulates createOrder() — domain change + event in one "transaction"
function createOrder(orderId: string, customerId: string, total: number) {
  console.log(`  [DB write]  INSERT INTO orders ... and INSERT INTO events ... in one transaction`)

  // In real code, both of these are inside a db.transaction(async (trx) => { ... }) block.
  // Here they're sequential calls to our in-memory store — same logic, no DB needed to run.
  appendEvent('order.created', { orderId, customerId, total })
  appendEvent('payment.requested', { orderId, amount: total })
}

// Simulates the background consumer — runs on a cron job or setInterval in production.
// It polls for rows that haven't been processed yet, handles each one, then marks it done.
function processEvents() {
  const events = pollUnprocessed(20)
  if (events.length === 0) {
    console.log(`  [Consumer]  nothing to process — all caught up`)
    return
  }

  for (const ev of events) {
    console.log(`  [Consumer]  handling "${ev.type}" (id=${ev.id})  →  ${JSON.stringify(ev.payload)}`)
    if (ev.type === 'order.created')     handleOrderCreated(ev.payload)
    if (ev.type === 'payment.requested') handlePaymentRequested(ev.payload)

    // Mark processed immediately after handling.
    // In real code you'd wrap this in a try/catch — if the handler throws,
    // don't mark it done. Let the next poll retry it.
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

  console.log('Step 1 — two orders placed; events written atomically with the domain change:\n')
  createOrder('ORD-A1', 'alice', 120)
  createOrder('ORD-B2', 'bob',   340)

  console.log('\nStep 2 — background consumer picks them up and processes:\n')
  processEvents()

  console.log('\nStep 3 — consumer runs again, finds nothing (all events are done):\n')
  processEvents()
}
