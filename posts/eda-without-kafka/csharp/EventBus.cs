namespace EDA;

// C# equivalent of the TypeScript EventBus from the blog post.
// Uses Action<object> delegates; the generic wrapper enforces the payload type.
public sealed class EventBus
{
    private readonly Dictionary<string, List<Action<object>>> _handlers = new();

    public Action Subscribe<TPayload>(string eventName, Action<TPayload> handler)
    {
        if (!_handlers.ContainsKey(eventName))
            _handlers[eventName] = new List<Action<object>>();

        Action<object> wrapped = payload => handler((TPayload)payload);
        _handlers[eventName].Add(wrapped);

        // Returns an unsubscribe action
        return () => _handlers[eventName].Remove(wrapped);
    }

    public void Publish<TPayload>(string eventName, TPayload payload)
    {
        if (!_handlers.TryGetValue(eventName, out var handlers)) return;
        foreach (var h in handlers)
            h(payload!);
    }
}

// ── Strongly-typed event records ─────────────────────────────────────────────
public record OrderCreated(string OrderId, string CustomerId, decimal Total);
public record OrderCancelled(string OrderId, string Reason);
public record PaymentOk(string OrderId);
public record PaymentFailed(string OrderId, string ErrorCode);
