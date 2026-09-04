// This is a simulation of the Postgres events table from the blog post.
// In production, this is a real database table — see schema.sql for the exact DDL.
// I'm using an in-memory array here so you can run this without any setup.
// The logic is identical — the only difference is where the data lives.

export interface StoredEvent {
  id: number
  type: string
  payload: Record<string, unknown>
  occurredAt: Date
  processed: boolean   // false = waiting to be handled, true = done
}

let seq = 1
const store: StoredEvent[] = []   // this is your Postgres table

// In real code this runs inside a database transaction alongside your domain write.
// Both succeed or both fail — that's the guarantee the outbox pattern gives you.
export function appendEvent(type: string, payload: Record<string, unknown>) {
  store.push({ id: seq++, type, payload, occurredAt: new Date(), processed: false })
}

// This is what your background consumer calls on a schedule.
// In Postgres the SQL uses FOR UPDATE SKIP LOCKED — see schema.sql.
// That clause lets multiple consumers poll the same table without blocking each other.
export function pollUnprocessed(limit = 20): StoredEvent[] {
  return store.filter(e => !e.processed).slice(0, limit)
}

// Mark an event done so the next poll doesn't pick it up again.
// In Postgres: UPDATE events SET processed = true WHERE id = $1
export function markProcessed(id: number) {
  const ev = store.find(e => e.id === id)
  if (ev) ev.processed = true
}
