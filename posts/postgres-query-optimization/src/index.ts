/**
 * PostgreSQL Query Optimization — simulation
 *
 * Run: npx tsx src/index.ts
 *
 * Simulates a seq scan vs index scan vs CTE rewrite timing difference
 * without needing a real database. Data sizes mirror the original scenario:
 * 10M orders, 500k users, 5k recent users (last 90 days).
 */

// ── Simulated data ────────────────────────────────────────────────────────────

const TOTAL_USERS   = 500_000
const TOTAL_ORDERS  = 10_000_000
const RECENT_CUTOFF = 90 // days

// Build a compact in-memory dataset
const recentUserIds = new Set<number>()
for (let i = 0; i < 5_000; i++) recentUserIds.add(i)

// Orders: spread across all users, but most belong to non-recent users
const orders: Array<{ userId: number; totalCents: number; status: string }> = []
for (let i = 0; i < TOTAL_ORDERS; i++) {
  // Distribute: ~1% of orders belong to recent users
  const userId = Math.random() < 0.01 ? Math.floor(Math.random() * 5000) : Math.floor(Math.random() * TOTAL_USERS) + 5000
  orders.push({ userId, totalCents: Math.floor(Math.random() * 10000), status: Math.random() < 0.3 ? 'cancelled' : 'active' })
}

console.log(`Dataset: ${TOTAL_USERS.toLocaleString()} users, ${TOTAL_ORDERS.toLocaleString()} orders, ${recentUserIds.size.toLocaleString()} recent users\n`)

// ── Simulation 1: Seq scan (no index) ────────────────────────────────────────

function seqScan() {
  // Simulates: Seq Scan on orders — read every row, filter in memory
  const result: Record<number, { count: number; value: number }> = {}
  for (const o of orders) {
    if (recentUserIds.has(o.userId)) {
      if (!result[o.userId]) result[o.userId] = { count: 0, value: 0 }
      result[o.userId].count++
      result[o.userId].value += o.totalCents
    }
  }
  return result
}

// ── Simulation 2: Index scan (hash map lookup) ────────────────────────────────

// Pre-build: simulates CREATE INDEX CONCURRENTLY on orders(user_id)
const orderIndex = new Map<number, Array<{ totalCents: number }>>()
for (const o of orders) {
  if (!orderIndex.has(o.userId)) orderIndex.set(o.userId, [])
  orderIndex.get(o.userId)!.push({ totalCents: o.totalCents })
}

function indexScan() {
  // Simulates: Index Scan on idx_orders_user_id — only touch rows we need
  const result: Record<number, { count: number; value: number }> = {}
  for (const userId of recentUserIds) {
    const userOrders = orderIndex.get(userId) ?? []
    result[userId] = {
      count: userOrders.length,
      value: userOrders.reduce((s, o) => s + o.totalCents, 0),
    }
  }
  return result
}

// ── Simulation 3: CTE with materialization ────────────────────────────────────

function cteWithMaterialization() {
  // CTE 1 (MATERIALIZED): filter recent users once — 5k rows instead of 500k
  const recentUsers = Array.from(recentUserIds)

  // CTE 2 (MATERIALIZED): aggregate orders for just those users
  const orderStats = new Map<number, { count: number; value: number }>()
  for (const userId of recentUsers) {
    const userOrders = orderIndex.get(userId) ?? []
    orderStats.set(userId, {
      count: userOrders.length,
      value: userOrders.reduce((s, o) => s + o.totalCents, 0),
    })
  }

  // Final join: small set on both sides
  return recentUsers
    .map(id => ({ id, ...(orderStats.get(id) ?? { count: 0, value: 0 }) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 100)
}

// ── Run and time each approach ─────────────────────────────────────────────────

function time<T>(label: string, fn: () => T): T {
  const start = performance.now()
  const result = fn()
  const ms = (performance.now() - start).toFixed(1)
  console.log(`${label}: ${ms}ms`)
  return result
}

const r1 = time('Seq scan (no index)', seqScan)
const r2 = time('Index scan          ', indexScan)
const r3 = time('CTE + materialized  ', cteWithMaterialization)

// Verify all three return the same top result
const topUserId = r3[0].id
const seqVal    = r1[topUserId]?.value ?? 0
const idxVal    = r2[topUserId]?.value ?? 0
const cteVal    = r3[0].value
console.log(`\nTop user consistent: ${seqVal === idxVal && idxVal === cteVal ? 'YES' : 'NO (results diverged)'}`)
console.log('\nKey insight:')
console.log('  Seq scan touches every row regardless of what you need.')
console.log('  Index scan jumps straight to matching rows.')
console.log('  MATERIALIZED CTE pre-filters before the join -- less data on both sides.')
