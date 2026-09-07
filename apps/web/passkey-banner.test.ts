import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

/* WHERE A PASSKEY ATTEMPT'S ANSWER IS SAID, pinned in the two files that decide it.
 *
 * The owner's test of Story 2.2 (finding 1): "We couldn't sign you in with a passkey. Use a magic
 * link instead." was an 11px grey helper-caption under the button and he missed it. It is now the
 * card's own red error banner at the top — the Kit's `error` kind, which is `role="alert"` with the
 * `XCircleSolid` icon on `danger-tint` — replacing whatever banner was there.
 *
 * READ out of the files rather than imported: `node --test` strips types but cannot load `.tsx`
 * (`kit-button.test.ts` is the precedent, and the same reason). What a source test can still hold
 * is the WIRING, which is exactly what a well-meant refactor takes away: putting the sentence back
 * in a `setCaption` under the button leaves every other test in this repo green, and the harness
 * step that would catch it only runs against the deployed site.
 */

const BUTTON = 'app/(app)/app/sign-in/passkey-button.tsx'
const FORM = 'app/(app)/app/sign-in/sign-in-form.tsx'

/** The two an ATTEMPT answers. The third, "This browser can't use passkeys.", is not one. */
const ATTEMPT_SENTENCES = ['NO_PASSKEY_HERE', 'PASSKEY_FAILED']

test("a passkey attempt's answer leaves the button and goes to the card", () => {
  const source = readFileSync(BUTTON, 'utf8')
  for (const name of ATTEMPT_SENTENCES) {
    assert.match(
      source,
      new RegExp(`onError\\(${name}\\)`),
      `${BUTTON}: ${name} must be handed up through onError, not shown under the button.`,
    )
  }
  // A server action's own message is the same kind of answer and takes the same road.
  for (const from of ['started', 'finished']) {
    assert.match(
      source,
      new RegExp(`onError\\(${from}\\.error\\.message\\)`),
      `${BUTTON}: ${from}'s error message is an attempt's answer — it goes to onError too.`,
    )
  }
  assert.ok(
    !/setCaption/.test(source),
    `${BUTTON}: the local caption state is what the owner could not see; there is no caption left to set.`,
  )
})

test("the browser-can't sentence stays put, and stays quiet", () => {
  const source = readFileSync(BUTTON, 'utf8')
  // Not an attempt's answer: it is shown before anything is pressed and explains the absence of
  // the button it replaces. A red alert on arrival would misdescribe a page whose magic link works.
  assert.match(source, /NO_WEBAUTHN = "This browser can't use passkeys\."/, `${BUTTON}: the sentence.`)
  assert.ok(!/onError\(NO_WEBAUTHN\)/.test(source), `${BUTTON}: NO_WEBAUTHN is not a banner.`)
  assert.match(source, /text-helper-caption[\s\S]*?\{NO_WEBAUTHN\}/, `${BUTTON}: it keeps P0-0's slot.`)
})

test('the card says it in the red banner, and it replaces the others', () => {
  const source = readFileSync(FORM, 'utf8')
  assert.match(
    source,
    /onError=\{setPasskeyError\}/,
    `${FORM}: PasskeyButton's answer must land in this card's state.`,
  )
  // The banner itself: `error`, so it is red with the icon and `role="alert"` (kit/banner.tsx).
  assert.match(
    source,
    /\{passkeyError \? \(\s*<Banner kind="error">\{passkeyError\}<\/Banner>\s*\) : \(/,
    `${FORM}: the sentence is a Kit error Banner, and the ternary's ELSE branch is what it replaces.`,
  )
  // "If there is already a message showing at the top, replace it with the new one" — so the
  // other three live inside THAT else branch and cannot stack above or below it. Anchored on the
  // passkey Banner: the bare `) : (<>` matched the outer `sent` ternary first, whose fragment holds
  // all three wherever they sit, and a hoisted signed-out banner left this green (second review,
  // 2026-09-07, executed).
  const elseBranch =
    /<Banner kind="error">\{passkeyError\}<\/Banner>\s*\) : \(\s*<>([\s\S]*?)<\/>\s*\)\}/.exec(source)
  assert.ok(elseBranch, `${FORM}: the three other banners must sit in the else branch.`)
  for (const other of ['signed out', 'linkError', 'send_failed']) {
    assert.ok(
      elseBranch[1].includes(other),
      `${FORM}: the "${other}" banner must be replaced by the passkey one, not drawn beside it.`,
    )
  }
  // And it does not outlive the thing that answered it: a new send clears it (guard).
  assert.match(source, /setPasskeyError\(null\)/, `${FORM}: a send clears the previous attempt's banner.`)
})
