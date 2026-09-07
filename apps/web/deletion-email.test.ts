import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sendEmail } from './lib/email.ts'
import { deletionEmail, type Snapshot } from './lib/deletion-email.ts'

/* FR-P1's eighth email (R-96). It is sent ONCE and never repeated, so everything the user will
   ever be told in writing about their deletion is in this one message: the date, the way back,
   the themes they can still download, and the promise that nothing else follows. None of that is
   reachable from a browser step — the harness can see Resend's 2xx and nothing after it (DW-22) —
   so the message itself is held here. */

const DEADLINE = '2026-09-21T10:04:23.599Z'
const RESTORE = 'https://app.inflozo.com/restore'

const snapshot = (over: Partial<Snapshot> = {}): Snapshot => ({
  id: 'aaaaaaaa-5555-0000-0000-000000000001',
  theme_name: 'casper',
  captured_at: '2026-08-02T09:00:00.000Z',
  sites: { title: 'Orbit Weekly', url: 'https://orbitweekly.com' },
  ...over,
})

test('the subject carries the date the account actually goes', () => {
  const { subject } = deletionEmail({ deadline: DEADLINE, snapshots: [], restoreUrl: RESTORE })
  assert.equal(subject, 'Your Inflozo account will be deleted on Sep 21, 2026')
})

test('both bodies say the date, the way back, and that nothing else follows', () => {
  const { html, text } = deletionEmail({ deadline: DEADLINE, snapshots: [], restoreUrl: RESTORE })
  for (const body of [html, text]) {
    assert.match(body, /Sep 21, 2026/, 'the deadline is in the first sentence, not only the subject')
    assert.match(body, /permanently deleted on Sep 21, 2026/)
    assert.match(body, /Your live Ghost sites stay online/)
    assert.ok(body.includes(RESTORE), 'the Restore link must be in both bodies')
    assert.match(body, /This is the only email we'll send about this\./)
  }
  // The button is the template's ink one, and it points at Restore — not at the app's root.
  assert.ok(html.includes(`<a href="${RESTORE}"`) && html.includes('>Restore my account</a>'))
  // And the product's own copy is NOT entity-escaped: `we&#39;ll` in an inbox is a defect.
  assert.doesNotMatch(html, /&#39;/)
})

test('the themes block appears only when there is a theme to download', () => {
  const none = deletionEmail({ deadline: DEADLINE, snapshots: [], restoreUrl: RESTORE })
  assert.doesNotMatch(none.html, /Your original themes/)
  assert.doesNotMatch(none.text, /Your original themes/)

  const one = deletionEmail({ deadline: DEADLINE, snapshots: [snapshot()], restoreUrl: RESTORE })
  for (const body of [one.html, one.text]) {
    assert.match(body, /Your original themes/)
    assert.match(body, /casper/)
    assert.match(body, /Orbit Weekly/)
    assert.match(body, /captured Aug 2, 2026/)
    assert.match(body, /Sign in to download them before Sep 21, 2026/)
  }

  const two = deletionEmail({
    deadline: DEADLINE,
    snapshots: [snapshot(), snapshot({ id: 'b', theme_name: null, sites: { title: null, url: 'https://b.example' } })],
    restoreUrl: RESTORE,
  })
  // One row per snapshot, and the two fallbacks: a theme with no name, and a site with no title.
  assert.equal(two.text.match(/captured Aug 2, 2026/g)?.length, 2)
  assert.match(two.text, /Original theme · https:\/\/b\.example/)
})

test('a site title is escaped — it is text somebody else controls', () => {
  const nasty = '<script>alert(1)</script> & "Weekly"'
  const { html, text } = deletionEmail({
    deadline: DEADLINE,
    snapshots: [snapshot({ sites: { title: nasty, url: 'https://x.example' } })],
    restoreUrl: RESTORE,
  })
  assert.doesNotMatch(html, /<script>/, 'a site title went into the markup unescaped')
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt; &amp; &quot;Weekly&quot;/)
  // The plain-text half is not markup and is not escaped — it is read as characters.
  assert.ok(text.includes(nasty))

  // The theme name is a Ghost theme author's text and goes through the same door; a snapshot
  // whose site row is gone still names "your site" rather than throwing on `null`.
  const theme = deletionEmail({
    deadline: DEADLINE,
    snapshots: [snapshot({ theme_name: '<b>x</b>', sites: null })],
    restoreUrl: RESTORE,
  })
  assert.doesNotMatch(theme.html, /<b>x<\/b>/, 'a theme name went into the markup unescaped')
  assert.match(theme.html, /&lt;b&gt;x&lt;\/b&gt;<\/span> &middot; your site/)
  assert.match(theme.text, /<b>x<\/b> · your site/)
})

/**
 * THE SEND IS NON-FATAL BY DESIGN, and that is the matrix row "Resend fails or is unconfigured":
 * the deletion has ALREADY happened in the database when this is called, and the deadline is on
 * the page the browser is about to land on. A `sendEmail` that threw — or that a later edit let
 * throw — would take a completed deletion to the error boundary and tell the user it failed.
 * The unconfigured path is the one reachable without a network, and it is the one that would
 * happen if the Vercel env vars were ever dropped.
 */
test('an unconfigured send answers, and never throws', async () => {
  const key = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM
  delete process.env.RESEND_API_KEY
  delete process.env.RESEND_FROM
  try {
    const answered = await sendEmail({ to: 'a@example.com', subject: 's', html: '<p>h</p>', text: 't' })
    assert.deepEqual(answered, { ok: false, status: 0 }, 'status 0 is "we never asked", not "they refused"')
  } finally {
    if (key !== undefined) process.env.RESEND_API_KEY = key
    if (from !== undefined) process.env.RESEND_FROM = from
  }
})
