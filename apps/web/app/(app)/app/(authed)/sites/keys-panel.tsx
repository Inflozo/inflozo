import type { ReactNode } from 'react'
import Link from 'next/link'
import { Banner } from '@/components/kit/banner'
import { buttonClasses } from '@/components/kit/button'
import { ring } from '@/components/kit/greyed'
import { Check, ExternalLink, Refresh, X } from '@/components/kit/icons'
import { TextInput } from '@/components/kit/input'
import { Submit } from '@/components/kit/submit'
import { title as sheetTitle } from '@/components/kit/dialog'
import {
  CONNECT_MAX,
  CONNECT_MESSAGES,
  connectMessage,
  KEYS,
  keysFieldOf,
  type ConnectField,
  type MessageCode,
} from '@/lib/connect-rule'
import { ContentKeyForm } from './keys-content-form'
import { removeToken, saveKeys, testConnection } from './actions'

/* ────────────────────────────── S11e's WIDE POPUP: B20's THREE CREDENTIAL ROWS ON THE LEFT, AND
   EVERYTHING YOU READ RATHER THAN TYPE IN A CONTEXT RAIL ON THE RIGHT (FR-C8).

   IT WAS S11d's SINGLE COLUMN AND THE OWNER'S TEST OF THIS STORY CHANGED IT (finding 2, 2026-09-10:
   "It is too long, I want it redesigned as per the artifacts in design/ManageKeys"). That artifact
   is `S11e Manage Keys Popup.dc.html` — in `claude-design-export/` beside the other frames since his
   ruling at Question 4 (2026-09-10) — a 900 x 743 window, and its own subtitle states the
   constraint this file holds to: *"Same content as the long screen, nothing removed."* Every
   sentence S11d drew is still drawn here; what changed is where. The body is what scrolls, not the
   document — `panelBox`'s height cap — which is the length complaint answered.

   ONE COMPONENT, TWO CALLERS, AND SINCE THE FIX THEY ARE THE POPUP AND THE PAGE.
   `keys-screen.tsx` does the reads once and hands them here; the Sites list renders that inside a
   `<dialog>` when its `?manage=` parameter is there, and `keys/page.tsx` renders the same thing as
   a full page for a typed URL, a modified click, a refresh and a scripts-off browser. WHICH OF
   THE TWO IT IS TRAVELS INTO EVERY FORM as a hidden field (`popup`), so each action redirects onto
   the chrome the press came from — the owner's findings 3 and 5 of 2026-09-10.

   AND THE WAY OUT IS THE SAME IN BOTH, WHICH IS WHY IT IS NOT A PROP HERE THE WAY
   `disconnect-confirm.tsx`'s `cancel` is: the ✕ and Cancel are `<Link href="/sites" replace>`. On
   the page that is a navigation back to the list; in the popup the same navigation takes
   `?manage=` off the list's URL, and the list stops rendering the `<dialog>` because of it — one
   rule for every way out there is, rather than a special control on each of them.

   NO `'use client'`. Every control here is a real `<form action={serverAction}>` and the ⋯ row
   that reaches it is an `<a href>` with a destination, so the whole surface works with JavaScript
   off. The one exception is FR-C2's Content-key browser check, which is `keys-content-form.tsx`
   and is kept to that.

   THREE FORMS AND NOT ONE, because a form cannot nest inside a form and Remove token and Test
   connection both need one of their own. B20 draws it this way too — a control per credential —
   and it is what puts each refusal under the field it came in. THE REFUSALS STAY UNDER THEIR OWN
   FIELD: S11e draws no error state, and the frozen Boundaries say a refused key is refused where
   it was typed, so the two columns changed nothing about that.

   WHAT IS NOT ON THIS SCREEN, each absent rather than greyed (UX-DR3), and each for a reason:
     · NO REVEAL. The secret half of the Admin key exists for milliseconds inside
       `server/ghost-admin/index.ts` and reaches no render path (AD-10). B20 draws an eye and the
       key's last characters; neither can exist here, and `KEYS.noReveal` says so to the customer
       rather than leaving them hunting for a control. `Eye` and `EyeOff` are in the Kit and are
       deliberately unimported.
     · NO URL FIELD, and not a disabled one either (A9 item 17). FR-C8 removed edit-URL-in-place
       because it would carry this record — its snapshots, its projects, its first-upload flag —
       onto a different live Ghost. The affordance does not exist rather than being defended, and
       the row says why.
     · NO PLAN FIELD. Preview-only is probed, not declared (FR-C2); B15's Re-check plan is where a
       customer re-runs it.
     · NO GRANTABLE SCOPES. Ghost fixes an integration's permissions; there is nothing here to
       grant, which is B20's own note.
     · NO "Passed · 2 min ago". S11d drew a stored timestamp beside Test connection, and
       `sites.last_checked_at` is Story 3.7's — written by its daily check, next to `sites.health`.
       A manual press that wrote either would drive that state machine from outside it. So the
       result is drawn and stored nowhere, and the stamp arrives with 3.7. S11e does not draw it
       either.
     · NO **Remove token** ON A SITE THAT HAS NO TOKEN. Only this screen's own Add token puts one
       there (Epic 7 asks for it at first deploy), so on a site whose owner never added one the
       control is absent — which is the correct behaviour, not a gap.

   ONE DEPARTURE FROM S11e, AND IT IS THE OWNER'S OWN RULING (Question 3, 2026-09-10): the frame
   draws the masked line under **Content API key** only, and this draws it under **Admin API key**
   as well. It is the only thing on the screen that says WHICH Admin key is stored, and his manual
   test step 5 reads it. */

