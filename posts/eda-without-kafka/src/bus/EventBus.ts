// Pattern 1 — typed in-process event bus (matches the blog post exactly)

type EventMap = {
  'order.created':   { orderId: string; customerId: string; total: number }
  'order.cancelled': { orderId: string; reason: string }
  'payment.failed':  { orderId: string; errorCode: string }
  'payment.ok':      { orderId: string }
}

class EventBus {
  private handlers = new Map<string, Set<(payload: unknown) => void>>()

  on<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event)!.add(handler as (payload: unknown) => void)
    // Returns an unsubscribe function — no memory leaks in short-lived contexts
    return () => this.handlers.get(event)?.delete(handler as (payload: unknown) => void)
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    this.handlers.get(event)?.forEach(h => h(payload))
  }
}

export const bus = new EventBus()
export type { EventMap }
