'use client'

import { memo, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Banner } from '@/components/kit/banner'
import { closeOnBackdrop, wideSheet, wideTitle } from '@/components/kit/dialog'
import { ring } from '@/components/kit/greyed'
import { AlertTriangle, Clipboard, X } from '@/components/kit/icons'
import { TextInput } from '@/components/kit/input'
import { openPopover } from '@/components/kit/select'
import { StepperBox } from '@/components/kit/stepper'
import { hardToRead, hexOf, hexToHsv, hsvToHex, MODES, PACK_EDIT_WORDS as W, scrimStep, type PackRecord } from '@/lib/pack-edit'
import type { PackRole } from '@inflozo/section-runtime'

/* ─────────────────────────────────────────── Story 6.4 — EDIT PACK AND NEW PACK (S7c, S7d; FR-E3, NFR-5, UX-DR8).
 *
 * S7c's and S7d's dialog, as drawn (`S7 Style Packs.dc.html` S7c, S7d), and for every part they do not draw the drawing
 * that exists — the spec's Design Notes' "Built from" table (R-236): the Kit's notice `Banner` for the warning, the Kit's
 * stepper for Image scrim, S7a's pencil circle for the warning glyph. The app's one dialog vocabulary at its 520 width
 * (`kit/dialog.ts`'s `wideSheet`), opened with native `showModal()` — the focus trap, Esc and focus return are the
 * platform's — and mounted at the editor's root, inside `[data-editor]` and under no hidden ancestor (a dialog under a
 * `display: none` ancestor opens at 0 × 0), so losing the lock closes it with every other (`[data-editor] dialog[open]`,
 * DW-241) and its draft goes with it.
 *
 * THE DRAFT IS THE DIALOG'S, AND ONLY SAVE PACK MAKES AN EDIT (FR-D9): Cancel, ✕, Esc and the backdrop throw it away. A
 * draft equal to the pack saves nothing (the editor's `commitPacks` compares). Reset to defaults — a preset's alone —
 * puts the library's whole record into the draft, name included; Save then drops the own record. A New pack's draft is
 * the look in force with an empty name, and a name is asked for before anything is saved.
 *
 * THE COLOUR PICKER is S7d's popover, opened from the swatch pressed (`openPopover`, the Kit's) and inside the dialog, so
 * the first Esc closes it and the second the dialog (executed at the Create). Its square and hue strip are sliders that
 * follow pointer, touch and the arrow keys (1 a press, 10 with ⇧), spelled in `white`, `black`, `transparent` and a
 * computed `hsl()` — never a literal (`tokens.test.ts`); the hex field is the exact path; "From your site" offers the
 * linked site's own accent; Paste reads the clipboard, and where the browser refuses it, says to press ⌘V.
 *
 * THE WARNING follows the draft live — 6.2's AA pairs over it, both modes (`hardToRead`) — in words, with the banner's
 * triangle on each swatch whose words are hard to read, and NEVER A BLOCK: Save pack stays live (FR-E3, UX-DR8). It is
 * ANNOUNCED when it appears, changes pairs or clears, never once per pointer move: the banner is no live region while a
 * colour is dragged, and one polite line inside the dialog speaks when the SET of failing pairs changes.
 */

/** How the editor opens the dialog. */
export type PackEditing = {
  kind: 'edit' | 'new'
  /** the pack — `custom-<n>` for a new one */
  id: string
  /** the draft's opening value: the pack's own record — a New pack's, the look in force with no name */
  record: PackRecord
  /** a preset's library record: what Reset to defaults puts back. Absent for a pack the project made */
  defaults?: PackRecord
  /** where focus starts: the first swatch, or Pack name (a New pack, or a custom pack's name pressed) */
  focus: 'swatch' | 'name'
  /** a fresh number per open, so a pack reopened starts a fresh draft */
  n: number
}

const ROLES = Object.keys(W.roles) as PackRole[]
type Pick = { mode: (typeof MODES)[number]; role: PackRole }
type Hsv = { h: number; s: number; v: number }
const clamp = (n: number, hi: number) => Math.max(0, Math.min(hi, n))