/** Whether a code out of the URL is one the app has a sentence for. */
const hasSentence = (code: string): boolean => Object.prototype.hasOwnProperty.call(CONNECT_MESSAGES, code)

/** B20's mask, minus its tail: the first characters, then dots. The tail is the secret half. */
function Mask({ shown }: { shown: string }) {
  return (
    <span className="flex h-[34px] min-w-0 items-center gap-[9px] rounded-thumb border border-line bg-paper px-[10px] font-mono text-helper-caption text-ink">
      <span className="truncate">{shown}</span>
      <span aria-hidden className="tracking-[2px] text-ink-soft">
        ••••••••••
      </span>
    </span>
  )
}

/**
 * One credential: its name, whether Inflozo has it, what it enables, and its own control.
 *
 * THE STATUS SAYS PRESENT OR ABSENT AND NEVER AN ERROR. B20 draws "Working" beside a green dot,
 * which is a claim that a check has just passed; nothing checks on load here, so the word would be
 * asserting something untested. **Test connection** is where a customer asks that question, and
 * the health badge that answers it continuously is Story 3.7's.
 */
function Credential({
  name,
  present,
  enables,
  mask,
  children,
}: {
  name: string
  present: boolean
  enables: ReactNode
  mask?: string | null
  children: ReactNode
}) {
  return (
    <section
      className={`flex flex-col gap-[9px] rounded-thumb border p-[12px_13px] ${present ? 'border-line' : 'border-dashed border-line-strong'}`}
    >
      <div className="flex items-center gap-[9px]">
        <h3 className="flex-1 text-ui-dense font-semibold text-ink">{name}</h3>
        <span className="flex items-center gap-[5px] text-helper-caption text-ink-soft">
          <span aria-hidden className={`size-[6px] rounded-full ${present ? 'bg-mint' : 'bg-line-strong'}`} />
          {present ? KEYS.present : KEYS.absent}
        </span>
      </div>
      {mask ? <Mask shown={mask} /> : null}
      <p className="text-helper-caption leading-[1.45] text-ink-soft">{enables}</p>
      {children}
    </section>
  )
}

