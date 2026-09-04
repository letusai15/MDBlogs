type Handler<T = unknown> = (payload: T) => void | Promise<void>

export class EventBus {
  private listeners = new Map<string, Handler[]>()

  on<T>(event: string, handler: Handler<T>) {
    const existing = this.listeners.get(event) ?? []
    this.listeners.set(event, [...existing, handler as Handler])
  }

  off<T>(event: string, handler: Handler<T>) {
    const existing = this.listeners.get(event) ?? []
    this.listeners.set(event, existing.filter(h => h !== handler))
  }

  async emit<T>(event: string, payload: T) {
    const handlers = this.listeners.get(event) ?? []
    await Promise.all(handlers.map(h => h(payload)))
  }
}

export const bus = new EventBus()
