# Testing agents — evaluation patterns demo

Companion sandbox for: **Testing agents that don't give the same answer twice**

## What this shows

Four patterns for testing non-deterministic AI agents, all demonstrated without a real LLM:

1. **Property-based** — assert invariants, not exact strings. Runs every time.
2. **LLM-as-judge** — use a second model to evaluate quality against explicit criteria. (Simulated here.)
3. **Behavioral** — test what the agent DID, not what it said. Track tool calls.
4. **Statistical** — run the same scenario N times, measure pass rate, set a threshold.

## How to explore

- Run it multiple times — notice that property and behavioral tests always pass even though the agent's wording changes
- Change `threshold` in `runStochastic` from `0.9` to `1.0` to see it fail
- Add a new property check in `testPropertyBased` and see what it catches
- In `simulateAgent`, add a spurious `delete_order` tool call and watch `testBehavioral` fail
