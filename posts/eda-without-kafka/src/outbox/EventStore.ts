// Simulates the Postgres events table from the blog post.
// In production this is a real DB table with FOR UPDATE SKIP LOCKED.
// See schema.sql for the exact DDL.

export interface StoredEvent {
  id: number
  type: string
  payload: Record<string, unknown>
  occurredAt: Date
  processed: boolean
}

let seq = 1
const store: StoredEvent[] = []

/** Append an event — called inside the same "transaction" as the domain write */
export function appendEvent(type: string, payload: Record<string, unknown>) {
  store.push({ id: seq++, type, payload, occurredAt: new Date(), processed: false })
}

/** Poll for unprocessed events — equivalent to SELECT ... FOR UPDATE SKIP LOCKED */
export function pollUnprocessed(limit = 20): StoredEvent[] {
  return store.filter(e => !e.processed).slice(0, limit)
}

/** Mark an event processed — equivalent to UPDATE events SET processed = true */
export function markProcessed(id: number) {
  const ev = store.find(e => e.id === id)
  if (ev) ev.processed = true
}
