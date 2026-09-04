# useActionState — state machine demo

Companion sandbox for the blog post: **React 19 useActionState — from useState chaos to server-action clarity**

## What this shows

This demo re-implements the state machine that `useActionState` builds under the hood — no React needed. Run it to see how:

1. The action function always receives `prevState` first, then `formData`
2. `isPending` is managed automatically — you never set it yourself
3. The returned state from one submit is the `prevState` of the next

## How to explore

- Change the `Math.random() < 0.3` threshold to always fail or always pass
- Add a second field (e.g. `name`) and validate it — notice how you return a new state object each time
- Try dispatching twice in rapid succession — `isPending` blocks the second call

## Relates to

`useActionState(action, initialState)` in React 19 — same contract, just rendered to your browser form instead of the terminal.
