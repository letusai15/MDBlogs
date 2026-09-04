import { bus } from '../bus/EventBus'

// OrderService is the publisher. It knows what happened — it doesn't know what to do about it.
// Sending an email? Reserving stock? Charging a card? Not its problem.
// It just says: "an order was placed." Who reacts is someone else's concern.

let orderSeq = 1

export function placeOrder(customerId: string, total: number) {
  const orderId = `ORD-${String(orderSeq++).padStart(3, '0')}`
  console.log(`\n[Order]   → placing ${orderId}  (customer: ${customerId}, total: £${total})`)

  // This one line triggers every service that subscribed to 'order.created'.
  // OrderService has no import of InventoryService, EmailService, or PaymentService.
  // It literally doesn't know they exist. That's decoupling.
  bus.emit('order.created', { orderId, customerId, total })
  return orderId
}

export function cancelOrder(orderId: string, reason: string) {
  console.log(`\n[Order]   → cancelling ${orderId}  (reason: ${reason})`)
  bus.emit('order.cancelled', { orderId, reason })
}