export const PackEditor = memo(function PackEditor({
  editing,
  siteAccent,
  onSave,
  onClose,
}: {
  editing: PackEditing | null
  siteAccent: string | null
  onSave: (editing: PackEditing, record: PackRecord) => void
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = dialog.current
    if (!el || editing === null || el.open) return
    el.showModal()
    // `showModal()` would focus the ✕, the first control; focus starts where the spec puts it
    ;(editing.focus === 'name' ? el.querySelector<HTMLElement>('#pack-name') : el.querySelector<HTMLElement>('[data-swatch]'))?.focus()
  }, [editing])
  return (
    <dialog
      ref={dialog}
      data-pack-editor={editing?.kind ?? ''}
      onClick={closeOnBackdrop}
      onClose={onClose}
      aria-labelledby="pack-editor-title"
      aria-describedby="pack-editor-subtitle"
      className={wideSheet}
    >
      {editing === null ? null : (
        <PackForm
          key={editing.n}
          editing={editing}
          siteAccent={siteAccent}
          onSave={(record) => {
            onSave(editing, record)
            dialog.current?.close()
          }}
          onCancel={() => dialog.current?.close()}
        />
      )}
    </dialog>
  )
})

function PackForm({
  editing,
  siteAccent,
  onSave,
  onCancel,
}: {
  editing: PackEditing
  siteAccent: string | null
  onSave: (record: PackRecord) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(editing.record)
  const [nameError, setNameError] = useState<string | null>(null)
  const name = useRef<HTMLInputElement>(null)
  const isNew = editing.kind === 'new'

  /* ── the warning: live over the draft, announced only when its set of failing pairs changes ── */
  const hard = hardToRead(draft)
  const hardKey = hard.map((p) => `${p.mode}:${p.fg}:${p.bg}`).join('|')
  const heard = useRef('')
  const [said, setSaid] = useState('')
  useEffect(() => {
    if (hardKey === heard.current) return
    const was = heard.current
    heard.current = hardKey
    setSaid(hardKey !== '' ? W.warning(hardToRead(draft)) : was !== '' ? W.readable : '')
    // the set alone decides; the ratios ride with it
  }, [hardKey])
  const failing = (m: Pick['mode'], role: PackRole) => hard.some((p) => p.mode === m && p.fg === role)

  /* ── the colour picker ── */
  const pop = useRef<HTMLDivElement>(null)
  const hexInput = useRef<HTMLInputElement>(null)
  const [pick, setPick] = useState<Pick>({ mode: 'light', role: 'background' })
  const [open, setOpen] = useState(false)
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(editing.record.light.background))
  const [typed, setTyped] = useState(editing.record.light.background)
  const [hexError, setHexError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const colour = draft[pick.mode][pick.role]
  useEffect(() => {
    const el = pop.current
    if (!el) return
    const toggled = (event: Event) => setOpen((event as ToggleEvent).newState === 'open')
    el.addEventListener('toggle', toggled)
    return () => el.removeEventListener('toggle', toggled)
  }, [])

  const openPicker = (next: Pick, trigger: HTMLElement) => {
    const el = pop.current
    if (!el) return
    if (el.matches(':popover-open')) el.hidePopover()
    const hex = draft[next.mode][next.role]
    setPick(next)
    setHsv(hexToHsv(hex))
    setTyped(hex)
    setHexError(null)
    setHint(null)
    openPopover(el, trigger, { side: 'down', align: 'left' }, hexInput.current)
  }
  /** the draft's colour for the role being picked, and everything that shows it */
  const setColour = (hex: string, from?: Hsv) => {
    setDraft((d) => ({ ...d, [pick.mode]: { ...d[pick.mode], [pick.role]: hex } }))
    setHsv(from ?? hexToHsv(hex))
    setTyped(hex)
    setHexError(null)
    setHint(null)
  }
  const fromHsv = (next: Hsv) => setColour(hsvToHex(next), next)
  const square = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    fromHsv({ ...hsv, s: clamp(((e.clientX - r.left) / r.width) * 100, 100), v: clamp(100 - ((e.clientY - r.top) / r.height) * 100, 100) })
  }
  const hueAt = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    fromHsv({ ...hsv, h: clamp(((e.clientX - r.left) / r.width) * 360, 360) })
  }
  /** a slider's arrows: 1 a press, 10 with ⇧ */
  const arrows = (e: KeyboardEvent<HTMLDivElement>, move: (by: number, vertical: boolean) => void) => {
    const by = e.shiftKey ? 10 : 1
    const step = ({ ArrowRight: [by, false], ArrowLeft: [-by, false], ArrowUp: [by, true], ArrowDown: [-by, true] } as Record<string, [number, boolean]>)[e.key]
    if (step === undefined) return
    e.preventDefault()
    move(step[0], step[1])
  }
  const commitTyped = () => {
    const hex = hexOf(typed)
    if (hex === null) setHexError(W.notColour)
    else setColour(hex)
  }
  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const hex = hexOf(text)
      if (hex === null) {
        setTyped(text.trim())
        setHexError(W.notColour)
      } else setColour(hex)
    } catch {
      // refused or unsupported (the permission is the browser's): the field takes a ⌘V instead
      hexInput.current?.focus()
      setHint(W.pasteFallback)
    }
  }

  const save = () => {
    const trimmed = draft.name.trim()
    if (trimmed === '') {
      setNameError(W.nameNeeded)
      name.current?.focus()
      return
    }
    onSave({ ...draft, name: trimmed })
  }
  const roleWord = (role: PackRole) => W.roles[role]

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-[5px]">
          <h2 id="pack-editor-title" className={wideTitle}>
            {isNew ? W.newTitle : W.editTitle}
          </h2>
          <p id="pack-editor-subtitle" className="text-ui-dense leading-[1.5] text-ink-soft">
            {isNew ? W.newSubtitle : W.editSubtitle}
          </p>
        </div>
        <button type="button" aria-label={W.close} onClick={onCancel} className={`mt-1 shrink-0 text-ink-soft transition-colors hover:text-ink ${ring}`}>
          <X size={16} />
        </button>
      </div>

      <TextInput
        id="pack-name"
        size={40}
        label={W.name}
        placeholder={W.placeholder}
        maxLength={40}
        value={draft.name}
        inputRef={name}
        error={nameError}
        onChange={(e) => {
          const value = e.target.value
          setDraft((d) => ({ ...d, name: value }))
          setNameError(null)
        }}
      />

      <div className="flex flex-col gap-[14px]">
        {MODES.map((m) => (
          <div key={m} className="flex items-center gap-3">
            <span className="w-[34px] shrink-0 text-[11px] font-semibold leading-[normal] text-ink-soft">{W.modes[m]}</span>
            <div className="grid flex-1 grid-cols-7 gap-1">
              {ROLES.map((role) => {
                const hex = draft[m][role]
                const hardHere = failing(m, role)
                const here = open && pick.mode === m && pick.role === role
                return (
                  <button
                    key={role}
                    type="button"
                    data-swatch={`${m}-${role}`}
                    aria-label={W.swatch(roleWord(role), W.modes[m], hex, hardHere)}
                    aria-expanded={here}
                    aria-controls="pack-picker"
                    onClick={(e) => openPicker({ mode: m, role }, e.currentTarget)}
                    className={`flex flex-col items-center gap-[5px] rounded-sm ${ring}`}
                  >
                    <span aria-hidden className="relative size-9 rounded-thumb shadow-swatch" style={{ background: hex }}>
                      {hardHere ? (
                        <span data-hard className="absolute top-1 right-1 box-content inline-flex size-[15px] items-center justify-center rounded-full border border-line-strong bg-surface text-marigold-text">
                          <AlertTriangle size={8} strokeWidth={2} />
                        </span>
                      ) : null}
                    </span>
                    <span aria-hidden className="whitespace-nowrap text-[9.5px] leading-[normal] text-ink-soft">
                      {roleWord(role)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        {/* Image scrim, per mode: S7c's mode words and the Kit's stepper, 0–100 % by 5 */}
        <div className="flex items-center gap-3">
          <span className="text-control-label font-medium leading-[normal] text-ink-soft">{W.scrim}</span>
          {MODES.map((m) => (
            <span key={m} className="flex items-center gap-3">
              <span id={`pack-scrim-${m}-label`} className="relative w-[34px] shrink-0 text-[11px] font-semibold leading-[normal] text-ink-soft">
                <span className="sr-only">{`${W.scrim}, `}</span>
                {W.modes[m]}
              </span>
              <StepperBox
                id={`pack-scrim-${m}`}
                label={`${W.scrim}, ${W.modes[m]}`}
                value={W.percent(draft[m].scrim)}
                at={Math.round(draft[m].scrim * 100)}
                min={0}
                max={100}
                onStep={(by) => setDraft((d) => ({ ...d, [m]: { ...d[m], scrim: scrimStep(d[m].scrim, by) } }))}
              />
            </span>
          ))}
        </div>
      </div>

      {hard.length > 0 ? (
        <div data-pack-warning>
          <Banner kind="notice" live={false}>
            {W.warning(hard)}
          </Banner>
        </div>
      ) : null}
      <p data-pack-warning-said aria-live="polite" className="sr-only">
        {said}
      </p>

      <div className="flex items-center gap-[10px]">
        {editing.defaults === undefined ? null : (
          <button
            type="button"
            onClick={() => {
              setDraft(editing.defaults as PackRecord)
              setNameError(null)
            }}
            className={`h-[38px] rounded-thumb px-3 text-control-label font-medium text-ink-soft transition-colors hover:text-ink ${ring}`}
          >
            {W.reset}
          </button>
        )}
        <button type="button" data-cancel onClick={onCancel} className={`ml-auto h-[38px] rounded-thumb px-4 text-ui-dense font-medium text-ink-soft transition-colors hover:bg-ink-wash ${ring}`}>
          {W.cancel}
        </button>
        <button type="button" data-save-pack onClick={save} className={`h-[38px] rounded-thumb bg-ink px-[22px] text-ui-dense font-semibold text-surface transition-colors hover:bg-ink-hover ${ring}`}>
          {W.save}
        </button>
      </div>

      {/* S7d's colour picker — inside the dialog, so it is not inert under the modal and the first Esc is its */}
      <div ref={pop} id="pack-picker" popover="auto" className="overflow-visible border-0 bg-transparent p-0">
        {/* `box-content`, as S7d draws it: 206 of content inside 12 of padding and the hairline (232 across, measured) */}
        <div data-picker className="box-content flex w-[206px] flex-col gap-[10px] rounded border border-line bg-surface p-3 shadow-modal">
          <div
            role="slider"
            tabIndex={0}
            aria-label={W.square(roleWord(pick.role), W.modes[pick.mode])}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(hsv.s)}
            aria-valuetext={W.squareValue(hsv.s, hsv.v)}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              square(e)
            }}
            onPointerMove={(e) => {
              if (e.currentTarget.hasPointerCapture(e.pointerId)) square(e)
            }}
            onKeyDown={(e) => arrows(e, (by, vertical) => fromHsv(vertical ? { ...hsv, v: clamp(hsv.v + by, 100) } : { ...hsv, s: clamp(hsv.s + by, 100) }))}
            data-picker-square
            className={`relative h-[112px] w-full touch-none overflow-hidden rounded-sm ${ring}`}
            style={{ background: `linear-gradient(to top, black, transparent), linear-gradient(to right, white, hsl(${hsv.h} 100% 50%))` }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute box-content size-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] shadow-thumb"
              style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, borderColor: 'white' }}
            />
          </div>
          <div
            role="slider"
            tabIndex={0}
            aria-label={W.hue(roleWord(pick.role), W.modes[pick.mode])}
            aria-valuemin={0}
            aria-valuemax={360}
            aria-valuenow={Math.round(hsv.h)}
            aria-valuetext={W.hueValue(hsv.h)}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              hueAt(e)
            }}
            onPointerMove={(e) => {
              if (e.currentTarget.hasPointerCapture(e.pointerId)) hueAt(e)
            }}
            onKeyDown={(e) => arrows(e, (by) => fromHsv({ ...hsv, h: clamp(hsv.h + by, 360) }))}
            data-picker-hue
            className={`relative h-3 touch-none rounded-[6px] ${ring}`}
            style={{ background: 'linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))' }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 box-content size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] shadow-hue-thumb"
              style={{ left: `${(hsv.h / 360) * 100}%`, background: `hsl(${hsv.h} 100% 50%)`, borderColor: 'white' }}
            />
          </div>
          {siteAccent === null ? null : (
            <div className="flex items-center gap-[7px]">
              <span className="text-[10px] leading-[normal] text-ink-soft">{W.fromSite}</span>
              <button
                type="button"
                data-from-site
                aria-label={`${W.fromSite}, ${siteAccent}`}
                onClick={() => setColour(siteAccent)}
                className={`size-4 rounded-full ${ring}`}
                style={{ background: siteAccent }}
              />
            </div>
          )}
          <div className="flex items-start gap-[7px] border-t border-line pt-[10px]">
            <span aria-hidden className="mt-1 size-[22px] shrink-0 rounded-[6px] shadow-hairline-inset" style={{ background: colour }} />
            <TextInput
              id="pack-picker-hex"
              size={30}
              mono
              labelHidden
              label={W.hexField(roleWord(pick.role), W.modes[pick.mode])}
              value={typed}
              inputRef={hexInput}
              error={hexError}
              hint={hint}
              className="min-w-0 flex-1"
              autoComplete="off"
              onChange={(e) => {
                const value = e.target.value
                setTyped(value)
                setHexError(null)
                const hex = hexOf(value)
                if (hex !== null) {
                  setDraft((d) => ({ ...d, [pick.mode]: { ...d[pick.mode], [pick.role]: hex } }))
                  setHsv(hexToHsv(hex))
                }
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                e.preventDefault()
                commitTyped()
              }}
              onBlur={commitTyped}
            />
            <button
              type="button"
              aria-label={W.paste}
              title={W.paste}
              onClick={() => void paste()}
              className={`box-content inline-flex size-[30px] shrink-0 items-center justify-center rounded-sm border border-line bg-surface text-ink-soft ${ring}`}
            >
              <Clipboard size={13} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
