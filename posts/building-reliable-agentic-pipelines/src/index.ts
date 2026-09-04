/**
 * Building reliable agentic pipelines — four patterns wired together
 *
 * Run: npx tsx src/index.ts
 *
 * Simulates an agent run where tool calls can fail, loop, and need observability.
 * Swap FAILURE_MODE to see how each pattern responds.
 */

// ── Config ───────────────────────────────────────────────────────────────────

const FAILURE_MODE: 'transient' | 'persistent' | 'loop' | 'none' = 'transient'
// 'transient'  — primary fails twice, succeeds on 3rd attempt (retry kicks in)
// 'persistent' — primary always fails (fallback kicks in)
// 'loop'       — tool keeps being called with same input (loop detector fires)
// 'none'       — everything works first time

// ── Pattern 1: Retry ─────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  { maxAttempts = 3, baseDelayMs = 100 }: { maxAttempts?: number; baseDelayMs?: number } = {}
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === maxAttempts) throw err
      const delay = baseDelayMs * Math.pow(2, attempt - 1)
      console.log(`  [retry] attempt ${attempt} failed, waiting ${delay}ms`)
      await new Promise(res => setTimeout(res, delay))
    }
  }
  throw new Error('unreachable')
}

// ── Pattern 2: Fallback ───────────────────────────────────────────────────────

async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  try {
    return await withRetry(primary, { maxAttempts: 2, baseDelayMs: 50 })
  } catch {
    console.log('  [fallback] primary exhausted — using fallback')
    return await fallback()
  }
}

// ── Pattern 3: Loop detection ─────────────────────────────────────────────────

interface AgentStep {
  toolName: string
  input: string
}

function detectLoop(steps: AgentStep[], windowSize = 4): boolean {
  if (steps.length < windowSize) return false
  const recent = steps.slice(-windowSize)
  const seen = new Set<string>()
  for (const step of recent) {
    const key = `${step.toolName}:${step.input}`
    if (seen.has(key)) return true
    seen.add(key)
  }
  return false
}

// ── Pattern 4: Observability ──────────────────────────────────────────────────

interface AgentSpan {
  runId: string
  step: number
  toolName: string
  inputSummary: string
  durationMs: number
  success: boolean
  errorMessage?: string
  outputSummary?: string
}

const spans: AgentSpan[] = []

async function tracedToolCall<T>(
  runId: string,
  step: number,
  toolName: string,
  args: unknown,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now()
  const inputSummary = JSON.stringify(args).slice(0, 100)
  try {
    const result = await fn()
    spans.push({ runId, step, toolName, inputSummary, durationMs: Date.now() - start, success: true, outputSummary: JSON.stringify(result).slice(0, 100) })
    return result
  } catch (err) {
    spans.push({ runId, step, toolName, inputSummary, durationMs: Date.now() - start, success: false, errorMessage: err instanceof Error ? err.message : String(err) })
    throw err
  }
}

// ── Simulated tool calls ──────────────────────────────────────────────────────

let callCount = 0
async function liveApi(customerId: string): Promise<{ name: string; balance: number }> {
  callCount++
  if (FAILURE_MODE === 'transient' && callCount <= 2) throw new Error('503 Service Unavailable')
  if (FAILURE_MODE === 'persistent') throw new Error('503 Service Unavailable')
  return { name: 'Priya Sharma', balance: 4200 }
}

async function cacheApi(customerId: string): Promise<{ name: string; balance: number }> {
  return { name: 'Priya Sharma (cached)', balance: 4100 }
}

// ── Agent run simulation ──────────────────────────────────────────────────────

async function runAgent(customerId: string) {
  const runId = `run_${Date.now()}`
  const executedSteps: AgentStep[] = []
  console.log(`\nAgent run ${runId} started — FAILURE_MODE=${FAILURE_MODE}`)

  const toolsToCall = FAILURE_MODE === 'loop'
    ? ['getCustomer', 'getCustomer', 'getCustomer', 'getCustomer', 'getCustomer'] // forced loop
    : ['getCustomer', 'summariseAccount', 'draftResponse']

  for (let i = 0; i < toolsToCall.length; i++) {
    const toolName = toolsToCall[i]
    const input = JSON.stringify({ customerId })

    if (detectLoop(executedSteps)) {
      console.log(`  [loop] detected after ${executedSteps.length} steps — aborting`)
      break
    }

    executedSteps.push({ toolName, input })

    try {
      const result = await tracedToolCall(runId, i + 1, toolName, { customerId }, async () => {
        if (toolName === 'getCustomer') {
          return await withFallback(
            () => liveApi(customerId),
            () => cacheApi(customerId)
          )
        }
        // Simulate other tools succeeding
        await new Promise(r => setTimeout(r, 20))
        return { ok: true }
      })
      console.log(`  step ${i + 1}: ${toolName} -> ${JSON.stringify(result)}`)
    } catch (err) {
      console.log(`  step ${i + 1}: ${toolName} FAILED: ${err}`)
      break
    }
  }

  console.log(`\nObservability spans:`)
  for (const s of spans) {
    const status = s.success ? 'OK' : 'ERR'
    console.log(`  [${status}] step ${s.step} ${s.toolName} ${s.durationMs}ms${s.errorMessage ? ' -- ' + s.errorMessage : ''}`)
  }
}

runAgent('customer_42')