/** The Admin row's and the token row's forms: one field, one `Submit`, one hidden site id. */
function PasteForm({
  siteId,
  id,
  name,
  label,
  placeholder,
  hint,
  submit,
  busy,
  error,
  chrome,
}: {
  siteId: string
  id: string
  name: 'admin_key' | 'staff_token'
  label: string
  placeholder?: string
  hint: string
  submit: string
  busy: string
  error: string | null
  /** The chrome marker the panel builds once; see `KeysPanel`'s `popup`. */
  chrome: ReactNode
}) {
  return (
    <form action={saveKeys} className="flex flex-col gap-[10px]">
      <input type="hidden" name="site_id" value={siteId} />
      {chrome}
      <TextInput
        id={id}
        name={name}
        label={label}
        placeholder={placeholder}
        maxLength={CONNECT_MAX}
        mono
        error={error}
        hint={error ? null : hint}
      />
      <div className="flex">
        <Submit variant="secondary" size={32} busy={busy}>
          {submit}
        </Submit>
      </div>
    </form>
  )
}

/**
 * S11e's address block. IT IS RENDERED TWICE AND SEEN ONCE — in the rail from `tablet` up, and at
 * the TOP of the left column below it. On a phone the two columns become one and the address has
 * to stay where it says which site you are looking at, which is the top; carrying it down into the
 * rail's own order would put it after all three keys. Two five-line renders of one object beat an
 * `order` trick nobody can read at 3am, and every word still comes from `KEYS`, so they cannot
 * drift apart.
 */
function SiteUrl({ publicUrl, className = '' }: { publicUrl: string; className?: string }) {
  return (
    <div className={`flex flex-col gap-[3px] ${className}`}>
      <span className="text-control-label font-medium text-ink-soft">{KEYS.urlLabel}</span>
      {/* THE ADDRESS OPENS IN A NEW TAB AND SAYS SO — the owner's ask on Story 3.4 ("make the URL
          on left side an anchor link and show a new tab icon"), propagated here because the same
          address is drawn in three places and behaved two ways: the Sites card has linked it with
          this exact markup since his finding 4 one story earlier, and this was the odd one out
          (standing rule 3). It is `public_url || url` — the address Inflozo connected or the
          public one Ghost reports — and never a value read out of the customer's Ghost menu. The
          glyph is the export's own (`P0-2:111`) and is decorative: the link's name is the address,
          and "opens in a new tab" is what a screen reader hears after it. THIS IS NOT AN EDIT
          AFFORDANCE (A9 item 17): the reason line under it still says the address is fixed for this
          connection, and there is no field and no control that changes it. */}
      <a
        href={publicUrl}
        target="_blank"
        rel="noreferrer"
        className={`flex min-w-0 items-center gap-[5px] break-all rounded-sm font-mono text-ui-dense text-ink underline-offset-2 hover:underline ${ring}`}
      >
        <span className="break-all">{publicUrl}</span>
        <ExternalLink size={12} className="shrink-0" label="opens in a new tab" />
      </a>
      <span className="text-helper-caption leading-[1.55] text-ink-soft">{KEYS.urlReason}</span>
    </div>
  )
}

export type KeysSite = {
  id: string
  /** The site's own name, as the card shows it. */
  name: string
  /** The PUBLIC address — Ghost's own answer where it gave one (on Ghost(Pro) it is not `url`). */
  publicUrl: string
  present: { admin: boolean; content: boolean; staff: boolean }
  /** The Admin key's public id half, or null for a record connected before this story. */
  adminKeyId: string | null
  /** Browser-safe by Ghost's design (FR-C3) and drawn masked only for consistency with the Admin row. */
  contentKey: string | null
}

/** What the popup's `<dialog aria-labelledby>` points at. One panel is ever in the document, so
    it is a constant rather than a function of the site id: the Sites list renders the dialog
    before this panel has been read, and the id is what lets the two meet. */
export const KEYS_TITLE_ID = 'keys-panel-title'

