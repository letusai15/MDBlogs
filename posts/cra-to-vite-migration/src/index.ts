// CRA → Vite Migration: what actually changes under the hood
// Every line maps one CRA assumption to its Vite equivalent.
// Run this, read the output, then follow the steps in your real project.

// ─── 1. The migration map ─────────────────────────────────────────────────────

type Migration = { area: string; before: string; after: string; note: string }

const migrations: Migration[] = [
  {
    area: 'Env prefix',
    before: 'REACT_APP_API_URL=https://api.example.com',
    after:  'VITE_API_URL=https://api.example.com',
    note:   'Rename every variable in every .env file',
  },
  {
    area: 'Env access in code',
    before: 'process.env.REACT_APP_API_URL',
    after:  'import.meta.env.VITE_API_URL',
    note:   'ESM native — no Node process globals at runtime',
  },
  {
    area: 'index.html location',
    before: 'public/index.html  (CRA injects scripts automatically)',
    after:  'index.html at project root — you own it',
    note:   'Add: <script type="module" src="/src/main.tsx"></script>',
  },
  {
    area: 'Dev server',
    before: 'react-scripts start  (~5-30s cold start)',
    after:  'vite               (~300ms cold start)',
    note:   'No bundling on start — Vite serves native ESM',
  },
  {
    area: 'Production build',
    before: 'react-scripts build  (Webpack)',
    after:  'tsc && vite build   (esbuild + Rollup)',
    note:   'Separate tsc step means type errors block the build',
  },
  {
    area: 'SVG as React component',
    before: "import { ReactComponent as Logo } from './logo.svg'",
    after:  "import Logo from './logo.svg?react'  (needs vite-plugin-svgr)",
    note:   'npm i -D vite-plugin-svgr, add svgr() to plugins array',
  },
  {
    area: 'Absolute imports / @ alias',
    before: 'jsconfig.json paths or CRACO — implicit in some setups',
    after:  'resolve.alias in vite.config.ts + tsconfig paths',
    note:   'Explicit is better; both files must agree on the alias',
  },
]

console.log('╔══════════════════════════════════════════════════════╗')
console.log('║       CRA → Vite  Migration Map                     ║')
console.log('╚══════════════════════════════════════════════════════╝\n')

migrations.forEach(({ area, before, after, note }, i) => {
  console.log(`${i + 1}. ${area}`)
  console.log(`   BEFORE  ${before}`)
  console.log(`   AFTER   ${after}`)
  console.log(`   ↳ ${note}\n`)
})

// ─── 2. The complete vite.config.ts you actually need ─────────────────────────

console.log('─── vite.config.ts (complete baseline) ──────────────────\n')
console.log(`import { defineConfig } from 'vite'
import react        from '@vitejs/plugin-react'
import svgr         from 'vite-plugin-svgr'      // only if you import SVGs as components
import path         from 'path'

export default defineConfig({
  plugins: [
    react(),
    svgr(),   // remove this line if you have no SVG component imports
  ],
  resolve: {
    alias: {
      // mirrors tsconfig "paths" — both must stay in sync
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Optional: expose only specific env vars to the client bundle
  // envPrefix: 'VITE_',   // this is already the default
})
`)

// ─── 3. The tsconfig.json fields that need updating ──────────────────────────

console.log('─── tsconfig.json — fields that must change ─────────────\n')
console.log(`{
  "compilerOptions": {
    "target":                 "ES2020",
    "useDefineForClassFields": true,        // required for Vite + React
    "module":                 "ESNext",     // CRA used CommonJS — change this
    "moduleResolution":       "bundler",    // new in TS 5, matches Vite's resolver
    "types":                  ["vite/client"], // gives you import.meta.env types
    "paths":                  { "@/*": ["./src/*"] }, // mirrors resolve.alias
    "baseUrl":                "."
  }
}
`)

// ─── 4. The two gotchas that bite everyone ────────────────────────────────────

console.log('─── Gotchas that will bite you ──────────────────────────\n')

const gotchas = [
  {
    title: 'require() calls in source files',
    problem: "Vite outputs native ESM — require() doesn't exist at runtime.",
    fix:    "Replace with import statements, or use createRequire from 'module' for rare Node interop.",
  },
  {
    title: 'process.env references you missed',
    problem: 'import.meta.env only exposes VITE_* vars — everything else is undefined.',
    fix:    "Search for 'process.env' globally. Every hit needs updating.",
  },
  {
    title: 'PUBLIC_URL in HTML or CSS',
    problem: 'CRA replaced %PUBLIC_URL% — Vite does not.',
    fix:    "Remove %PUBLIC_URL% — Vite serves from / by default. Use relative paths.",
  },
  {
    title: 'Jest tests still reference react-scripts',
    problem: 'Vite is not a Jest runner — your test setup is separate.',
    fix:    'Switch to Vitest (same config file as Vite) or keep Jest with babel-jest. Do this after the app runs.',
  },
]

gotchas.forEach(({ title, problem, fix }, i) => {
  console.log(`${i + 1}. ${title}`)
  console.log(`   Problem: ${problem}`)
  console.log(`   Fix:     ${fix}\n`)
})

console.log('─── Verification ─────────────────────────────────────────\n')
console.log('Run these after migration:')
console.log('  npm run dev     → app opens at localhost:5173, HMR works')
console.log('  npm run build   → dist/ produced with no type errors')
console.log('  npm run preview → serves the built dist/ locally\n')
console.log('If build passes and preview looks right — you are done.')
console.log('Ship it.')
