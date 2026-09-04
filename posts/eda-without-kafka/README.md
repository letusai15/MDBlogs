# EDA without Kafka — companion sandbox

Runnable code for the blog post:  
**"Event-driven architecture without the Kafka tax — lightweight patterns for small teams"**

[Read the post →](https://monalisadas-knowme.vercel.app/blog/eda-without-kafka-lightweight-patterns-for-small-teams)

## What this demonstrates

- A typed, zero-dependency in-process `EventBus`
- Multiple independent subscribers on the same event — no coupling between them
- A producer that emits events and knows nothing about who's listening
- Async handlers running in parallel via `Promise.all`

## Run it

```bash
npm install
npm start
```

## Expected output

```
=== EDA without Kafka — in-process EventBus demo ===

Three independent subscribers listen to the same events.
The producer knows nothing about who is listening.

→ Placing order: ORD-... (Alice, £120)
[Inventory]   reserving stock for order ORD-...
[Email]       sending confirmation to Alice for £120
→ Payment ok: ORD-...
[Fulfillment] dispatching order ORD-...

→ Placing order: ORD-... (Bob, £750)
[Inventory]   reserving stock for order ORD-...
[Email]       sending confirmation to Bob for £750
→ Payment failed: ORD-...
[Fulfillment] cancelling order ORD-... — payment failed

=== Done. Try adding a new subscriber in EventBus.ts! ===
```

## Try it yourself

Open `src/EventBus.ts` and add a new subscriber — for example, a `[Analytics]` handler that logs every order regardless of payment outcome. The existing code doesn't change at all.
