import { bus } from '../bus/EventBus'

// Email has no idea InventoryService or PaymentService exist
bus.on('order.created', ({ orderId, customerId, total }) => {
  console.log(`[Email]       sending confirmation to ${customerId} — ${orderId} (£${total})`)
})

bus.on('order.cancelled', ({ orderId, reason }) => {
  console.log(`[Email]       sending cancellation notice for ${orderId} — "${reason}"`)
})

bus.on('payment.failed', ({ orderId, errorCode }) => {
  console.log(`[Email]       alerting customer — payment failed for ${orderId} (${errorCode})`)
})
