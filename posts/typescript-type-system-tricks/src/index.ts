/**
 * TypeScript Type System Tricks — interactive demos
 *
 * Run: npx tsx src/index.ts
 *
 * Uncomment a section, save, and watch the terminal update.
 * The real action is in the TYPE ERRORS — hover over the red underlines
 * in the editor to see TypeScript explain what went wrong.
 */

// ── 1. Template Literal Types ────────────────────────────────────────────────

type EventName = 'click' | 'focus' | 'blur'
// Capitalize is built-in -- turns 'click' into 'Click'
type Handler = `on${Capitalize<EventName>}` // 'onClick' | 'onFocus' | 'onBlur'

type Side = 'top' | 'right' | 'bottom' | 'left'
type Spacing = `margin-${Side}` | `padding-${Side}`

function applySpacing(prop: Spacing, value: string) {
  console.log(`${prop}: ${value}`)
}

applySpacing('margin-top', '16px')    // valid
applySpacing('padding-left', '8px')   // valid
// applySpacing('margin-center', '4px') // COMPILE ERROR: not in the union
// applySpacing('gap', '12px')          // COMPILE ERROR: not a Spacing

// ── 2. Discriminated Unions with Exhaustive Checks ────────────────────────────

type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }   // data only exists in success
  | { status: 'error'; error: Error } // error only exists in error

// If TypeScript lets you reach assertNever, you missed a case above
function assertNever(x: never): never {
  throw new Error('Unhandled state: ' + JSON.stringify(x))
}

function describeState<T>(state: AsyncState<T>): string {
  switch (state.status) {
    case 'idle':    return 'Waiting for action'
    case 'loading': return 'Fetching...'
    case 'success': return `Got data: ${JSON.stringify(state.data)}`
    case 'error':   return `Failed: ${state.error.message}`
    default:        return assertNever(state) // Remove a case -- this line turns red
  }
}

const states: Array<AsyncState<{ name: string }>> = [
  { status: 'idle' },
  { status: 'loading' },
  { status: 'success', data: { name: 'Monalisa' } },
  { status: 'error', error: new Error('Network timeout') },
]
states.forEach(s => console.log(describeState(s)))

// ── 3. Infer in Conditional Types ─────────────────────────────────────────────

// 'infer R' means: if T matches Promise<something>, capture that something as R
type Unwrapped<T> = T extends Promise<infer R> ? R : T

type A = Unwrapped<Promise<string>>  // string
type B = Unwrapped<number>           // number (not a promise -- passthrough)

// Capture the element type out of an array
type ElementOf<T> = T extends Array<infer E> ? E : never
type C = ElementOf<string[]> // string

// Capture just the first argument of any function
type FirstArg<F> = F extends (first: infer A, ...rest: any[]) => any ? A : never
type D = FirstArg<(name: string, age: number) => void> // string

console.log('\nType aliases are compile-only -- no runtime output for infer demos.')
console.log('Open the file in the editor and hover over A, B, C, D to see the resolved types.')
