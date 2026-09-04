using EDA;

var bus = new EventBus();
int orderSeq = 1;

// ── Register subscribers (independent — none know about each other) ───────────

bus.Subscribe<OrderCreated>("order.created", e =>
    Console.WriteLine($"[Inventory]   reserving stock for {e.OrderId}"));

bus.Subscribe<OrderCreated>("order.created", e =>
    Console.WriteLine($"[Email]       confirmation to {e.CustomerId} — {e.OrderId} (£{e.Total})"));

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

bus.Subscribe<PaymentFailed>("payment.failed", e =>
    Console.WriteLine($"[Fulfillment] cancelling {e.OrderId} — payment not received"));

bus.Subscribe<PaymentFailed>("payment.failed", e =>
    Console.WriteLine($"[Email]       alerting customer — payment failed for {e.OrderId} ({e.ErrorCode})"));

// ── Publish events (producers know nothing about who is listening) ────────────

Console.WriteLine("═══════════════════════════════════════════════════");
Console.WriteLine("  EDA without Kafka — C# / .NET 8 version");
Console.WriteLine("═══════════════════════════════════════════════════\n");

void PlaceOrder(string customerId, decimal total)
{
    var orderId = $"ORD-{orderSeq++:D3}";
    Console.WriteLine($"\n[Order]   → placing {orderId} ({customerId}, £{total})");
    bus.Publish("order.created", new OrderCreated(orderId, customerId, total));
}

PlaceOrder("alice", 120);    // payment ok   → dispatched
PlaceOrder("bob",   750);    // payment fail → email alert
PlaceOrder("carol", 299);    // payment ok   → dispatched

Console.WriteLine("\n═══════════════════════════════════════════════════");
Console.WriteLine("  Same pattern, same decoupling, zero Kafka.\n");
