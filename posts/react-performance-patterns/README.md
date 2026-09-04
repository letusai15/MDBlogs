# React Performance Patterns — re-render counter

Companion sandbox for: **React Performance Patterns I Use Every Day**

## What this shows

A simulation that counts re-renders to make abstract patterns concrete:

| Pattern | Lifted state | Colocated state |
|---------|-------------|-----------------|
| 30 hover events | 90 re-renders (App + HugeTree + Button each time) | 30 re-renders (only Button) |

And for high-frequency updates:

| Approach | Mouse moves | Re-renders |
|----------|------------|------------|
| useState | 120 | 120 (React re-renders the canvas 60× per second) |
| useRef   | 120 | 1 (initial mount only — draw() called directly) |

## How to explore

- Change `HOVER_EVENTS` and `MOUSE_MOVES` to simulate different load levels
- Add a third component to `simulateLiftedState` to see cascading re-renders
- The numbers make the pattern obvious — measure first, then optimize
