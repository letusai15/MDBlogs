/**
 * Testing agents — four evaluation patterns demonstrated
 *
 * Run: npx tsx src/index.ts
 *
 * Simulates an agent that answers questions about order policies.
 * Each pattern tests it differently.
 */

// ── Simulated agent ────────────────────────────────────────────────────────────

type ToolCall = { name: string; args: Record<string, unknown> }

async function simulateAgent(input: string, trackCalls?: ToolCall[]): Promise<string> {
  // Simulated non-determinism: randomly pick a phrasing variant
  const variants = [
    "Your order was placed successfully. Order ID: ORD-9988.",
    "Order confirmed! Your order ID is ORD-9988.",
    "We have successfully placed your order. Reference: ORD-9988.",
  ]
  const response = variants[Math.floor(Math.random() * variants.length)]

  // Track simulated tool calls
  if (trackCalls) {
    trackCalls.push({ name: 'lookup_order', args: { input } })
    trackCalls.push({ name: 'create_order', args: { customer: 'test' } })
    // NOTE: deliberately NOT calling 'delete_order' -- that would be a bug
  }

  return response
}

function extractOrderId(text: string): string | null {
  const match = text.match(/ORD-\d+/)
  return match ? match[0] : null
}

// ── Pattern 1: Property-based testing ─────────────────────────────────────────

async function testPropertyBased() {
  console.log('\n--- Pattern 1: Property-based ---')
  const response = await simulateAgent('Place an order for item 42')

  const checks = [
    { name: 'mentions order',   pass: response.toLowerCase().includes('order') },
    { name: 'success signal',   pass: /success|placed|confirmed/i.test(response) },
    { name: 'not too long',     pass: response.length < 500 },
    { name: 'has order ID',     pass: extractOrderId(response) !== null },
  ]

  for (const c of checks) {
    console.log(`  ${c.pass ? 'PASS' : 'FAIL'} ${c.name}`)
  }
  // All pass, even though exact wording varies every run
}

// ── Pattern 2: LLM-as-judge (simulated) ──────────────────────────────────────

async function evaluateWithJudge(
  input: string,
  output: string,
  criteria: string[]
): Promise<{ pass: boolean; score: number; reason: string }> {
  // In production this would be a real LLM call.
  // Simulated here by checking properties heuristically.
  const lowerOutput = output.toLowerCase()
  const passed = criteria.filter(c => {
    if (c.includes('order')) return lowerOutput.includes('order')
    if (c.includes('ID') || c.includes('reference')) return /ord-\d+/i.test(output)
    return true // other criteria pass by default in this simulation
  })
  const score = Math.round((passed.length / criteria.length) * 10)
  return { pass: score >= 7, score, reason: `${passed.length}/${criteria.length} criteria met` }
}

async function testLlmAsJudge() {
  console.log('\n--- Pattern 2: LLM-as-judge ---')
  const response = await simulateAgent("What's the status of my order?")
  const eval_ = await evaluateWithJudge(
    "What's the status of my order?",
    response,
    [
      'Mentions the order',
      'Includes an order ID or reference',
      'Sounds helpful and professional',
    ]
  )
  console.log(`  Score: ${eval_.score}/10 | Pass: ${eval_.pass} | ${eval_.reason}`)
}

// ── Pattern 3: Behavioral testing ────────────────────────────────────────────

async function testBehavioral() {
  console.log('\n--- Pattern 3: Behavioral ---')
  const toolCalls: ToolCall[] = []
  await simulateAgent('Place an order for item 42', toolCalls)

  const lookupCall = toolCalls.find(c => c.name === 'lookup_order')
  const createCall = toolCalls.find(c => c.name === 'create_order')
  const deleteCall = toolCalls.find(c => c.name === 'delete_order')

  console.log(`  lookup_order called: ${lookupCall ? 'PASS' : 'FAIL'}`)
  console.log(`  create_order called: ${createCall ? 'PASS' : 'FAIL'}`)
  console.log(`  delete_order NOT called: ${!deleteCall ? 'PASS' : 'FAIL (safety bug!)'}`)
}

// ── Pattern 4: Statistical pass rate ─────────────────────────────────────────

async function runStochastic(
  testFn: () => Promise<boolean>,
  runs = 10,
  threshold = 0.8
): Promise<void> {
  const results = await Promise.all(Array.from({ length: runs }, () => testFn()))
  const passRate = results.filter(Boolean).length / runs
  const ok = passRate >= threshold
  console.log(`  Pass rate: ${(passRate * 100).toFixed(0)}% over ${runs} runs | ${ok ? 'PASS' : 'FAIL'} (threshold ${threshold * 100}%)`)
}

async function testStatistical() {
  console.log('\n--- Pattern 4: Statistical pass rate (10 runs) ---')
  await runStochastic(async () => {
    const response = await simulateAgent('Place an order')
    return extractOrderId(response) !== null // Must always include an order ID
  }, 10, 0.9)
}

// ── Run all patterns ──────────────────────────────────────────────────────────

async function main() {
  await testPropertyBased()
  await testLlmAsJudge()
  await testBehavioral()
  await testStatistical()
  console.log('\nDone. Notice: property/behavioral tests pass consistently;')
  console.log('statistical test measures what only probability can reveal.')
}

main()
