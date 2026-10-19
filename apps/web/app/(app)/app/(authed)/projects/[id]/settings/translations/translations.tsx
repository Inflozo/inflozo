'use client'

import Link from 'next/link'
import { Fragment, startTransition, useActionState, useEffect, useRef, useState, useSyncExternalStore, type MouseEvent } from 'react'
import { isRtl, languageRefusal, LANGUAGES, scriptOf, type Script } from '@inflozo/library/languages'
import { Banner } from '@/components/kit/banner'
import { Button } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel, sheet, title } from '@/components/kit/dialog'
import { ReadOnly, ring } from '@/components/kit/greyed'
import { AlertTriangle, ChevronDown } from '@/components/kit/icons'
import { TextInput } from '@/components/kit/input'
import { HelperCaption } from '@/components/kit/labels'
import { Menu, openPopover, type MenuItem } from '@/components/kit/select'
import { BusyLabel, Submit, useSubmitting } from '@/components/kit/submit'
import { LOCK_COPY } from '@/lib/lock'
import { storedTabSession } from '@/lib/lock-client'
import { arrowKeys } from '@/lib/menu'
import { settingsReadOnly } from '@/lib/theme-settings'
import { coverageWords, ownName, siteLocaleDiffers, TRANSLATION_WORDS as W, type Coverage, type UntouchedRow } from '@/lib/translations'
import { resetOverride, saveOverride, setLanguage, type TranslationResult } from './actions'

/* B18, AS EXPERIENCE.md:747 RE-SPECIFIES IT (`B Missing Surfaces.dc.html:1768-1803`; Story 7.12, FR-Q6, FR-Q8) — the card at
   B18's 940: the header with the title and B18's sentence verbatim and the language button with its mono code (`:1776-1780`);
   the `180px 1fr 1fr` grid KEY · ENGLISH DEFAULT · the language's own name upper-cased (`:1782-1785`); one row per key of
   `translatableKeys()`, mono dotted keys on alternating rows; the refused row in B18's look — danger tint, `danger-panel-ink`
   key, `danger-text` border, the sentence under the input (`:1790-1791`); "Falls back to English" in italic muted for a row
   with no override (`:1792`); and Appendix G's marigold block with Understood (`:1794-1801`).

   EXTRAPOLATED FROM THE KIT where B18 draws nothing (R-74): each row's field is the Kit's 30px `TextInput` (B18's 32px focused
   input), its Save a `Submit` that shows while the row is being edited, and Use the default a link-weight submit under it
   while an override is stored; the menu is the Kit's `Menu` in `openPopover`'s popover; the scope sentence a caption under
   B18's; the coverage captions (§D.b) a strip under the header, at the moment of choice and before any save; the site's own
   language a `Banner` notice; the switch confirm a `dialog.ts` sheet opening on Cancel (R-134); Question 1's list a strip at
   the card's foot.

   THE RTL BLOCK IS B18's OWN STRIP (`:1794-1801`: the raised ground, the warning sign, the marigold title and sentence, and
   Understood at 30px on the right), but it SITS UNDER THE HEADER, NOT AT THE CARD'S FOOT where B18 draws it: B18's foot is
   under seven rows, this list's is under every key, and the strip is what a choice of Arabic answers with while the button
   keeps the stored language (review, 2026-10-15: it had been the Kit's notice Banner, which B18 does not draw).

   READING ALONG (R-192): while another session holds the project's lock the card is the Kit's `ReadOnly` — every field, Save,
   Use the default, the language button and Understood disabled and dimmed, every value readable — and LOCK_COPY says why.
   The Edit links of Question 1's list navigate, so they stay live. */

const noSubscribe = () => () => {}
/** this tab's lock id — `null` for none, and for one copied from another open tab (`lib/lock-client.ts`) */
const tabSession = (): string | null => storedTabSession()

