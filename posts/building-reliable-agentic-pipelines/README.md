# Building reliable agentic pipelines — demo

Companion sandbox for: **Building reliable agentic pipelines — retries, fallbacks, and observability**

## What this shows

All four production patterns wired together in a simulated agent run:

1. **Retry** — exponential backoff on transient tool failures
2. **Fallback** — cached snapshot when primary API is persistently unavailable
3. **Loop detection** — fingerprint-based check that breaks infinite loops loudly
4. **Observability** — every tool call emits a span with timing and result

## How to explore

Change `FAILURE_MODE` at the top of `src/index.ts`:

| Mode | What happens |
|------|-------------|
| `'transient'` | Primary fails twice, retry succeeds on attempt 3 |
| `'persistent'` | Primary always fails, fallback activates |
| `'loop'` | Same tool called repeatedly, loop detector fires |
| `'none'` | Everything works first time |

After changing the mode, save the file and the terminal updates automatically.
