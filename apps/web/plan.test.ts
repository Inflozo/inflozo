import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  capSentence,
  goProLabel,
  includesProjects,
  PLANS,
  PRICE,
  planFor,
  planName,
} from './lib/plan.ts'

// Appendix F.1 is the sole definition of Free/Pro gating, and the resolver's third column —
// `pro_past_due` — is the row AD-28 exists to keep from diverging. Both are asserted here.

test('planFor: free, absent and unknown resolve to Free; both Pro states to Pro', () => {
  assert.equal(planFor('free'), 'free')
  assert.equal(planFor(undefined), 'free')
  assert.equal(planFor(null), 'free')
  assert.equal(planFor('pro_active'), 'pro')
  // The grace window keeps EVERY Pro capability (F.1's third column) — the one row that has
  // gone wrong in this project before.
  assert.equal(planFor('pro_past_due'), 'pro')
})

test('planName is the badge’s word', () => {
  assert.equal(planName('free'), 'Free')
  assert.equal(planName('pro'), 'Pro')
})

test('the sentences pluralise from the number, never from a typed string', () => {
  assert.equal(includesProjects('free'), 'Free includes 1 project')
  assert.equal(includesProjects('pro'), `Pro includes ${PLANS.pro.projects} projects`)
  assert.equal(capSentence('free'), `Free includes 1 project. Pro gives you ${PLANS.pro.projects}.`)
  // On Pro there is no way out to name, so the sentence is the pill's and nothing more.
  assert.equal(capSentence('pro'), `Pro includes ${PLANS.pro.projects} projects.`)
  assert.equal(goProLabel(), `Go Pro — $${PRICE.monthly}/mo`)
})

test('a one-project plan would still read “1 project”, and a 25-project plan “25 projects”', () => {
  // The pluralisation is the branch; proving it on the shipped numbers alone would pass with
  // the branch deleted only if both plans happened to agree, which they do not.
  assert.match(includesProjects('free'), / 1 project$/)
  assert.match(includesProjects('pro'), /s$/)
})

/**
 * The rows are a TRANSCRIPTION of Appendix F.1, so they are checked against it rather than
 * trusted — the same argument `tokens.test.ts` makes about the export.
 */
test('every number in PLANS occurs in Appendix F.1’s own table', () => {
  const prd = readFileSync(
    join(process.cwd(), '..', '..', '_bmad-output', 'planning-artifacts', 'prds',
      'prd-Inflozo-2026-08-17', 'prd.md'),
    'utf8',
  )
  const matrix = /### F\.1 Plan matrix([\s\S]*?)\n### F\.2/.exec(prd)
  assert.ok(matrix, 'Appendix F.1 was not found in the PRD — this test reads the table, not a copy of it')

  const rows = matrix[1]
  assert.match(rows, new RegExp(`\\|\\s*Projects\\s*\\|\\s*${PLANS.free.projects}\\s*\\|\\s*${PLANS.pro.projects}\\s`))
  assert.match(rows, new RegExp(`\\|\\s*Site connections\\s*\\|\\s*${PLANS.free.sites}\\s*\\|\\s*${PLANS.pro.sites}\\s`))
  assert.match(rows, new RegExp(`\\|\\s*Asset storage\\s*\\|\\s*${PLANS.free.storageMb} MB\\s*\\|\\s*${PLANS.pro.storageMb / 1024} GB\\s`))
  assert.match(rows, new RegExp(`\\|\\s*Per-upload cap\\s*\\|\\s*${PLANS.free.uploadMb} MB`))
  assert.match(rows, new RegExp(`\\|\\s*Deploy history / rollback\\s*\\|\\s*last ${PLANS.free.history}\\s*\\|\\s*last ${PLANS.pro.history} `))
  assert.ok(rows.includes(`$${PRICE.monthly}/mo · $${PRICE.yearly}/yr`), 'the price is not F.1’s price')
})
