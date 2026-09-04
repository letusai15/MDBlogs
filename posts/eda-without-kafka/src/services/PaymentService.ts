import { bus } from '../bus/EventBus'

bus.on('order.created', ({ orderId, total }) => {
  // Orders over £500 fail in this demo
  if (total > 500) {
    console.log(`[Payment]     FAILED for ${orderId} — amount £${total} exceeds limit`)
    bus.emit('payment.failed', { orderId, errorCode: 'LIMIT_EXCEEDED' })
  } else {
    console.log(`[Payment]     authorised for ${orderId}`)
    bus.emit('payment.ok', { orderId })
  }
})