export function KeysPanel({
  site,
  refused,
  status,
  tested,
  popup,
}: {
  site: KeysSite
  /** TRUE when this panel is the window over the Sites list (`/sites?manage=…`) rather than the
      full page (`/sites/keys?site=…`). It travels into every form as a hidden field, so the three
      actions redirect ONTO THE CHROME THE PRESS CAME FROM — the owner's test of 2026-09-10,
      findings 3 and 5. Nothing else on this screen reads it: the two chromes differ in how they
      arrive and in where an answer lands, and in nothing the customer sees. */
  popup: boolean
  /** `?keys=<code>` — one of the app's own codes, or null. The FIELD is derived, never trusted. */
  refused: string | null
  /** `?status=<n>` — the HTTP status `ghost_refused`'s sentence is built from; digits or null. */
  status: string | null
  /** `?test=ok` or `?test=<code>` — what the last press of Test connection proved. */
  tested: string | null
}) {
  /** The hidden field every form on this panel carries — see `popup` above. */
  const chrome = popup ? <input type="hidden" name="popup" value="1" /> : null
  const field = refused ? keysFieldOf(refused) : null
  // A CODE THE TABLE DOES NOT NAME IS NOT DRAWN AT ALL. `?keys=` is typed by whoever holds the URL,
  // so the value is a lookup key and never a sentence: anything unknown renders nothing, rather
  // than putting a stranger's text on the customer's screen.
  // WHICH SUBJECT A SENTENCE TAKES IS THE SENTENCE'S, NOT THE SCREEN'S. Every code was handed
  // `site.name`, and `ghost_refused` is `(status) => 'Ghost refused the connection (HTTP ${status})'`
  // — so a 403 or a 429 from the customer's Ghost read "(HTTP My Blog)" (review, 2026-09-09). The
  // status travels beside the code and the screen has already refused anything that is not digits.
  const subjectFor = (code: string) => (code === 'ghost_refused' ? (status ?? '') : site.name)
  // …and `ghost_refused` without its status is unnamed too: "(HTTP )" is not a sentence.
  const said =
    refused && hasSentence(refused) && !(refused === 'ghost_refused' && !status)
      ? connectMessage(refused as MessageCode, subjectFor(refused))
      : null
  const errorFor = (which: ConnectField) => (field === which ? said : null)
  // A code with no field of its own — a read that failed, a store that would not answer — is the
  // panel's banner, exactly as the wizard's fieldless refusals are its own.
  const banner = said && !field ? said : null

  /** S11e's ✕ and its footer Cancel: one destination, and the same markup in both chromes. */
  const wayOut = (className: string, children: ReactNode, label?: string) => (
    // `replace`: Escape, the backdrop and every action leave by replace, so the window never
    // leaves an entry for Back to re-open (review 7 of Story 3.4, 2026-09-10 — the brand ✕ is
    // this markup lifted, and it had the same push).
    <Link href="/sites" replace aria-label={label} className={className}>
      {children}
    </Link>
  )
  const closeClasses = `flex size-7 shrink-0 items-center justify-center rounded-thumb text-ink-soft transition-colors hover:bg-paper-sunk ${ring}`

  return (
    <>
      {/* S11e's header (`:1a`): the title pair, and the ✕ at the right edge. */}
      <div className="flex shrink-0 items-start gap-4 border-b border-line-faint p-[18px_20px] tablet:p-[24px_28px]">
        <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
          <h1 id={KEYS_TITLE_ID} className={`${sheetTitle} wrap-anywhere`}>
            {KEYS.title(site.name)}
          </h1>
          <p className="text-ui-dense leading-[1.55] text-ink-soft">{KEYS.sub}</p>
        </div>
        {/* S11e's ✕. Its accessible name is the footer control's own word — this screen adds no
            sentence that does not live in `KEYS` (standing rule 4's neighbour). */}
        {wayOut(closeClasses, <X size={14} strokeWidth={1.8} />, KEYS.cancel)}
      </div>

      {/* THE BODY IS WHAT SCROLLS AND NOT THE DOCUMENT — the whole point of the redesign, with
          `panelBox`'s height cap above it.

          AND FROM `tablet` UP THE TWO COLUMNS SCROLL SEPARATELY. Scrolling the row as one would
          stretch the rail to the height of the keys column — which is the taller of the two, the
          Staff Access Token's full-Administrator disclosure being what makes it so — and `mt-auto`
          would then pin **Test connection** to the bottom of a column taller than the window,
          which is below the fold: the exact complaint this redesign answers, moved one column
          over. Below `tablet` the columns are one and the body scrolls as a whole. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto tablet:flex-row tablet:items-stretch tablet:overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-[16px_20px] tablet:overflow-y-auto tablet:p-[20px_22px]">
          {banner ? <Banner kind="error">{banner}</Banner> : null}

          {/* The address, on a phone, where it says WHICH site this is — see `SiteUrl`. */}
          <SiteUrl publicUrl={site.publicUrl} className="tablet:hidden" />

          <Credential
            name={KEYS.admin.name}
            present={site.present.admin}
            enables={KEYS.admin.enables}
            mask={site.present.admin ? site.adminKeyId : null}
          >
            <PasteForm
              siteId={site.id}
              id="keys-admin"
              name="admin_key"
              label={KEYS.admin.paste}
              placeholder="65a3f…:9c2b41d8e0f…"
              hint={KEYS.admin.ask}
              submit={KEYS.admin.save}
              busy={KEYS.admin.busy}
              error={errorFor('admin_key')}
              chrome={chrome}
            />
          </Credential>

          <Credential
            name={KEYS.content.name}
            present={site.present.content}
            enables={KEYS.content.enables}
            mask={site.present.content ? site.contentKey?.slice(0, 10) : null}
          >
            <ContentKeyForm
              siteId={site.id}
              siteUrl={site.publicUrl}
              hint={KEYS.content.ask}
              error={errorFor('content_key')}
              chrome={chrome}
            />
          </Credential>

          <Credential
            name={KEYS.staff.name}
            present={site.present.staff}
            enables={
              <>
                {KEYS.staff.enables} {KEYS.staff.forward}
              </>
            }
          >
            {site.present.staff ? (
              /* DRAWN ONLY WHERE IT COULD ACT (UX-DR3). Removing degrades and never disconnects:
                 `remove()` flips one flag, the site stays Connected, and the three token-dependent
                 capabilities read as unavailable with their reason when Epic 7 builds them. */
              <form action={removeToken}>
                <input type="hidden" name="site_id" value={site.id} />
                {chrome}
                <Submit variant="secondary" size={32} busy={KEYS.staff.removeBusy}>
                  {KEYS.staff.remove}
                </Submit>
              </form>
            ) : (
              <PasteForm
                siteId={site.id}
                id="keys-staff"
                name="staff_token"
                label={KEYS.staff.add}
                hint={KEYS.staff.ask}
                submit={KEYS.staff.add}
                busy={KEYS.staff.addBusy}
                error={errorFor('staff_token')}
                chrome={chrome}
              />
            )}
          </Credential>
        </div>

        {/* S11e's CONTEXT RAIL: everything the customer READS rather than types. On a phone it is
            still the rail, in the rail's own order, below the three keys — minus the address,
            which stays at the top of the column above. */}
        <aside className="flex w-full shrink-0 flex-col gap-4 border-t border-line-faint bg-paper-raised p-[16px_20px] tablet:w-[322px] tablet:overflow-y-auto tablet:border-t-0 tablet:border-l tablet:p-[20px_22px]">
          <SiteUrl publicUrl={site.publicUrl} className="hidden tablet:flex" />
          <div aria-hidden className="hidden h-px bg-line-faint tablet:block" />

          {/* The departure from B20's eye, said to the customer and not only in a comment. */}
          <p className="text-helper-caption leading-[1.55] text-ink-soft">{KEYS.noReveal}</p>

          {/* S11e's hint block — the Kit's info banner, which is this shape already drawn. */}
          <Banner kind="info">{KEYS.rollHint}</Banner>

          {/* S11e's **Test connection** card, sitting on the rail's bottom edge with the result
              ABOVE the button. It is drawn only where there is a key to test: with no Admin key
              there is nothing to press and the Admin row asks for one instead (UX-DR3). */}
          {site.present.admin ? (
            <div className="mt-auto flex flex-col gap-[11px] rounded-thumb border border-line bg-surface p-[12px_13px]">
              {tested ? (
                <>
                  <TestResult result={tested} staff={site.present.staff} host={site.name} status={status} />
                  <div aria-hidden className="h-px bg-line-faint" />
                </>
              ) : null}
              <form action={testConnection} className="flex">
                <input type="hidden" name="site_id" value={site.id} />
                {chrome}
                <Submit variant="secondary" size={36} className="w-full" busy={KEYS.test.busy}>
                  <Refresh size={13} />
                  {KEYS.test.label}
                </Submit>
              </form>
            </div>
          ) : null}
        </aside>
      </div>

      {/* S11e's footer: Cancel only — each credential row carries its own save. */}
      <div className="flex shrink-0 items-center justify-end border-t border-line-faint p-[12px_20px] tablet:p-[14px_28px]">
        {wayOut(buttonClasses('secondary', 36), KEYS.cancel)}
      </div>
    </>
  )
}

