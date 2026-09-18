'use client'

import { useActionState } from 'react'
import { BusyLabel, useSubmitting } from '@/components/kit/submit'
import { ring } from '@/components/kit/greyed'
import { HelperCaption } from '@/components/kit/labels'
import { MoonBadge } from '@/components/kit/moon-badge'
import { clearProjectDarkOverrides, setProjectMode, type SettingsResult } from './actions'

/* D6a's PROJECT-MODE BLOCK, AND NOTHING ELSE ON THE SCREEN (R-131, `D6 Theme Settings Completed.dc.html:102-121`).

   Two rows, read off the frame: "This project" over a two-segment control — `Light only` | `Light + Dark` — with its
   caption verbatim; then the bordered row carrying the moon badge with its label "Dark override", the title "Clear
   dark overrides", a sub-caption counting the sections that hold one, and a secondary Clear. D6a's footnote about the
   badge closes it.

   EVERYTHING ELSE D6a DRAWS IS ABSENT — Posts per page, Site basics, Accent colour, Credits, the whole right-hand
   custom-settings column and its "3 OF 17" meter, and D6a's own left rail. All of it is FR-Q1/Q2/Q3 and Epic 7's
   (`prd.md:816`), so R-118's rule applies a fourth time: absent, not greyed and not captioned. The Pro label D6a
   carries goes with them — dark-mode authoring is a FREE capability (`EXPERIENCE.md:715`, `:859`), and D6a is labelled
   Pro for the Credits row and the settings builder beside it, neither of which this story builds.

   THE ONE THING THAT GREYS, WITH ITS REASON, IS D6b'S CLEAR ROW (`:271-283`) — because there the overrides genuinely
   exist and are merely not in force. Its sentence is the frame's own, and so is the line under it: the overrides are
   kept, not discarded (FR-D7, AD-17).

   THE COUNT IS DERIVED by walking the project's docs (`darkOverrideCount`), never stored — standing rule 4.

   ponytail: the pill is two SUBMIT buttons rather than the Kit's `Segmented`, because a `Segmented` is a radio group
   of `type="button"` and this control has to post a form — so it says what it is doing while it saves (R-98) and
   works with JavaScript switched off, which nothing else on this screen would give it. Switch it to `Segmented` the
   day that component learns to submit. */

const TRACK = 'flex w-max rounded-pill bg-paper-sunk p-[3px]'
const SEGMENT = 'flex min-w-[104px] items-center justify-center rounded-[20px] px-[14px] py-[6px] text-[12.5px]'

export function ThemeSettings({ projectId, darkEnabled, overriddenSections }: {
  projectId: string
  darkEnabled: boolean
  /** how many sections of this project carry a dark override an emitter could use — derived, never stored */
  overriddenSections: number
}) {
  const [mode, onMode] = useActionState<SettingsResult | null, FormData>(setProjectMode, null)
  const [cleared, onClear] = useActionState<SettingsResult | null, FormData>(clearProjectDarkOverrides, null)
  const n = overriddenSections
  const carry = `${n === 0 ? 'No' : n} ${n === 1 ? 'section carries' : 'sections carry'} a dark override`

  return (
    <div className="flex max-w-[520px] flex-col gap-[14px] rounded border border-line bg-surface p-[18px] shadow-sm">
      <form action={onMode} className="flex flex-col gap-[6px]">
        <input type="hidden" name="project" value={projectId} />
        <span className="text-[12px] font-medium text-ink-soft">This project</span>
        <div className={TRACK} role="group" aria-label="This project">
          <ModeSegment on={!darkEnabled} value="off" label="Light only" busy="Saving…" />
          <ModeSegment on={darkEnabled} value="on" label="Light + Dark" busy="Saving…" />
        </div>
        <HelperCaption>Every Style Pack ships a hand-paired dark palette, so dark is already paid for.</HelperCaption>
        {mode && 'error' in mode ? <HelperCaption>{mode.error}</HelperCaption> : null}
      </form>

      <form action={onClear} className="flex flex-col gap-[6px] border-t border-line pt-[14px]">
        <input type="hidden" name="project" value={projectId} />
        <div
          data-clear-row
          data-greyed={darkEnabled ? undefined : ''}
          className={`flex items-center gap-[10px] rounded-sm border p-[9px_11px] ${
            darkEnabled ? 'border-line bg-surface' : 'border-grey-border bg-grey-field'
          }`}
        >
          <MoonBadge />
          <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
            <span className={`text-[12.5px] font-medium ${darkEnabled ? 'text-ink' : 'text-ink-faint'}`}>
              Clear dark overrides
            </span>
            <span className={`text-[11px] ${darkEnabled ? 'text-ink-soft' : 'text-ink-faint'}`}>{carry}</span>
          </div>
          <ClearButton greyed={!darkEnabled} />
        </div>
        {/* D6b's own reason, verbatim: the row is greyed about what is IN FORCE, never about what is stored */}
        {darkEnabled ? null : (
          <>
            <HelperCaption>
              {n === 0
                ? 'This project is Light only, so nothing renders a dark override. Switch to Light + Dark to design one.'
                : `This project is Light only, so nothing renders the dark overrides ${n === 1 ? 'that section' : `those ${n} sections`} still ${n === 1 ? 'holds' : 'hold'}. Switch to Light + Dark to use or clear them.`}
            </HelperCaption>
            <HelperCaption>
              The overrides are kept, not discarded — greying the row is a statement about what is in force, never
              about what is stored.
            </HelperCaption>
          </>
        )}
        {cleared && 'error' in cleared ? <HelperCaption>{cleared.error}</HelperCaption> : null}
        <HelperCaption>
          The same badge marks an overridden control in the sidebar, and it always carries the label &ldquo;Dark
          override&rdquo;.
        </HelperCaption>
      </form>
    </div>
  )
}

/** One half of D6a's pill, and a real submit control: pressed, it says what it is doing (R-98). */
function ModeSegment({ on, value, label, busy }: { on: boolean; value: 'on' | 'off'; label: string; busy: string }) {
  const { pending, guard } = useSubmitting()
  return (
    <button
      type="submit"
      name="dark"
      value={value}
      aria-pressed={on}
      onClick={guard}
      className={`${SEGMENT} ${ring} ${on ? 'bg-surface font-semibold text-ink shadow-sm' : 'font-medium text-ink-soft'}`}
    >
      <BusyLabel pending={pending && !on} busy={busy}>
        {label}
      </BusyLabel>
    </button>
  )
}

/** D6a's secondary Clear. Greyed with D6b's reason while the project is Light only — `aria-disabled`, never
 *  `disabled`, so it keeps its tab stop and its sentence is read (`greyed.ts`). */
function ClearButton({ greyed }: { greyed: boolean }) {
  const { pending, guard } = useSubmitting()
  return (
    <button
      type="submit"
      aria-disabled={greyed || pending || undefined}
      aria-busy={pending || undefined}
      onClick={(event) => {
        if (greyed) return event.preventDefault()
        guard(event)
      }}
      className={`h-7 shrink-0 rounded-[9px] border px-[11px] text-[12px] font-semibold ${ring} ${
        greyed ? 'border-grey-border bg-grey-field text-ink-faint' : 'border-line bg-surface text-ink hover:bg-paper-sunk'
      }`}
    >
      <BusyLabel pending={pending} busy="Clearing…">
        Clear
      </BusyLabel>
    </button>
  )
}
