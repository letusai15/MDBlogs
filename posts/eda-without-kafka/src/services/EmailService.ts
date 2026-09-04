import { bus } from '../bus/EventBus'

// EmailService reacts to three different events — none of which it caused.
// It doesn't call OrderService to ask "did an order just happen?"
// It waits, and the bus delivers. That's the whole model.

bus.on('order.created', ({ orderId, customerId, total }) => {
  // Order confirmation email — most important one, goes out immediately.
  console.log(`[Email]       sending confirmation to ${customerId} — ${orderId} (£${total})`)
})

bus.on('order.cancelled', ({ orderId, reason }) => {
  // Let the customer know their order was cancelled, and why.
  console.log(`[Email]       sending cancellation notice for ${orderId} — "${reason}"`)
})

bus.on('payment.failed', ({ orderId, errorCode }) => {
  // Payment failure is sensitive. The customer needs to know and act fast.
  // Notice that EmailService doesn't import PaymentService.
  // It just subscribes to what happened, and reacts.
  console.log(`[Email]       alerting customer — payment failed for ${orderId} (${errorCode})`)
})
