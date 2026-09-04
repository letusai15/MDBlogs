import { bus } from '../bus/EventBus'

// FulfillmentService only cares about payment outcomes.
// It never sees the order directly — it waits for PaymentService to report back.
// This means you could swap out your payment provider entirely
// and FulfillmentService wouldn't change a single line.

bus.on('payment.ok', ({ orderId }) => {
  // Payment went through — time to dispatch.
  console.log(`[Fulfillment] dispatching ${orderId} 🚚`)
})

bus.on('payment.failed', ({ orderId }) => {
  // No payment, no dispatch. Simple.
  // Note: EmailService also handles 'payment.failed' and sends an alert.
  // Neither service coordinates with the other — the bus handles fan-out.
  console.log(`[Fulfillment] cancelling ${orderId} — payment not received`)
})
