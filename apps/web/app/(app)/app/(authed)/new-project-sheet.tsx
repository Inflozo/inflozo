'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef, useState } from 'react'
import { Banner } from '@/components/kit/banner'
import { Button, IconButton } from '@/components/kit/button'
import { ring } from '@/components/kit/greyed'
import { AlertCircle, X } from '@/components/kit/icons'
import { PackCell } from '@/components/kit/pack-cell'
import { STARTER_DOOR, type Door } from '@/lib/first-run'
import { DEFAULT_PRESET, PACK_WORDS, type PackCellData } from '@/lib/pack-switch'
import { capSentence, goProLabel, includesProjects, type PlanId } from '@/lib/plan'
import { NEW_PROJECT_DIALOG } from '@/lib/projects'
import { createProject, type ActionResult } from './projects/actions'

/* ─────────────────── D4 Dashboard Sheets and Blocks.dc.html — D4a, and D4b at the cap.

   A DOOR STAYS DRAWN AND CARRIES ITS REASON. That sentence is D4a's own caption and it is a
   design instruction, not a note: a door the customer can't open is still information about
   the product. Blank canvas is the one live door in this story and is selected; the others are
   greyed in P0-0's treatment with one sentence each in the helper-caption slot (UX-DR3 —
   greyed WITH the reason, never a tooltip).

   THE DUPLICATE DOOR IS THE ONE EXCEPTION AND IT IS GONE, on the owner's ruling of 2026-09-06
   (R-93, spec question 3, option 1): "Remove option of 'Duplicating a project' as they can
   directly click on the three dots menu of a project and click duplicate." Duplicating is an
   action on a project already in front of the user, and `project-menu.tsx` is where this story
   built it — one way to do one thing. The caption still governs the three doors that remain,
   FR-B2 is amended to match, and the EXPORT IS NOT EDITED: D4a and D4b keep four doors and the
   spec is the record that the product diverges from them here, deliberately (R-74).

   Two controls the frame draws are ABSENT rather than greyed, and that is the other half of
   the same rule — there is nothing behind them to open at all: the Redesign door's "Connect a
   site" button (E3), and the project picker that sat inside the door now removed.

   THE STYLE PACK ROW IS D4a's CHOICE (Story 6.3, DW-322's first door): every preset as D4a
   draws its cells — the twelve in §D.d's order in its three-column grid (four rows, not D4a's
   two), Paper checked — without the pencils and the New pack cell (the pack editor is Story
   6.4's). Each is a NATIVE RADIO, `name="preset"`, inside the form: the arrows move between them,
   Tab passes the group as one stop, and the cell is its label's picture — ringed on `:checked`
   and wearing the Kit's focus ring when its radio has focus. `createProject` writes the one
   chosen (a value that is no preset is Paper, `presetIdOf`'s rule). The cells arrive as data
   (`packCells`, from the server), so this client module carries nothing of the font pool (DW-323).
   The sheet scrolls inside itself where the window is short.

   AT THE CAP THE SAME DIALOG IS D4b — every door greyed with the plan's pill instead of a
   reason, no Style Pack row, the upgrade block, and Create project drawn disabled. The page
   decides which from the project count; an `at_cap` that arrives anyway (a race) flips it. */

/* THE STARTER DOOR IS NOT THIS FILE'S ANY MORE (Story 3.8). S2a draws the same door on `/start`,
   and two surfaces describing a starter in two sentences is a disagreement waiting to happen — so
   both import `STARTER_DOOR` from `lib/first-run.ts` and `first-run.test.ts` asserts that neither
   keeps a copy. The `Door` shape travels with it; it was identical on both sides. */
const DOORS: Door[] = [
  { title: 'Blank canvas', consequence: 'An empty page and every design.' },
  STARTER_DOOR,
  {
    title: 'Redesign one of my sites',
    consequence: 'We look at your posts and suggest whole-site designs.',
    // The frame's own sentence, reused where it is still true today.
    reason: 'Connect a Ghost site first.',
  },
]

const doorBox = 'flex gap-[11px] rounded-thumb border p-[12px_13px]'

function Radio({ on, greyed }: { on: boolean; greyed: boolean }) {
  return (
    <span
      aria-hidden
      className={`mt-px inline-flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
        on ? 'border-coral' : greyed ? 'border-grey-border bg-paper' : 'border-line-strong'
      }`}
    >
      {on ? <span className="size-2 rounded-full bg-coral" /> : null}
    </span>
  )
}