/**
 * WHAT THE PRESS PROVED, AND WHAT STILL NEEDS THE TOKEN — B20's own three rows. A failure reads
 * the SAME codes-to-sentences table every other refusal in this epic reads, so a customer never
 * meets two different sentences for one cause.
 */
function TestResult({
  result,
  staff,
  host,
  status,
}: {
  result: string
  staff: boolean
  host: string
  status: string | null
}) {
  if (result !== 'ok') {
    // A CODE THE TABLE DOES NOT NAME IS NOT DRAWN — the panel's own rule for `?keys=`, and it was
    // not applied here: the fallback was `keys_failed`, "We couldn't save that just now", at
    // someone who pressed a read-only test (review, 2026-09-10; the same sentence `credential_missing`
    // was given its own words to escape). `ghost_refused` with no status would print "(HTTP )",
    // so it is treated as unnamed too. `?test=` is typed by whoever holds the URL.
    if (!hasSentence(result) || (result === 'ghost_refused' && !status)) return null
    // The same subject rule as the panel's refusals above, and for the same reason.
    const subject = result === 'ghost_refused' ? (status as string) : host
    return <Banner kind="error">{connectMessage(result as MessageCode, subject)}</Banner>
  }
  return (
    <div className="flex flex-col gap-[6px]" role="status">
      <p className="text-ui-dense font-medium text-ink">{KEYS.test.passed}</p>
      {KEYS.test.can.map((can) => (
        <Line key={can} ok>
          {can}
        </Line>
      ))}
      <Line ok={staff}>{staff ? KEYS.test.routesWithToken : KEYS.test.routesWithoutToken}</Line>
    </div>
  )
}

/* The missing capability is MARIGOLD and not danger (B20's own note): it is a thing this site
   cannot do yet, not a thing that is wrong with it — which is FR-C1's partially credentialed
   state in one colour. */
const Line = ({ ok, children }: { ok: boolean; children: ReactNode }) => (
  <p className={`flex items-start gap-[9px] text-ui-dense ${ok ? 'text-ink' : 'text-marigold-text'}`}>
    <span aria-hidden className={`mt-[3px] shrink-0 ${ok ? 'text-mint-text' : 'text-marigold-text'}`}>
      {ok ? <Check size={12} strokeWidth={2.6} /> : <X size={12} strokeWidth={2.2} />}
    </span>
    <span>{children}</span>
  </p>
)
