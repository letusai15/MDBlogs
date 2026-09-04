// This is the core of the whole pattern — and it's about 20 lines.
// That's the point. EDA doesn't require a platform. It requires a contract.

// EventMap is where we define what events exist and what shape their data has.
// If you add an event here, TypeScript will tell you everywhere you forgot to handle it.
// If you emit the wrong data, it won't compile. That's the safety net.
type EventMap = {
  'order.created':   { orderId: string; customerId: string; total: number }
  'order.cancelled': { orderId: string; reason: string }
  'payment.failed':  { orderId: string; errorCode: string }
  'payment.ok':      { orderId: string }
}

class EventBus {
  // A Map from event name → a Set of handler functions.
  // Set (not Array) because the same handler shouldn't register twice by accident.
  private handlers = new Map<string, Set<(payload: unknown) => void>>()

  on<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event)!.add(handler as (payload: unknown) => void)

    // I return an unsubscribe function instead of a separate off() method.
    // This means you can't forget to unsubscribe — just call the function you got back.
    // No memory leaks, no "which handler was it again?" bugs.
    return () => this.handlers.get(event)?.delete(handler as (payload: unknown) => void)
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    // We call every handler registered for this event.
    // None of them know about each other. That's the whole point.
    this.handlers.get(event)?.forEach(h => h(payload))
  }
}

// One bus, shared across the whole process.
// Every service imports this same instance — that's how they stay in sync.
export const bus = new EventBus()
export type { EventMap }
