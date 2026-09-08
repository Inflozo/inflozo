'use client'

import { startTransition, useActionState, useState, type ChangeEvent, type FormEvent, type MouseEvent } from 'react'
import { Banner } from '@/components/kit/banner'
import { Button, buttonClasses } from '@/components/kit/button'
import { ring } from '@/components/kit/greyed'
import { ChevronDown } from '@/components/kit/icons'
import { TextInput } from '@/components/kit/input'
import {
  ADMIN_KEY_CONSENT,
  CONNECT_MAX,
  connectMessage,
  HTTP_WARNING,
  isPlainHttp,
  type ConnectField,
  type ConnectResult,
  type Step,
} from '@/lib/connect-rule'
import { checkContentKey } from './content-check'
import { connectSite } from './actions'

/* ───────── S2 Onboarding.dc.html — S2b·1 (:78-102) and S2b·2 (:110-142), and the same pair
   inside S11b (S11 Sites.dc.html:131-155).

   ONE COMPONENT, BOTH STEPS, TWO SHAPES. The page renders it as the frame's card — 480 wide at
   step 1, 560 at step 2 — and `connect-dialog.tsx` renders it inside S11b's 520 sheet, which
   supplies its own title pair and ✕. Nothing about the steps themselves differs, so nothing about
   them is written twice.

   THE STEP ANCHOR IS ONE ELEMENT WITH BOTH BEHAVIOURS. "Done — next", "Back" and "Where do I find
   these?" are `<a href="?step=…">`, so the pair works with JavaScript off — two ordinary pages a
   link apart. When the dialog supplies `onStep` the click is intercepted and the step becomes
   local state, because a dialog cannot navigate without closing itself.

   THE CONTENT KEY IS CHECKED IN THE BROWSER BEFORE THE ACTION IS CALLED (FR-C2). The submit is
   held, `checkContentKey` runs against the customer's own Ghost, and a 401 stops it with the field
   error — the action is never called. Anything else lets it through: only Ghost saying "I do not
   know this key" is the user's to fix here, and the server's answer is better than a guess made
   in the browser. WITHOUT JAVASCRIPT there is no handler, the form posts, and the key is stored
   unchecked — the editor's content-source pill (E5) is where a wrong one then shows.

   THE STAFF ACCESS TOKEN IS NOT HERE, in any form: no field, no mention. It is Epic 7's, at the
   first deploy (FR-C1), and this screen ending without it is the "partially credentialed" state
   the product treats as ordinary. */

/** The three steps of the handshake, S2b·1's own words. `strong` is the frame's 600 emphasis. */
const STEPS = [
  <>
    Open <strong className="font-semibold">Ghost Admin → Settings → Integrations</strong>
  </>,
  <>
    Click <strong className="font-semibold">Add custom integration</strong>
  </>,
  <>
    Name it{' '}
    <span className="rounded-thumb border border-line bg-paper px-[6px] py-[2px] font-mono text-ui-dense">
      Inflozo
    </span>{' '}
    and save — it shows three things: an API URL and two keys
  </>,
]

const bar = 'h-1 flex-1 rounded-[2px]'

function Progress({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden className={`${bar} bg-coral`} />
      <span aria-hidden className={`${bar} ${step === 'keys' ? 'bg-coral' : 'bg-line'}`} />
      <span className="ml-2 font-mono text-control-label text-ink-soft">
        <span aria-hidden>{step === 'keys' ? '2/2' : '1/2'}</span>
        <span className="sr-only">Step {step === 'keys' ? 2 : 1} of 2</span>
      </span>
    </div>
  )
}

/** The frame's own heading pair. The dialog draws its title above instead, so it renders none. */
function Heading({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-display text-[26px] font-bold tracking-[-0.01em] text-ink">{title}</h1>
      <p className="text-ui leading-[1.5] text-ink-soft">{sub}</p>
    </div>
  )
}

