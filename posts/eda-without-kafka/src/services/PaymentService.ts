import { bus } from '../bus/EventBus'

// PaymentService is interesting because it's both a subscriber AND a publisher.
// It listens to 'order.created', processes the payment, then emits its own event.
// This is how you chain steps in EDA without any service directly calling another.

bus.on('order.created', ({ orderId, total }) => {
  // In a real system this would hit a payment gateway.
  // Here we use a simple rule: orders over £500 fail. Makes the demo easy to follow.
  if (total > 500) {
    console.log(`[Payment]     FAILED for ${orderId} — amount £${total} exceeds limit`)

    // We emit 'payment.failed'. FulfillmentService and EmailService will both react.
    // PaymentService doesn't call them. It just broadcasts what happened.
    bus.emit('payment.failed', { orderId, errorCode: 'LIMIT_EXCEEDED' })
  } else {
    console.log(`[Payment]     authorised for ${orderId}`)
    bus.emit('payment.ok', { orderId })
  }
})
