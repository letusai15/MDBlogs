import { bus } from '../bus/EventBus'

// Analytics is a great example of why EDA shines.
// You add this service after the fact — without touching any existing service.
// In a traditional design you'd have to go back into OrderService and PaymentService
// and add analytics calls manually. With EDA, you just subscribe and you're in.

const stats = { orders: 0, revenue: 0, failed: 0 }

bus.on('order.created', ({ total }) => {
  // Count every order and accumulate revenue in memory.
  // In production you'd write this to a DB or push to a metrics system.
  stats.orders++
  stats.revenue += total
})

bus.on('payment.failed', () => {
  // Track failures — useful for spotting patterns (fraud, UX issues, pricing problems).
  stats.failed++
})

// Call this at the end to see the summary.
// In a real system this might be a scheduled report or a dashboard query.
export function printStats() {
  console.log(
    `\n[Analytics]   summary: ${stats.orders} orders | £${stats.revenue} revenue | ${stats.failed} payment failure(s)`
  )
}