/** D4a's greyed door: P0-0's field, border and ink, with the reason under the consequence. */
function GreyedDoor({ door, pill }: { door: Door; pill?: string }) {
  return (
    // `aria-disabled` ON THE CONTAINER is the kit's own greyed treatment (`greyedProps`, and
    // the note beside the cursor rule in globals.css), and it is doing two jobs here. It says
    // the door is an inactive option, which is what it is; and it is what makes the P0-0 grey
    // legitimate to axe-core, whose colour-contrast rule skips an aria-disabled element and its
    // descendants — WCAG 1.4.3's own "inactive user interface component" exemption, which a
    // tool cannot infer any other way. Executed: `ink-faint` on `grey-field` is 2.2:1 and was
    // reported six times on D4a until this attribute was here.
    <li aria-disabled className={`${doorBox} cursor-not-allowed border-line bg-grey-field`}>
      <Radio on={false} greyed />
      <span className="flex flex-1 flex-col gap-[3px]">
        <span className="text-ui-dense font-semibold text-ink-faint">{door.title}</span>
        <span className="text-control-label text-ink-faint">{door.consequence}</span>
        {pill ? null : (
          <span className="mt-[2px] inline-flex items-center gap-[6px] text-[11.5px] text-marigold-text">
            <AlertCircle size={12} className="shrink-0" />
            {door.reason}
          </span>
        )}
      </span>
      {pill ? (
        <span className="shrink-0 self-center rounded-pill bg-marigold-tint px-[10px] py-[3px] text-[11.5px] text-marigold-text">
          {pill}
        </span>
      ) : null}
    </li>
  )
}

/**
 * D4b's call to action, as D4b draws it: a SOLID GOLD BUTTON — 38px, radius 12, 13.5px/600,
 * white on gold — on the warm tinted card below. It was built as S3c's quieter marigold-tint
 * pill so that one call to action had one look, and the owner read the result as the card not
 * being prominent enough (his finding 3, 2026-09-06). The frame is what he is owed, and S3c's
 * tile in the grid keeps its own pill because that is what S3 draws there.
 *
 * The fill is `marigold-solid`, which is the frame's HOVER gold rather than its resting one:
 * white on the resting gold is 3.61:1 and fails WCAG AA at this size, so the shade is the
 * frame's own next one down (4.74:1) and the hover goes one further to `marigold-text`
 * (5.54:1). Both values are the frame's, and globals.css carries them by name — no hex reaches
 * a .tsx, which is the token gate's whole point. THE OWNER RULED FOR THIS SHADE on 2026-09-06
 * (spec question 4, option 1), so it is settled and not a placeholder.
 */
const GoPro = () => (
  <Link
    href="/billing"
    className={`inline-flex h-[38px] shrink-0 items-center rounded bg-marigold-solid px-[18px] text-[13.5px] font-semibold text-surface transition-colors hover:bg-marigold-text ${ring}`}
  >
    {goProLabel()}
  </Link>
)

/**
 * `atCap` is the page's count against the plan's cap. `plan` names the sentences: on Pro the
 * pills and the block read "Pro includes 25 projects" and there is no Go Pro, because there is
 * nothing further to sell. Every figure comes from `lib/plan.ts`, never from this file.
 */
