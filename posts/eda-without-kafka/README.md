# EDA without Kafka — companion sandbox

Runnable code for the blog post:  
**"Event-driven architecture without the Kafka tax — lightweight patterns for small teams"**

[Read the post →](https://monalisadas-knowme.vercel.app/blog/event-driven-architecture-without-kafka-lightweight-patterns-small-teams)

---

## What this covers

**Pattern 1 — In-process typed EventBus** (TypeScript + C#)  
Five independent services wired together through events. No direct calls between them.
OrderService → emits `order.created` → InventoryService, EmailService, PaymentService all react independently.

**Pattern 2 — Postgres outbox** (TypeScript simulation + `schema.sql`)  
Domain write + event appended atomically. A background consumer polls `FOR UPDATE SKIP LOCKED`.

---

## Run it (TypeScript — runs in StackBlitz or locally)

```bash
npm install
npm start
```

## Run it (C# / .NET 8 — local only)

```bash
cd csharp
dotnet run
```

Requires [.NET 8 SDK](https://dotnet.microsoft.com/download).

---

## Project structure

```
src/
  bus/EventBus.ts          ← typed EventBus (matches blog post exactly)
  services/
    OrderService.ts        ← emits order.created / order.cancelled
    InventoryService.ts    ← listens, reserves stock
    EmailService.ts        ← listens, sends confirmations
    PaymentService.ts      ← listens, authorises or fails payment
    FulfillmentService.ts  ← listens, dispatches or cancels
    AnalyticsService.ts    ← listens, tracks revenue
  outbox/
    EventStore.ts          ← in-memory simulation of the Postgres events table
    OutboxDemo.ts          ← shows the poll-and-process pattern
  index.ts                 ← boots all services, runs both demos

schema.sql                 ← exact DDL for the Postgres events table
csharp/                    ← C# / .NET 8 equivalent of Pattern 1
```

---

## Try it yourself

Add a new subscriber in any service file — e.g. a `[Warehouse]` handler in `InventoryService.ts`.  
The other services don't change at all. That's the point.
