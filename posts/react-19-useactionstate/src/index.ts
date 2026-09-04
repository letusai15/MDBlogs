/**
 * Simulates the useActionState pattern without React.
 * Demonstrates the async state machine concept that the hook implements.
 *
 * Run: npx tsx src/index.ts
 */

type State = { success: boolean; error: string | null }

// The action function — same signature as what you'd pass to useActionState
async function submitContactForm(
  prevState: State,
  formData: Map<string, string>
): Promise<State> {
  const email = formData.get('email')
  if (!email) return { success: false, error: 'Email is required' }
  if (!email.includes('@')) return { success: false, error: 'Invalid email' }

  // Simulate a network call
  await new Promise(r => setTimeout(r, 300))

  // Simulate a server-side error 30% of the time
  if (Math.random() < 0.3) {
    return { success: false, error: 'Server unavailable — try again' }
  }

  return { success: true, error: null }
}

// ------------------------------------------------------------------
// The state machine useActionState builds under the hood
// ------------------------------------------------------------------
function createActionState<S>(
  action: (prevState: S, formData: Map<string, string>) => Promise<S>,
  initialState: S
) {
  let state = initialState
  let isPending = false

  return {
    getState: () => state,
    isPending: () => isPending,
    async dispatch(formData: Map<string, string>) {
      if (isPending) return
      isPending = true
      const prev = state
      try {
        state = await action(prev, formData)
      } finally {
        isPending = false
      }
      return state
    },
  }
}

// ------------------------------------------------------------------
// Demo — four submissions to show state transitions
// ------------------------------------------------------------------
async function demo() {
  const form = createActionState(submitContactForm, { success: false, error: null })

  const cases: Array<{ label: string; data: Map<string, string> }> = [
    { label: 'Empty submit',       data: new Map() },
    { label: 'Bad email',          data: new Map([['email', 'notanemail']]) },
    { label: 'Valid email (1)',     data: new Map([['email', 'user@example.com']]) },
    { label: 'Valid email (2)',     data: new Map([['email', 'user@example.com']]) },
  ]

  for (const { label, data } of cases) {
    console.log(`\n-- ${label} --`)
    console.log('Before:', form.getState())
    await form.dispatch(data)
    console.log('After: ', form.getState())
  }

  console.log('\n---')
  console.log('Key insight: the action always receives prevState (so you can')
  console.log('keep error context across re-submits), and isPending is managed')
  console.log('automatically — you only read it.')
}

demo()
