# Container Queries demo

Companion sandbox for: **Container Queries Are Here and They're a Game Changer**

## What this shows

A card component that responds to its container's width — not the viewport.

Open `src/index.html` in the browser and drag the dashed wrapper's right edge to resize it:
- **Narrow (< 360px)**: image on top, text below
- **Wide (≥ 360px)**: image left, text right

The font also scales with `cqw` units — try it as you resize.

## How to explore

- Change `min-width: 360px` in the `@container` rule to a different value
- Add `container-type: size` instead of `inline-size` and add a height-based query
- Remove `container-name: card` from `.card-wrapper` and the named `@container card` will stop matching — a useful debugging technique
