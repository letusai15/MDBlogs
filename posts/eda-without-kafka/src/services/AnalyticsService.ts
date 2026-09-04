import { bus } from '../bus/EventBus'

const stats = { orders: 0, revenue: 0, failed: 0 }

bus.on('order.created', ({ total }) => {
  stats.orders++
  stats.revenue += total
})

bus.on('payment.failed', () => {
  stats.failed++
})

export function printStats() {
  console.log(`\n[Analytics]   summary: ${stats.orders} orders | £${stats.revenue} revenue | ${stats.failed} payment failure(s)`)
}
