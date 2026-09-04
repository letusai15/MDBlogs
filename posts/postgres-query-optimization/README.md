# PostgreSQL Query Optimization — timing simulation

Companion sandbox for: **PostgreSQL Query Optimization: The Practical Guide**

## What this shows

Simulates 10M orders and 500k users in-memory, then runs three query strategies and times each:

| Strategy | What it simulates | Expected |
|----------|------------------|---------|
| Seq scan | No index — reads every row | Slowest |
| Index scan | `CREATE INDEX CONCURRENTLY` | Much faster |
| CTE + MATERIALIZED | Pre-filters with a materialised CTE | Fastest |

The output shows the actual timing difference on your machine, and confirms all three return the same result.

## How to explore

- Increase `TOTAL_ORDERS` to `50_000_000` to exaggerate the difference
- Change `RECENT_CUTOFF` from 90 to 7 — fewer recent users, even more dramatic index advantage
- Add a partial index simulation: filter `orderIndex` by `status !== 'cancelled'` before building it and see if the index scan gets faster
