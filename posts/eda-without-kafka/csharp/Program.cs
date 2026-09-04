using EDA;

// One bus. Shared. Every subscriber imports this same instance.
var bus = new EventBus();
int orderSeq = 1;

// ── Register subscribers first ────────────────────────────────────────────────
// Same rule as the TypeScript version — subscribe before you emit.
// None of these lambdas know about each other. They only know about the bus.

bus.Subscribe<OrderCreated>("order.created", e =>
    Console.WriteLine($"[Inventory]   reserving stock for {e.OrderId}"));

bus.Subscribe<OrderCreated>("order.created", e =>
    Console.WriteLine($"[Email]       confirmation to {e.CustomerId} — {e.OrderId} (£{e.Total})"));

// PaymentService is a subscriber that also publishes — same as the TypeScript version.
// It reacts to 'order.created', then emits its own outcome event.
bus.Subscribe<OrderCreated>("order.created", e =>
{
    if (e.Total > 500)
    {
        Console.WriteLine($"[Payment]     FAILED for {e.OrderId} — £{e.Total} exceeds limit");
        bus.Publish("payment.failed", new PaymentFailed(e.OrderId, "LIMIT_EXCEEDED"));
    }
    else
    {
        Console.WriteLine($"[Payment]     authorised for {e.OrderId}");
        bus.Publish("payment.ok", new PaymentOk(e.OrderId));
    }
});

bus.Subscribe<PaymentOk>("payment.ok", e =>
    Console.WriteLine($"[Fulfillment] dispatching {e.OrderId} 🚚"));

// Both Fulfillment and Email react to payment.failed — fan-out, no coordination needed.
bus.Subscribe<PaymentFailed>("payment.failed", e =>
    Console.WriteLine($"[Fulfillment] cancelling {e.OrderId} — payment not received"));

bus.Subscribe<PaymentFailed>("payment.failed", e =>
    Console.WriteLine($"[Email]       alerting customer — payment failed for {e.OrderId} ({e.ErrorCode})"));


// ── Emit events (producers know nothing about who is listening) ───────────────

Console.WriteLine("═══════════════════════════════════════════════════");
Console.WriteLine("  EDA without Kafka — C# / .NET 8");
Console.WriteLine("  Same pattern as the TypeScript version.");
Console.WriteLine("  Different syntax. Same thinking.");
Console.WriteLine("═══════════════════════════════════════════════════\n");

void PlaceOrder(string customerId, decimal total)
{
    var orderId = $"ORD-{orderSeq++:D3}";
    Console.WriteLine($"\n[Order]   → placing {orderId} ({customerId}, £{total})");
    bus.Publish("order.created", new OrderCreated(orderId, customerId, total));
}

PlaceOrder("alice", 120);    // payment ok   → dispatched
PlaceOrder("bob",   750);    // payment fail → email + fulfillment cancel
PlaceOrder("carol", 299);    // payment ok   → dispatched

Console.WriteLine("\n═══════════════════════════════════════════════════");
Console.WriteLine("  No Kafka. No RabbitMQ. No infrastructure.");
Console.WriteLine("  Just a dictionary and some delegates.\n");
