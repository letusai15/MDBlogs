import { bus } from '../bus/EventBus'

// Inventory has no idea EmailService or AnalyticsService exist
bus.on('order.created', ({ orderId }) => {
  console.log(`[Inventory]   reserving stock for ${orderId}`)
})

bus.on('order.cancelled', ({ orderId }) => {
  console.log(`[Inventory]   releasing stock for ${orderId}`)
})