export function ConnectWizard({
  step,
  variant = 'page',
  backHref = '/',
  onStep,
  onCancel,
}: {
  step: Step
  /** `page` draws the frame's card; `dialog` renders bare, inside S11b's own sheet. */
  variant?: 'page' | 'dialog'
  /** Where step 1's "Back" goes on the page: `/sites` from the connect route, `/` from Sites. */
  backHref?: string
  /** Supplied by the dialog only: the step becomes local state and the anchors stop navigating. */
  onStep?: (next: Step) => void
  /** Supplied by the dialog only: step 1's left control is "Cancel" and it closes the sheet. */
  onCancel?: () => void
}) {
  const [state, action, pending] = useActionState<ConnectResult | null, FormData>(connectSite, null)
  // THE THREE VALUES ARE STATE, NOT THE DOM'S. React 19 resets a form after its action returns —
  // `requestFormReset` runs for every action, a refusal included — so uncontrolled fields emptied
  // on every server-side refusal and the customer re-pasted all three to fix one (review,
  // 2026-09-08; the sign-in form met the same thing). Controlled fields keep what was typed, and
  // nothing typed is ever echoed back by the server to do it.
  const [typed, setTyped] = useState({ url: '', admin_key: '', content_key: '' })
  const edit = (event: ChangeEvent<HTMLInputElement>) =>
    setTyped((values) => ({ ...values, [event.target.name]: event.target.value }))
  const warning = isPlainHttp(typed.url) ? HTTP_WARNING : null
  const [contentError, setContentError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  const error = state && 'error' in state ? state.error : null
  const fieldError = (field: ConnectField) =>
    error?.field === field ? error.message : field === 'content_key' ? contentError : null
  const banner = error && !error.field ? error.message : null

  const go = (next: Step) => (event: MouseEvent<HTMLAnchorElement>) => {
    // A modified click is the user asking for a new tab, and the page is what should open there
    // — the opener's own rule (`connect-dialog.tsx`).
    if (!onStep || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
    event.preventDefault()
    onStep(next)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    // THE BROWSER CHECKS THE CONTENT KEY FIRST, then the action runs — and the action is INVOKED
    // DIRECTLY, not by re-submitting the form. The old dance (a `verified` ref, `preventDefault`,
    // then `form.requestSubmit()` on a second pass) raced: when `checkContentKey` returned
    // synchronously — a skipped `http://` address, which never fetches — the nested submit fired
    // inside the first submit event's own tick and React dispatched no action, so an http connect
    // silently did nothing (no POST, the button still "Connect"; executed on the deployed site,
    // Review 2, 2026-09-08). The https path only worked because its real fetch delayed the
    // resubmit past the event. `startTransition(() => action(data))` is React 19's own way to run
    // a `useActionState` action imperatively — one path, no re-entrancy, no timing. WITHOUT
    // JavaScript this handler never runs and the form's `action={action}` posts natively.
    event.preventDefault()
    if (checking || pending) return
    const data = new FormData(event.currentTarget)
    setContentError(null)
    setChecking(true)
    const verdict = await checkContentKey(String(data.get('url') ?? ''), String(data.get('content_key') ?? ''))
    setChecking(false)
    // Only Ghost saying "I do not know this key" is the user's to fix here; everything else lets
    // the submit through, so the SERVER's answer is what the customer reads.
    if (verdict === 'unknown_key') {
      setContentError(connectMessage('content_key_unknown'))
      return
    }
    startTransition(() => action(data))
  }

  const cancelling = variant === 'dialog' && step === 'integration'
  const primary = step === 'keys' ? 'Connect' : 'Done — next'

  const body =
    step === 'integration' ? (
      <>
        <Progress step="integration" />
        {variant === 'page' ? (
          <Heading
            title="First, a quick handshake."
            sub="Inflozo talks to Ghost through a custom integration. Takes about a minute."
          />
        ) : null}
        <ol role="list" className="flex list-none flex-col gap-[14px]">
          {STEPS.map((content, at) => (
            <li key={at} className="flex items-baseline gap-3">
              <span
                aria-hidden
                className="flex size-[22px] shrink-0 translate-y-[3px] items-center justify-center rounded-full bg-coral-tint text-control-label font-semibold text-coral-text"
              >
                {at + 1}
              </span>
              <span className="text-ui leading-[1.5]">{content}</span>
            </li>
          ))}
        </ol>
        {/* The frame draws a placeholder box here and names what belongs in it; this is the
            owner's own screenshot of the saved integration, which is what step 3 describes.
            Width and height are on the element so the card does not reflow as it loads. */}
        <img
          src="/connect/integration.png"
          width={644}
          height={408}
          alt="The saved Inflozo integration in Ghost Admin, showing its API URL, Admin API key and Content API key"
          className="w-full rounded-thumb border border-line"
        />
        <div className="flex items-center justify-between gap-3">
          {cancelling ? (
            <Button variant="ghost" size={36} data-cancel onClick={onCancel}>
              Cancel
            </Button>
          ) : (
            <a href={backHref} className={`rounded-sm text-ui font-medium text-ink-soft ${ring}`}>
              Back
            </a>
          )}
          <a href="?step=keys" onClick={go('keys')} className={buttonClasses('primary', 44)}>
            {primary}
          </a>
        </div>
      </>
    ) : (
      <>
        <Progress step="keys" />
        {variant === 'page' ? (
          <Heading
            title="Now paste the three keys."
            sub="They're right on the Inflozo integration you just made — copy each one across."
          />
        ) : null}
        {banner ? <Banner kind="error">{banner}</Banner> : null}
        <form action={action} onSubmit={onSubmit} className="flex flex-col gap-[22px]">
          <TextInput
            id="s2b-api-url"
            name="url"
            label="API URL"
            placeholder="https://orbitweekly.com"
            maxLength={CONNECT_MAX}
            size={44}
            mono
            required
            value={typed.url}
            onChange={edit}
            error={fieldError('url')}
            hint={warning}
          />
          <TextInput
            id="s2b-admin-key"
            name="admin_key"
            label="Admin API key"
            placeholder="65a3f…:9c2b41d8e0f…"
            maxLength={CONNECT_MAX}
            size={44}
            mono
            required
            value={typed.admin_key}
            onChange={edit}
            error={fieldError('admin_key')}
          />
          <TextInput
            id="s2b-content-key"
            name="content_key"
            label="Content API key"
            placeholder="8d41c0a97b…"
            maxLength={CONNECT_MAX}
            size={44}
            mono
            // The three fields are the frame's three and "paste the three keys" is the heading: none
            // is optional, and `required` says so with or without JavaScript (review, 2026-09-08).
            required
            value={typed.content_key}
            onChange={edit}
            error={fieldError('content_key')}
          />
          <a
            href="?step=integration"
            onClick={go('integration')}
            className={`flex items-center justify-between rounded-sm border border-line p-[12px_14px] text-ui-dense font-medium text-ink transition-colors hover:bg-paper ${ring}`}
          >
            <span>Where do I find these?</span>
            <ChevronDown size={16} className="text-ink-soft" />
          </a>
          {/* FR-C3's honesty rule, in the helper-caption slot above Connect (S2b·2 :136-138).
              Ghost offers no narrower credential, so saying so plainly is the only lever. */}
          <p className="text-helper-caption leading-[1.5] text-ink-soft">{ADMIN_KEY_CONSENT}</p>
          <div className="flex items-center justify-between gap-3">
            <a href="?step=integration" onClick={go('integration')} className={`rounded-sm text-ui font-medium text-ink-soft ${ring}`}>
              Back
            </a>
            <Button type="submit" variant="primary" size={44}>
              {checking || pending ? 'Connecting…' : primary}
            </Button>
          </div>
        </form>
      </>
    )

  if (variant === 'dialog') return body
  return (
    <div
      // The frame's own card, both widths and both gaps: 480/24 at step 1, 560/22 at step 2.
      // Full width below `tablet`, where 390 has no room for either.
      className={`flex w-full flex-col rounded-lg bg-surface p-6 shadow-md tablet:p-9 ${
        step === 'keys' ? 'gap-[22px] tablet:w-[560px]' : 'gap-6 tablet:w-[480px]'
      }`}
    >
      {body}
    </div>
  )
}