export function NewProjectSheet({ atCap, plan, packs }: { atCap: boolean; plan: PlanId; packs: readonly PackCellData[] }) {
  const dialog = useRef<HTMLDialogElement>(null)
  /** Story 6.3 — the pack chosen. CONTROLLED (review, 2026-10-04): React resets a form's uncontrolled fields once its
   *  action answers, so a Create that failed put Paper back under the Banner and the retry made a Paper project. A sheet
   *  closed and opened again starts on Paper. */
  const [preset, setPreset] = useState(DEFAULT_PRESET)
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(createProject, null)
  // A result the sheet was CLOSED on is spent — reopened, no stale Banner (review, 2026-09-05), and
  // no stale D4b either: the `at_cap` action revalidated the page before answering, so the `atCap`
  // PROP is the truth from then on, and a `raced` that outlived it kept the sheet at D4b after a
  // delete had made room (review, 2026-09-06).
  const [seen, setSeen] = useState<ActionResult | null>(null)
  // One submit at a time. A ref and not `pending`: `pending` is state and turns true on the NEXT
  // render, so two submits in the same tick both read it false — executed, three `requestSubmit()`
  // calls made three projects on Pro. The ref is set synchronously in the handler and released
  // when the action has settled (review, 2026-09-06).
  const inFlight = useRef(false)

  useEffect(() => {
    if (state && 'ok' in state) dialog.current?.close()
  }, [state])
  useEffect(() => {
    if (!pending) inFlight.current = false
  }, [pending])

  const raced = state !== seen && Boolean(state && 'error' in state && state.error.code === 'at_cap')
  const capped = atCap || raced
  const failed =
    state !== seen && state && 'error' in state && state.error.code === 'failed' ? state.error.message : null

  return (
    <dialog
      ref={dialog}
      id={NEW_PROJECT_DIALOG}
      aria-labelledby="new-project-title"
      onClose={() => {
        setSeen(state)
        setPreset(DEFAULT_PRESET)
      }}
      // `m-auto`: Preflight resets the UA's centring margin — see project-menu.tsx. Story 6.3: and it scrolls inside
      // itself where the window is shorter than the twelve packs make it
      className="m-auto max-h-[calc(100dvh-20px)] w-[560px] max-w-[calc(100vw-20px)] flex-col gap-5 overflow-y-auto rounded-lg bg-surface p-[26px] shadow-modal backdrop:bg-scrim open:flex"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id="new-project-title" className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">
          New project
        </h2>
        <IconButton label="Close" onClick={() => dialog.current?.close()}>
          <X size={16} />
        </IconButton>
      </div>

      {failed ? <Banner kind="error">{failed}</Banner> : null}

      {/* `role="list"`: Safari drops a `list-style: none` list's semantics without it. */}
      <ul role="list" className={`flex list-none flex-col ${capped ? 'gap-[9px]' : 'gap-[10px]'}`}>
        {DOORS.map((door) =>
          capped || door.reason ? (
            <GreyedDoor
              key={door.title}
              door={door}
              pill={capped ? includesProjects(plan) : undefined}
            />
          ) : (
            // The one live door, and it is the selected one. A single choice needs no
            // radiogroup to move between, so it is drawn as the frame draws it. The coral ring
            // and the filled dot say "selected" to the eye and the dot is `aria-hidden`, so the
            // word itself is what carries it to a screen reader — the comment used to claim an
            // announcement the markup never made (review, 2026-09-06).
            <li key={door.title} className={`${doorBox} border-coral bg-coral-tint`}>
              <Radio on greyed={false} />
              <span className="sr-only">Selected</span>
              <span className="flex flex-1 flex-col gap-[2px]">
                <span className="text-ui-dense font-semibold text-ink">{door.title}</span>
                <span className="text-control-label text-ink-soft">{door.consequence}</span>
              </span>
            </li>
          ),
        )}
      </ul>

      {/* Story 6.3 — the form holds the Style Pack row's radios as well as the buttons; `contents`, so the dialog's own
          column lays its two parts out exactly as it laid out the row and the buttons before */}
      <form
        action={action}
        // A second submit while the first is in flight is refused HERE, not by the button's label:
        // the kit's `Button` is never `disabled` and React queues form actions rather than dropping
        // them, so two quick clicks on Pro were two projects (review, 2026-09-06).
        onSubmit={(event) => {
          if (inFlight.current) event.preventDefault()
          else inFlight.current = true
        }}
        className="contents"
      >
      {capped ? (
        // D4b :160 — the warm tinted card, hairline and fill both the frame's.
        <div className="flex items-center gap-[13px] rounded border border-marigold-line bg-marigold-tint-soft p-[14px_16px]">
          <div className="flex flex-1 flex-col gap-[3px]">
            <span id="new-project-cap" className="text-[13.5px] font-semibold text-ink">
              {capSentence(plan)}
            </span>
            <span className="text-control-label leading-[1.5] text-ink-soft-aa">
              Your project stays exactly as it is either way.
            </span>
          </div>
          {plan === 'free' ? <GoPro /> : null}
        </div>
      ) : (
        // the group is named by its row's own words (a legend would have to stand first, alone, outside the row D4a draws)
        <fieldset data-new-project-packs aria-labelledby="new-project-packs" className="flex min-w-0 flex-col gap-[9px] border-t border-line pt-[18px]">
          <div className="flex items-center gap-2">
            <span id="new-project-packs" className="text-control-label font-medium text-ink-soft">{PACK_WORDS.name}</span>
            <span className="ml-auto text-helper-caption text-ink-soft">Change it any time, in any project.</span>
          </div>
          <div className="grid grid-cols-3 gap-[6px]">
            {packs.map((p) => (
              <label key={p.id} data-new-project-pack={p.id} className="relative block cursor-pointer rounded-sm">
                <input type="radio" name="preset" value={p.id} checked={p.id === preset} onChange={() => setPreset(p.id)} className="peer sr-only" />
                <PackCell
                  name={p.name}
                  glyphFamily={p.glyphFamily}
                  palette={p.dots}
                  className="peer-checked:shadow-[0_0_0_2px_var(--color-coral)] peer-focus-visible:shadow-focus"
                />
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex items-center gap-[10px]">
        <div className="ml-auto">
          <Button variant="ghost" size={36} onClick={() => dialog.current?.close()}>
            Cancel
          </Button>
        </div>
        {capped ? (
          // The frame draws it disabled — sunk paper, faint ink — and the block's sentence is
          // its reason, read aloud with it (`aria-describedby`, P0-0's pairing). Written out
          // rather than passed to the kit's `Button` as extra classes: two `bg-*` utilities on
          // one element are settled by the order of the generated stylesheet, not by the order
          // they are written in.
          <span
            role="button"
            aria-disabled
            aria-describedby="new-project-cap"
            tabIndex={0}
            className={`inline-flex h-11 cursor-not-allowed items-center justify-center rounded bg-paper-sunk px-5 text-ui font-semibold text-ink-faint ${ring}`}
          >
            Create project
          </span>
        ) : (
          <Button type="submit" variant="coral" size={44}>
            {pending ? 'Creating…' : 'Create project'}
          </Button>
        )}
      </div>
      </form>
    </dialog>
  )
}
