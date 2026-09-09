import type { ReactNode } from 'react'
import { Banner } from '@/components/kit/banner'
import { Check, X } from '@/components/kit/icons'
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

/* ────────────────────────────── S11d's CHROME AROUND B20's THREE CREDENTIAL ROWS (FR-C8).

   ONE COMPONENT, AND THE ROUTE IS ITS ONE CALLER TODAY. `disconnect-confirm.tsx` is the shape:
   a `cancel` prop, because the way out is the only thing that differs between a dialog and a page,
   and everything the customer READS is the same either way. The ⋯ row navigates here rather than
   opening a dialog over the card, and `site-menu.tsx` records why — the Admin key's id half lives
   in `private.site_credentials`, which no list page may read.

   NO `'use client'`. Every control here is a real `<form action={serverAction}>` and the ⋯ row that
   reaches it is an `<a href>` with a destination, so the whole surface works with JavaScript off.
   The one exception is FR-C2's Content-key browser check, which is `keys-content-form.tsx` and is
   kept to that.

   THREE FORMS AND NOT ONE, because a form cannot nest inside a form and Remove token and Test
   connection both need one of their own. B20 draws it this way too — a control per credential —
   and it is what puts each refusal under the field it came in.

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
     · NO "Passed · 2 min ago". S11d draws a stored timestamp beside Test connection, and
       `sites.last_checked_at` is Story 3.7's — written by its daily check, next to `sites.health`.
       A manual press that wrote either would drive that state machine from outside it. So the
       result is drawn and stored nowhere, and the stamp arrives with 3.7.
     · NO **Remove token** ON A SITE THAT HAS NO TOKEN. Nothing stores one until Epic 7, so that
       control is drawn on no production site today — which is the correct behaviour, not a gap. */

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
}) {
  return (
    <form action={saveKeys} className="flex flex-col gap-[10px]">
      <input type="hidden" name="site_id" value={siteId} />
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

export function KeysPanel({
  site,
  refused,
  tested,
  cancel,
}: {
  site: KeysSite
  /** `?keys=<code>` — one of the app's own codes, or null. The FIELD is derived, never trusted. */
  refused: string | null
  /** `?test=ok` or `?test=<code>` — what the last press of Test connection proved. */
  tested: string | null
  cancel: ReactNode
}) {
  const field = refused ? keysFieldOf(refused) : null
  // A CODE THE TABLE DOES NOT NAME IS NOT DRAWN AT ALL. `?keys=` is typed by whoever holds the URL,
  // so the value is a lookup key and never a sentence: anything unknown renders nothing, rather
  // than putting a stranger's text on the customer's screen.
  const said = refused && hasSentence(refused) ? connectMessage(refused as MessageCode, site.name) : null
  const errorFor = (which: ConnectField) => (field === which ? said : null)
  // A code with no field of its own — a read that failed, a store that would not answer — is the
  // panel's banner, exactly as the wizard's fieldless refusals are its own.
  const banner = said && !field ? said : null

  return (
    <>
      <div className="flex flex-col gap-[6px]">
        <h1 id={`keys-${site.id}-title`} className={`${sheetTitle} wrap-anywhere`}>
          {KEYS.title(site.name)}
        </h1>
        <p className="text-ui-dense leading-[1.5] text-ink-soft">{KEYS.sub}</p>
      </div>

      {banner ? <Banner kind="error">{banner}</Banner> : null}

      {/* S11d's address row (`:203-205`): TEXT, with the reason under it. There is no field here
          and there is no disabled field here — see the header. */}
      <div className="flex flex-col gap-[3px]">
        <span className="text-control-label font-medium text-ink-soft">{KEYS.urlLabel}</span>
        <span className="break-all font-mono text-ui-dense text-ink">{site.publicUrl}</span>
        <span className="text-helper-caption leading-[1.5] text-ink-soft">{KEYS.urlReason}</span>
      </div>

      <div className="flex flex-col gap-[11px]">
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
          />
        </Credential>

        <Credential
          name={KEYS.content.name}
          present={site.present.content}
          enables={KEYS.content.enables}
          mask={site.present.content ? site.contentKey?.slice(0, 10) : null}
        >
          <ContentKeyForm siteId={site.id} siteUrl={site.publicUrl} error={errorFor('content_key')} />
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
            />
          )}
        </Credential>
      </div>

      {/* The departure from B20's eye, said to the customer and not only in a comment. */}
      <p className="text-helper-caption leading-[1.5] text-ink-soft">{KEYS.noReveal}</p>

      {/* S11d's hint block (`:232`) — the Kit's info banner, which is this shape already drawn. */}
      <Banner kind="info">{KEYS.rollHint}</Banner>

      {/* S11d's Test connection (`:235`) with B20's capability list under it. `Submit` is only
          drawn where there is a key to test: with no Admin key there is nothing to press and the
          Admin row above asks for one instead (UX-DR3). */}
      {site.present.admin ? (
        <div className="flex flex-col gap-[10px]">
          <form action={testConnection} className="flex">
            <input type="hidden" name="site_id" value={site.id} />
            <Submit variant="secondary" size={36} busy={KEYS.test.busy}>
              {KEYS.test.label}
            </Submit>
          </form>
          {tested ? <TestResult result={tested} staff={site.present.staff} host={site.name} /> : null}
        </div>
      ) : null}

      <div aria-hidden className="h-px bg-line" />
      <div className="flex items-center justify-end">{cancel}</div>
    </>
  )
}

/**
 * WHAT THE PRESS PROVED, AND WHAT STILL NEEDS THE TOKEN — B20's own three rows. A failure reads
 * the SAME codes-to-sentences table every other refusal in this epic reads, so a customer never
 * meets two different sentences for one cause.
 */
function TestResult({ result, staff, host }: { result: string; staff: boolean; host: string }) {
  if (result !== 'ok') {
    return (
      <Banner kind="error">
        {hasSentence(result) ? connectMessage(result as MessageCode, host) : connectMessage('keys_failed')}
      </Banner>
    )
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
