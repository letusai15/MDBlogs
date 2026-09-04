import { bus } from '../bus/EventBus'

let orderSeq = 1

export function placeOrder(customerId: string, total: number) {
  const orderId = `ORD-${String(orderSeq++).padStart(3, '0')}`
  console.log(`\n[Order]   → placing ${orderId}  (customer: ${customerId}, total: £${total})`)
  bus.emit('order.created', { orderId, customerId, total })
  return orderId
}

export function cancelOrder(orderId: string, reason: string) {
  console.log(`\n[Order]   → cancelling ${orderId}  (reason: ${reason})`)
  bus.emit('order.cancelled', { orderId, reason })
}
