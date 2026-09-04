# EDA without Kafka — lightweight patterns for small teams

This is the working code behind my blog post:
**[Event-driven architecture without the Kafka tax](https://monalisadas-knowme.vercel.app/blog/event-driven-architecture-without-kafka-lightweight-patterns-small-teams)**

If you're reading this without the post, go read it first. This sandbox makes a lot more sense when you understand *why* we're doing this, not just *what* the code does.

---

## What problem are we solving?

Every team eventually hits the moment where Service A is directly calling Service B, Service B is calling Service C, and now you're scared to touch anything because you don't know what breaks.

You Google "event-driven architecture" and every result tells you to install Kafka, set up Zookeeper, spin up schema registries, configure brokers...

I'm here to tell you: **you don't need any of that to start.**

This sandbox shows two patterns that work without any new infrastructure:

1. **In-process typed EventBus** — for when services share a runtime
2. **Postgres outbox** — for when you need durability across crashes

Both patterns give you the architectural win (loose coupling, independent services) without the operational overhead.

---

## How to run it

### TypeScript version (runs in StackBlitz or locally)

```bash
npm install
npm start
```

That's it. No Docker. No databases to set up. No environment variables.

You'll see the output from both patterns — watch how one `placeOrder()` call fans out to Inventory, Email, Payment, and Fulfillment without any of them calling each other.

### C# / .NET version

```bash
cd csharp
dotnet run
```

Requires [.NET 8 SDK](https://dotnet.microsoft.com/download). Same pattern, different syntax. I included this because a lot of my readers work in .NET and I wanted to show that this isn't a JavaScript-specific idea.

---

## Project structure

```
src/
  bus/
    EventBus.ts           ← the whole Pattern 1 implementation (it's small, that's the point)
  services/
    OrderService.ts       ← publishes events, never calls other services directly
    InventoryService.ts   ← subscribes to events, zero imports from other services
    EmailService.ts       ← subscribes to 3 different events — fan-out in action
    PaymentService.ts     ← subscribes AND publishes (event chaining)
    FulfillmentService.ts ← reacts to payment outcomes
    AnalyticsService.ts   ← added after all the others, never had to touch existing code
  outbox/
    EventStore.ts         ← simulates the Postgres events table in memory
    OutboxDemo.ts         ← shows poll-and-process pattern
  index.ts                ← runs both demos in sequence

schema.sql                ← exact DDL for the Postgres events table
csharp/
  EventBus.cs             ← same pattern in C# — dictionary + delegates
  Program.cs              ← same demo scenario in C#
```

---

## What I want you to notice

### In Pattern 1

Open `src/index.ts` and look at what a single `placeOrder()` call triggers.

Then open `src/services/InventoryService.ts`. See how it imports nothing from OrderService, PaymentService, or anyone else? It only knows about the bus and the event types. That's the whole game — services talk to the bus, never to each other.

Now try adding a new subscriber. Say you want to log every order to an analytics table. Add a `bus.on('order.created', ...)` somewhere and watch it just... work. No other files need to change.

That's what I mean by "loose coupling." It's not a vague architectural principle. It's this — a new subscriber that requires zero changes to existing code.

### In Pattern 2

Look at `src/outbox/EventStore.ts`. The comment about `FOR UPDATE SKIP LOCKED` is the important one.

In a real Postgres setup, that SQL clause is what lets you run multiple consumers safely. Without it, two workers poll the same rows and process them twice. With it, each worker grabs its own batch and the others skip those rows entirely. The in-memory version doesn't need this (it's single-threaded) but the comment is there so you know what to look for when you take this to production.

### In the C# version

Notice that `csharp/EventBus.cs` and the TypeScript version have almost identical structure. Dictionary for handlers, typed subscribe method, action-based unsubscribe. The language is different but the thinking is the same.

That's always been true of good patterns — they're ideas, not syntax.

---

## What this sandbox doesn't cover

- **Persistence across restarts** — the in-process bus is in memory. Use the outbox pattern for that.
- **Distributed systems** — this is one process. For multi-service communication across network boundaries, you do eventually want a message broker. Just not on day one.
- **Dead letter queues** — if a handler throws in the outbox pattern, you need retry logic. The demo shows the happy path.
- **Schema evolution** — what happens when your event payload changes? Versioning events properly is its own topic.

These are real problems. I wrote about them honestly in the post because I think the community does developers a disservice when we skip straight to "use Kafka" without showing what you're actually trading off.

---

## Questions?

Find me on LinkedIn or DEV.to — links in the blog post. I read every reply.

— Monalisa
