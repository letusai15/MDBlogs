namespace EDA;

// Same pattern, different language.
// C# has built-in events and delegates — I could have used those.
// But I wanted to show that this is just a pattern, not a language feature.
// Understand the pattern and you can implement it anywhere.

public sealed class EventBus
{
    // Dictionary maps event name → a list of handlers registered for it.
    // Each handler is Action<object> — we wrap it in the generic Subscribe method
    // so callers never have to think about casting.
    private readonly Dictionary<string, List<Action<object>>> _handlers = new();

    public Action Subscribe<TPayload>(string eventName, Action<TPayload> handler)
    {
        if (!_handlers.ContainsKey(eventName))
            _handlers[eventName] = new List<Action<object>>();

        // Wrap the typed handler so the dictionary can store it generically.
        // The cast inside is safe because we only call this wrapper when
        // the event name matches — so the payload type is guaranteed.
        Action<object> wrapped = payload => handler((TPayload)payload);
        _handlers[eventName].Add(wrapped);

        // Return an unsubscribe action — same pattern as the TypeScript version.
        // Call it when a component is disposed. No cleanup bugs.
        return () => _handlers[eventName].Remove(wrapped);
    }

    public void Publish<TPayload>(string eventName, TPayload payload)
    {
        if (!_handlers.TryGetValue(eventName, out var handlers)) return;
        foreach (var h in handlers)
            h(payload!);
    }
}

// ── Event types as C# records ────────────────────────────────────────────────
// Records are perfect here — they're immutable value objects.
// An event that happened in the past shouldn't be mutable.
// Compare to TypeScript's type aliases in EventMap — same idea, different syntax.
public record OrderCreated   (string OrderId, string CustomerId, decimal Total);
public record OrderCancelled (string OrderId, string Reason);
public record PaymentOk      (string OrderId);
public record PaymentFailed  (string OrderId, string ErrorCode);
