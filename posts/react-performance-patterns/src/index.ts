/**
 * React Performance Patterns — measurable demos without a browser
 *
 * Run: npx tsx src/index.ts
 *
 * Simulates re-render counts to illustrate the performance difference
 * between colocated state, lifted state, and refs.
 */

// ── Simulated render counter ──────────────────────────────────────────────────

const renderCounts: Record<string, number> = {}
function recordRender(component: string) {
  renderCounts[component] = (renderCounts[component] ?? 0) + 1
}

// ── Pattern 1: Colocated state ────────────────────────────────────────────────

function simulateLiftedState(hoverEvents: number) {
  // Bad: hover state at App level -- every hover triggers App + HugeTree + Button
  for (let i = 0; i < hoverEvents; i++) {
    recordRender('App[lifted]')
    recordRender('HugeTree[lifted]')
    recordRender('Button[lifted]')
  }
}

function simulateColocatedState(hoverEvents: number) {
  // Good: hover state in Button -- only Button re-renders
  for (let i = 0; i < hoverEvents; i++) {
    recordRender('Button[colocated]')
  }
}

// ── Pattern 2: Ref vs state for frequent updates ───────────────────────────────

function simulateStateForMousePosition(moves: number) {
  // Bad: every mouse move triggers a React render
  for (let i = 0; i < moves; i++) {
    recordRender('Canvas[state-based]')
  }
}

function simulateRefForMousePosition(_moves: number) {
  // Good: ref mutations don't schedule renders at all
  // Canvas re-renders: 0 (we just call draw() directly)
  recordRender('Canvas[ref-based]') // Only 1 render: the initial mount
}

// ── Demo ────────────────────────────────────────────────────────────────────────

const HOVER_EVENTS = 30
const MOUSE_MOVES  = 120 // ~2 seconds of movement at 60fps

simulateLiftedState(HOVER_EVENTS)
simulateColocatedState(HOVER_EVENTS)
simulateStateForMousePosition(MOUSE_MOVES)
simulateRefForMousePosition(MOUSE_MOVES)

console.log(`Simulated ${HOVER_EVENTS} hover events and ${MOUSE_MOVES} mouse moves:\n`)
console.log('--- State Colocation ---')
console.log(`  App re-renders (lifted):       ${renderCounts['App[lifted]'] ?? 0}`)
console.log(`  HugeTree re-renders (lifted):  ${renderCounts['HugeTree[lifted]'] ?? 0}`)
console.log(`  Button re-renders (lifted):    ${renderCounts['Button[lifted]'] ?? 0}`)
console.log(`  Button re-renders (colocated): ${renderCounts['Button[colocated]'] ?? 0}`)
console.log()
console.log('--- Ref vs State for mouse position ---')
console.log(`  Canvas re-renders (useState):  ${renderCounts['Canvas[state-based]'] ?? 0}`)
console.log(`  Canvas re-renders (useRef):    ${renderCounts['Canvas[ref-based]'] ?? 0}`)
console.log()
console.log('Key insight: colocation reduces wasted renders; refs eliminate them entirely.')
console.log('Reach for useMemo only AFTER you have measured with React DevTools Profiler.')
