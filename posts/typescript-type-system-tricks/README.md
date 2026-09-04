# TypeScript Type System Tricks — demos

Companion sandbox for: **TypeScript Type System Tricks That Changed How I Code**

## What this shows

Three type-level patterns demonstrated with runnable TypeScript:

1. **Template literal types** — construct string unions from smaller pieces; the compiler knows every valid combination
2. **Discriminated unions + assertNever** — model state so missing cases become compile errors, not runtime surprises
3. **Infer in conditional types** — extract pieces of a type inside a conditional; the foundation of built-in utilities like `ReturnType` and `Awaited`

## How to explore

The real value is in the **type errors** — not the runtime output.

- Try calling `applySpacing` with `'margin-center'` and see the compiler refuse
- Remove one `case` from the `switch` and see the `assertNever` line turn red
- Hover over type aliases `A`, `B`, `C`, `D` to see what the compiler resolved them to

## What won't show in the terminal

Type aliases (`type A = ...`) are erased at compile time — there's nothing to print. The sandbox prints what it can; the rest lives in the editor's hover tooltips.
