import { bus } from '../bus/EventBus'

// InventoryService cares about orders and cancellations.
// It has no idea EmailService or PaymentService exist.
// Open this file. There's not a single import of another service. That's what we're after.

bus.on('order.created', ({ orderId }) => {
  // When an order comes in, we reserve stock.
  // We don't wait for payment confirmation — that's a business decision.
  // In your system, you might reverse this. The pattern doesn't dictate the logic.
  console.log(`[Inventory]   reserving stock for ${orderId}`)
})

bus.on('order.cancelled', ({ orderId }) => {
  // If the order is cancelled, we release whatever we held.
  console.log(`[Inventory]   releasing stock for ${orderId}`)
})