const LINK = `shrink-0 rounded-sm text-[11.5px] font-medium text-sky-text hover:underline ${ring}`
const alertOf = (state: TranslationResult | null) => (state && 'error' in state ? state.error : null)

export function Translations({
  projectId,
  language,
  rtlAck,
  rows,
  stored,
  refused,
  names,
  coverage,
  siteLocale,
  admin,
  untouched,
  holder,
}: {
  projectId: string
  /** `projects.language`, exactly as stored */
  language: string
  /** `projects.rtl_ack_at` */
  rtlAck: string | null
  /** every key of `translatableKeys()`, in catalog order, with its English default */
  rows: readonly { key: string; en: string }[]
  /** every stored override, by key — a refused one included, so its row shows what is stored */
  stored: Readonly<Record<string, string>>
  /** the sentence refusing each stored override `overrideRefusal` refuses (a direct table write, AD-6) */
  refused: Readonly<Record<string, string>>
  /** each listed language's own name, computed on the server so both renders agree */
  names: Readonly<Record<string, string>>
  /** the project's pairing's coverage of every script but Latin (`coverageOf`), computed on the server — no font pool here */
  coverage: Readonly<Partial<Record<Script, Coverage>>>
  /** the linked site's stored Ghost language, or null */
  siteLocale: string | null
  /** Ghost's Publication Language for the linked site, or null */
  admin: string | null
  /** Question 1's rows */
  untouched: readonly UntouchedRow[]
  /** the session holding the project's lock while it is live, or null */
  holder: string | null
}) {
  const readOnly = useSyncExternalStore(noSubscribe, () => settingsReadOnly(holder, tabSession()), () => holder !== null)
  const [state, dispatch, saving] = useActionState<TranslationResult | null, FormData>(setLanguage, null)
  // a language chosen and not yet stored: a right-to-left one waits for Understood, a switch over overrides for its confirm
  const [pending, setPending] = useState<string | null>(null)
  const [other, setOther] = useState(false)
  const confirm = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (!state) return
    // the sheet closes on ANY answer, so a refusal drawn under the header is seen (Story 7.10's review); nothing waits after one
    confirm.current?.close()
    setPending(null)
    if ('ok' in state) setOther(false)
  }, [state])

  const hasOverrides = Object.keys(stored).length > 0
  const nameOf = (code: string) => names[code] ?? ownName(code)
  const chosen = pending ?? language
  const script = scriptOf(chosen)
  const captions = coverageWords(coverage[script], script, nameOf(chosen))
  const needsConfirm = (code: string) => hasOverrides && code !== language

  /** A language picked from the menu or typed under Other…: right-to-left waits for Understood, a switch over stored
   *  overrides asks first, anything else saves at once. A choice from the menu closes Other… (review, 2026-10-15). */
  const choose = (code: string) => {
    setOther(false)
    setPending(code === language ? null : code)
    if (code === language || isRtl(code)) return
    if (needsConfirm(code)) {
      openOnCancel(confirm.current)
      return
    }
    const data = new FormData()
    data.set('project', projectId)
    data.set('language', code)
    startTransition(() => dispatch(data))
  }

  const items: MenuItem[] = [
    ...LANGUAGES.map((l) => ({
      label: nameOf(l.code),
      active: l.code === language,
      contents: (
        <span data-code={l.code} className="flex min-w-0 flex-1 items-center gap-2">
          <span className="min-w-0 flex-1 truncate">{nameOf(l.code)}</span>
          <span className="font-mono text-[10px] text-ink-soft-aa">{l.code}</span>
        </span>
      ),
      onSelect: () => choose(l.code),
    })),
    { label: W.other, active: !LANGUAGES.some((l) => l.code === language), onSelect: () => setOther(true) },
  ]

  // Appendix G: the block shows for a right-to-left language chosen or stored; Understood acknowledges the one waiting
  const rtlTarget = pending !== null && isRtl(pending) ? pending : isRtl(language) && rtlAck === null ? language : null
  const rtlShown = rtlTarget !== null || isRtl(language)
  const column = nameOf(language).toUpperCase()

  return (
    <>
      {readOnly ? <Banner kind="info">{LOCK_COPY.reading}</Banner> : null}
      <div data-readonly={readOnly ? '' : undefined} className={readOnly ? 'opacity-[.55]' : undefined}>
        <ReadOnly on={readOnly}>
          <section aria-labelledby="translations-title" data-translations className="max-w-[940px] overflow-hidden rounded-sm border border-line bg-paper shadow-md">
            <div className="flex flex-wrap items-center gap-[11px] border-b border-line p-[16px_18px]">
              <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <h2 id="translations-title" className="text-[15px] font-semibold text-ink">{W.title}</h2>
                <span className="text-[12px] leading-[1.5] text-ink-soft">
                  {W.lead} <span className="font-mono text-[11px]">{W.folder}</span>.
                </span>
                <span data-scope className="text-[11.5px] leading-[1.5] text-ink-soft">{W.scope}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span role="status" className="text-helper-caption text-ink-soft">{saving ? W.saving : ''}</span>
                <button
                  type="button"
                  id="language"
                  data-language={language}
                  aria-label={`${W.language}: ${nameOf(language)}`}
                  popoverTarget="language-menu"
                  onClick={(event) => {
                    const pop = document.getElementById('language-menu')
                    if (!pop) return
                    // focus lands on the language in force, and the long list scrolls to it (`openPopover` focuses without scrolling)
                    const current = pop.querySelector<HTMLElement>('[aria-current="true"]')
                    openPopover(pop, event.currentTarget, { side: 'down', align: 'right' }, current)
                    requestAnimationFrame(() => requestAnimationFrame(() => current?.scrollIntoView({ block: 'nearest' })))
                  }}
                  className={`flex h-[34px] items-center gap-[7px] rounded-sm border border-line bg-surface px-[10px] hover:border-line-strong disabled:cursor-not-allowed disabled:hover:border-line ${ring}`}
                >
                  <span className="text-[12.5px] font-semibold text-ink">{nameOf(language)}</span>
                  <span className="font-mono text-[10px] text-ink-soft-aa">{language}</span>
                  <ChevronDown size={11} className="text-ink-soft" />
                </button>
                <div id="language-menu" popover="auto" onKeyDown={arrowKeys} className="border-0 bg-transparent p-0">
                  <Menu label={W.language} width="w-[260px]" items={items} />
                </div>
              </div>
            </div>

            {other ? (
              <OtherField
                projectId={projectId}
                dispatch={dispatch}
                // a code that waits (Understood, the confirm) or changes nothing is the menu's way; any other posts the field
                takeOver={(code) => {
                  if (code === language || isRtl(code) || needsConfirm(code)) {
                    choose(code)
                    return true
                  }
                  setPending(code)
                  return false
                }}
              />
            ) : null}
            {alertOf(state) === null ? null : (
              <div role="alert" className="border-b border-line px-[18px] py-[9px]"><HelperCaption>{alertOf(state)}</HelperCaption></div>
            )}
            {captions.length === 0 ? null : (
              <div role="status" data-coverage={script} className="flex flex-col gap-[3px] border-b border-line px-[18px] py-[10px]">
                {captions.map((c) => <HelperCaption key={c}>{c}</HelperCaption>)}
              </div>
            )}
            {siteLocaleDiffers(language, siteLocale) && admin !== null ? (
              <div data-mismatch className="border-b border-line px-[18px] py-[12px]">
                <Banner kind="notice">
                  {W.mismatch(siteLocale)}{' '}
                  <a href={admin} target="_blank" rel="noreferrer" className="font-semibold text-sky-text underline underline-offset-2">
                    {W.changeIn(language)}
                    <span className="sr-only">{W.newTab}</span>
                  </a>
                </Banner>
              </div>
            ) : null}
            {rtlShown ? (
              <div data-rtl className="flex items-start gap-[10px] border-b border-line bg-paper-raised p-[13px_18px]">
                <AlertTriangle size={14} className="mt-[2px] shrink-0 text-marigold-text" />
                <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
                  <span className="text-[12.5px] font-semibold text-marigold-ink">{W.rtlTitle}</span>
                  <span className="text-[11.5px] leading-[1.5] text-marigold-text">{W.rtlBody}</span>
                  {rtlTarget === null && rtlAck !== null ? (
                    <span data-acknowledged className="text-[11.5px] leading-[1.5] text-marigold-text">{W.acknowledged(rtlAck)}</span>
                  ) : null}
                </div>
                {rtlTarget === null ? null : (
                  <form action={dispatch} className="shrink-0">
                    <input type="hidden" name="project" value={projectId} />
                    <input type="hidden" name="language" value={rtlTarget} />
                    <input type="hidden" name="acknowledged" value="yes" />
                    <UnderstoodButton
                      // over stored overrides a change of language asks first; the sheet posts the acknowledgement too
                      onClick={(event) => {
                        if (!needsConfirm(rtlTarget)) return
                        event.preventDefault()
                        openOnCancel(confirm.current)
                      }}
                    />
                  </form>
                )}
              </div>
            ) : null}

            <div aria-hidden data-columns className="hidden grid-cols-[180px_1fr_1fr] border-b border-line bg-paper-sunk tablet:grid">
              <span className="px-[14px] py-2 text-[10.5px] font-semibold tracking-[0.04em] text-ink-soft">{W.key}</span>
              <span className="px-[14px] py-2 text-[10.5px] font-semibold tracking-[0.04em] text-ink-soft">{W.english}</span>
              <span data-column className="px-[14px] py-2 text-[10.5px] font-semibold tracking-[0.04em] text-ink-soft">{column}</span>
            </div>
            {/* the rows' ground is the surface, so an odd row's raised half-wash is B18's alternate ground (`:1787`), not a wash of paper */}
            <ul aria-labelledby="translations-title" className="list-none bg-surface">
              {rows.map((r, n) => (
                <Row
                  key={r.key}
                  projectId={projectId}
                  row={r}
                  stored={stored[r.key]}
                  refused={refused[r.key] ?? null}
                  odd={n % 2 === 1}
                  placeholder={language === 'en' ? W.usesDefault : W.fallsBack}
                />
              ))}
            </ul>

            {language === 'en' || untouched.length === 0 ? null : (
              <section aria-labelledby="untouched-title" data-untouched className="flex flex-col gap-[6px] border-t border-line bg-paper-raised p-[13px_18px]">
                <h3 id="untouched-title" className="text-[12.5px] font-semibold text-ink">{W.untouchedTitle}</h3>
                <p className="text-[11.5px] leading-[1.5] text-ink-soft">{W.untouchedLead}</p>
                <ul className="flex list-none flex-col gap-[6px]">
                  {untouched.map((u) => (
                    <li key={u.id} data-untouched-row={u.id} className="flex items-start gap-3 text-[12px] leading-[1.5]">
                      <span className="min-w-0 flex-1 text-ink-mid">
                        <span className="font-semibold text-ink">{W.untouchedOn(u.layer, u.canvas)}</span> {W.quoted(u.words)}
                      </span>
                      <Link href={u.href} className={LINK}>{W.edit}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </section>

          {/* the switch confirm (R-134): both languages named, focus on Cancel, and Switch a real submit that says it is busy */}
          <form action={dispatch}>
            <input type="hidden" name="project" value={projectId} />
            <input type="hidden" name="language" value={pending ?? ''} />
            {pending !== null && isRtl(pending) ? <input type="hidden" name="acknowledged" value="yes" /> : null}
            <dialog
              ref={confirm}
              onClick={closeOnBackdrop}
              // Cancel, Escape or the backdrop: the stored language stands and nothing waits
              onClose={() => setPending(null)}
              aria-labelledby="switch-title"
              aria-describedby="switch-body"
              className={`${sheet} gap-[18px]`}
            >
              <div className="flex flex-col gap-[6px]">
                <h2 id="switch-title" className={title}>{pending === null ? '' : W.switchTitle(nameOf(pending))}</h2>
                <p id="switch-body" className="text-ui-dense leading-[1.55] text-ink-soft">{pending === null ? '' : W.switchBody(nameOf(pending), nameOf(language))}</p>
              </div>
              <div className="flex justify-end gap-[10px]">
                <Button type="button" variant="secondary" size={36} data-cancel onClick={() => confirm.current?.close()}>
                  {W.cancel}
                </Button>
                <Submit busy={W.switching} variant="primary" size={36} name="confirmed" value="yes">
                  {W.switch}
                </Submit>
              </div>
            </dialog>
          </form>
        </ReadOnly>
      </div>
    </>
  )
}

/** Other…: a code Ghost's list does not hold, checked with Ghost's own rule before anything is sent (the action checks it
 *  again). A right-to-left code or a switch over overrides goes the way a menu choice goes. */
function OtherField({ projectId, dispatch, takeOver }: {
  projectId: string
  dispatch: (data: FormData) => void
  /** true where the page took the code its own way; false, and the form posts it */
  takeOver: (code: string) => boolean
}) {
  const [code, setCode] = useState('')
  const [refusal, setRefusal] = useState<string | null>(null)
  // opened from the menu, whose popover hands focus back to the language button: the field takes it instead
  const field = useRef<HTMLInputElement>(null)
  useEffect(() => field.current?.focus(), [])
  return (
    <form action={dispatch} data-other className="flex items-start gap-[6px] border-b border-line px-[18px] py-[10px]">
      <input type="hidden" name="project" value={projectId} />
      <TextInput
        id="language-other"
        inputRef={field}
        label={W.otherLabel}
        name="language"
        value={code}
        onChange={(e) => {
          setCode(e.target.value)
          setRefusal(null)
        }}
        mono
        size={30}
        placeholder={W.otherExample}
        error={refusal}
        className="min-w-0 max-w-[260px] flex-1"
      />
      <span className="pt-[19px]">
        <Submit
          busy={W.saving}
          variant="secondary"
          size={32}
          onClick={(event) => {
            const refused = languageRefusal(code)
            if (refused !== null) {
              event.preventDefault()
              setRefusal(refused)
              return
            }
            if (takeOver(code)) event.preventDefault()
          }}
        >
          {W.save}
        </Submit>
      </span>
    </form>
  )
}

/** One key: B18's row — the mono key, the English default, and the override's field. Both forms answer into ONE state, so the
 *  row shows the last answer whichever button gave it. The field is controlled, so a refusal keeps what was typed (React
 *  resets a form after every action), and it follows the stored value whenever that changes. */
function Row({ projectId, row, stored, refused, odd, placeholder }: {
  projectId: string
  row: { key: string; en: string }
  stored: string | undefined
  refused: string | null
  odd: boolean
  placeholder: string
}) {
  const [answer, act] = useActionState<TranslationResult | null, FormData>(
    (previous, data) => (data.get('intent') === 'reset' ? resetOverride(previous, data) : saveOverride(previous, data)),
    null,
  )
  const [value, setValue] = useState(stored ?? '')
  // the stored value moved (a save, Use the default): the field follows it — React's "adjust state on a prop change"
  const [seen, setSeen] = useState(stored)
  if (seen !== stored) {
    setSeen(stored)
    setValue(stored ?? '')
  }
  const error = alertOf(answer) ?? (refused !== null && value === stored ? refused : null)
  const dirty = value !== (stored ?? '')
  const id = `t-${row.key}`
  return (
    <li
      data-key={row.key}
      data-refused={error === null ? undefined : ''}
      className={`group grid grid-cols-1 border-b border-line-faint tablet:grid-cols-[180px_1fr_1fr] ${error !== null ? 'bg-danger-tint' : odd ? 'bg-paper-raised/50' : 'bg-surface'}`}
    >
      <span className={`px-[14px] pt-[11px] font-mono text-[10.5px] tablet:py-[11px] ${error !== null ? 'text-danger-panel-ink' : 'text-ink-soft-aa'}`}>
        {/* a key longer than B18's 180px column breaks after a dot or an underscore, never inside a word */}
        {row.key.split(/(?<=[._])/).map((part, i) => <Fragment key={i}>{part}<wbr /></Fragment>)}
      </span>
      <span className="px-[14px] py-1 text-[12.5px] text-ink-mid tablet:py-[11px]">{row.en}</span>
      <div className="flex min-w-0 flex-col gap-[3px] px-[14px] pb-[9px] tablet:py-[7px]">
        <form action={act} className="flex items-start gap-[6px]">
          <input type="hidden" name="project" value={projectId} />
          <input type="hidden" name="key" value={row.key} />
          <input type="hidden" name="intent" value="save" />
          <TextInput
            id={id}
            label={`${row.key}: ${row.en}`}
            labelHidden
            name="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            size={30}
            error={error}
            // B18's empty row in italic, and its refused row's `danger-text` border and `danger-panel-ink` words and sentence
            className={`min-w-0 flex-1 [&_input]:placeholder:italic ${error === null ? '' : '[&_input]:border-danger-text [&_input]:text-danger-panel-ink [&_[role=alert]]:text-danger-panel-ink'}`}
          />
          {/* Save shows while the row is being edited — its field focused, its words changed, or refused */}
          <span className={dirty || error !== null ? '' : 'invisible group-focus-within:visible'}>
            <Submit busy={W.saving} variant="secondary" size={32}>{W.save}</Submit>
          </span>
        </form>
        {stored === undefined ? null : (
          <form action={act}>
            <input type="hidden" name="project" value={projectId} />
            <input type="hidden" name="key" value={row.key} />
            <input type="hidden" name="intent" value="reset" />
            <ResetButton />
          </form>
        )}
      </div>
    </li>
  )
}

/** B18's Understood (`:1800`): 30px, white, the strip's marigold edge and ink, radius 9 — not the Kit's 32px secondary, whose
 *  classes would contend with these in one utility layer — saying so while it works (R-98). The caller's `onClick` runs
 *  first, so a click it cancels never claims the slot. */
function UnderstoodButton({ onClick }: { onClick: (event: MouseEvent<HTMLButtonElement>) => void }) {
  const { pending, guard } = useSubmitting()
  return (
    <button
      type="submit"
      onClick={(event) => {
        onClick(event)
        guard(event)
      }}
      aria-disabled={pending || undefined}
      aria-busy={pending || undefined}
      className={`inline-flex h-[30px] items-center rounded-[9px] border border-marigold-edge bg-surface px-[11px] text-[11.5px] font-semibold text-marigold-ink ${ring}`}
    >
      <BusyLabel pending={pending} busy={W.saving}>{W.understood}</BusyLabel>
    </button>
  )
}

/** Use the default (R-106: its own action), at a link's weight under the field, saying so while it works (R-98). */
function ResetButton() {
  const { pending, guard } = useSubmitting()
  return (
    <button
      type="submit"
      onClick={guard}
      aria-disabled={pending || undefined}
      aria-busy={pending || undefined}
      className={`self-start rounded-sm text-[11.5px] font-medium text-sky-text hover:underline ${ring}`}
    >
      <BusyLabel pending={pending} busy={W.resetting}>{W.reset}</BusyLabel>
    </button>
  )
}
