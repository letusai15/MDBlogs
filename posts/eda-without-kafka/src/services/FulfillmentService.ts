import { bus } from '../bus/EventBus'

bus.on('payment.ok', ({ orderId }) => {
  console.log(`[Fulfillment] dispatching ${orderId} 🚚`)
})

bus.on('payment.failed', ({ orderId }) => {
  console.log(`[Fulfillment] cancelling ${orderId} — payment not received`)
})
