'use client'

import { fieldTone, greyedProps, reason, ring } from '@/components/kit/greyed'
import { Plus } from '@/components/kit/icons'
import { openNewProject } from '@/components/shell/shell'
import { BLANK_DOOR, CONNECT_DOOR, FIRST_RUN, STARTER_DOOR } from '@/lib/first-run'

/* ───────── S2 Onboarding.dc.html S2a — the three cards, read off the frame (`:31-65`).

   EVERY WORD COMES FROM `lib/first-run.ts` and none is typed here: the starter door is also drawn
   by the New Project Sheet, and one sentence with two homes is a disagreement waiting to happen
   (`first-run.test.ts` asserts that neither file keeps a copy).

   THREE DOORS, THREE BEHAVIOURS, AND THAT IS WHY THEY ARE WRITTEN OUT RATHER THAN MAPPED: Connect
   is an `<a href>` into Story 3.2's full-page handshake, Blank is a `<button>` that opens the sheet
   the dashboard opens, and Starter is greyed with its reason until Epic 11's chooser exists. The
   card's own chrome is one string, `card`, so the three cannot drift apart visually — and the
   COLOURS are per door rather than in it, because two `bg-*` utilities on one element are settled
   by the order of the generated stylesheet, not by the order they are written in
   (new-project-sheet.tsx carries that scar).

   A PLAIN `<a>`, NOT A `<Link>`, on the Connect door — deliberately, and `busy.test.ts`'s
   NO_SKELETON entry for `/sites/connect` is the record of why: that route has no `loading.tsx`
   because NOTHING SOFT-NAVIGATES to it, so every way in is a document load with the browser's own
   progress on it. A `<Link>` here would quietly make that reason false. (It is the same `<a>` the
   shell's `ConnectSiteButton` uses, one behaviour short: there is no connect sheet on this route
   to intercept the click into, so the click is simply the navigation.)

   STARTER IS GREYED, NOT ABSENT (UX-DR3): the door is information about the product, and a door
   that cannot act YET keeps its place and says why in the helper-caption slot, never in a tooltip.
   `greyedProps` puts `aria-disabled` on the card, which is doing two jobs — it says the option is
   inactive, and it is what makes P0-0's grey legitimate to axe-core, whose colour-contrast rule
   skips an aria-disabled element and its descendants (new-project-sheet.tsx's GreyedDoor carries
   the measurement). It stays in the Tab order, so the reason is read with it.

   THE ILLUSTRATIONS ARE THE FRAME'S OWN DRAWINGS, tokenised: every colour S2a paints them with has
   a `--color-*`, because no .tsx may carry a hex (`tokens.test.ts`). The one rounding is the
   starter cards' shadow — the frame casts the centre one at .12 alpha and the token layer has .08
   and .14 and nothing between, so all three mini-pages take `shadow-md`. */

/** The card's chrome. 352px at 1440 and the grid's own width below it; radius 12, padding 28,
    the frame's 20px gap between the band and the words. The border colour is the door's. */
const card = 'flex w-full flex-col gap-5 rounded border p-7 text-left shadow-sm'
/** The two doors that can be pressed, with the frame's hover: lift 2px, shadow up one step. */
const live = `border-line bg-surface transition hover:-translate-y-[2px] hover:shadow-md ${ring}`
const title = 'font-display text-[22px] font-bold tracking-[-0.01em]'
const body = 'text-ui leading-[1.5]'
/** The 140px illustration band every card opens with. `overflow-hidden` is not decoration: the
    drawings are the frame's own sizes and the CELL is not — at 834 three columns leave a card
    ~117px wide inside its padding, and without it the starter fan spilled over the card's own
    edges onto the page (measured at 834, Dev 2026-09-11). */
const band = 'flex h-[140px] shrink-0 items-center justify-center overflow-hidden'
/** AND THE DRAWINGS SHRINK WHERE THE CELL DOES, and only there: at 390 the card is the width of
    the screen and at 1440 it is the frame's own 352px, so the frame's sizes are right at both.
    `tablet` is the one width in between, where the app's one collapse rule — 3-up, the dashboard
    grid's — leaves a third of 566px. */
const fits = 'tablet:scale-[.6] desktop:scale-100'
/** `rounded-[50%]`: `--radius-full` is 24px (an alias of pill), which on a 56px box draws a
    squircle rather than the frame's circle, and a proportion is not something a px token can
    hold. `shrink-0` because a flex item's default is to shrink, and these two shrank into OVALS
    at 834 before it was here. */
const circle = 'flex size-14 shrink-0 items-center justify-center rounded-[50%] text-surface'

const STARTER_GREYED = { reason: STARTER_DOOR.reason }
const STARTER_ID = 'first-run-starter'

export function Doors() {
  return (
    <div className="grid w-full max-w-[1104px] grid-cols-1 gap-6 tablet:grid-cols-3">
      {/* ── 1. CONNECT — the Recommended door. Straight into 3.2's handshake, which redirects on
             success to 3.4's brand offer, which makes the project. Nothing new behind it. */}
      <a href="/sites/connect" className={`relative ${card} ${live}`}>
        <span className="absolute top-4 right-4 rounded-pill bg-coral-tint px-[10px] py-1 text-control-label font-semibold text-coral-text">
          {FIRST_RUN.recommended}
        </span>
        <span aria-hidden className={band}>
          <span className={`flex items-center gap-[14px] ${fits}`}>
            <span className={`${circle} bg-ink font-display text-[26px] font-bold`}>G</span>
            {/* S2a's own link glyph (`:36`) — the chain with the bar through it, which is not the
                Kit's `Link`. It is part of an illustration, so it is drawn here rather than added
                to the icon set, whose membership is the export's UI glyphs. */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="text-coral"
            >
              <path d="M9 17H7A5 5 0 0 1 7 7h2" />
              <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span className={`${circle} bg-coral font-display text-[24px] font-extrabold`}>In</span>
          </span>
        </span>
        <span className="flex flex-col gap-2">
          <span className={`${title} text-ink`}>{CONNECT_DOOR.title}</span>
          <span className={`${body} text-ink-soft`}>{CONNECT_DOOR.consequence}</span>
        </span>
      </a>

      {/* ── 2. STARTER — greyed with its reason. Epic 11 owns the chooser (DW-88). */}
      <div {...greyedProps(STARTER_ID, STARTER_GREYED)} className={`${card} ${fieldTone(STARTER_GREYED)} ${ring}`}>
        <span aria-hidden className={band}>
          {/* Three mini-pages, fanned — the frame's own sizes, rotations and offsets (`:43-47`). */}
          <span className={`relative flex h-[140px] w-[236px] items-center justify-center ${fits}`}>
            <span className="absolute flex h-[78px] w-[110px] translate-x-[-52px] rotate-[-9deg] flex-col gap-[5px] rounded-thumb border border-line bg-surface p-[10px] shadow-md">
              <span className="h-[10px] w-[60%] rounded-[3px] bg-line" />
              <span className="h-[26px] rounded-[4px] bg-coral-tint" />
              <span className="h-[6px] w-[80%] rounded-[3px] bg-line-soft" />
            </span>
            <span className="absolute flex h-[78px] w-[110px] translate-x-[52px] rotate-[8deg] flex-col gap-[5px] rounded-thumb border border-line bg-surface p-[10px] shadow-md">
              <span className="h-[26px] rounded-[4px] bg-line-soft" />
              <span className="h-[8px] w-[70%] rounded-[3px] bg-line" />
              <span className="h-[6px] w-[50%] rounded-[3px] bg-line-soft" />
            </span>
            <span className="absolute flex h-[84px] w-[118px] flex-col gap-[5px] rounded-thumb border border-line bg-surface p-[10px] shadow-md">
              <span className="h-[12px] w-[55%] rounded-[3px] bg-ink" />
              <span className="h-[6px] w-[85%] rounded-[3px] bg-line" />
              <span className="h-[28px] rounded-[4px] bg-coral opacity-[.85]" />
            </span>
          </span>
        </span>
        <span className="flex flex-col gap-2">
          <span className={`${title} text-ink-faint`}>{STARTER_DOOR.title}</span>
          <span className={`${body} text-ink-faint`}>{STARTER_DOOR.consequence}</span>
          {reason(STARTER_ID, STARTER_GREYED)}
        </span>
      </div>

      {/* ── 3. BLANK — the same sheet the dashboard opens, not a copy of it. With scripts off a
             `<dialog>` cannot be shown, which is the dashboard's own "New project" behaviour at
             the same moment: parity, not a regression. */}
      <button type="button" onClick={openNewProject} className={`${card} ${live}`}>
        <span aria-hidden className={band}>
          <span
            className={`relative flex h-[100px] w-[150px] shrink-0 items-center justify-center rounded-thumb border-[1.5px] border-dashed border-line-strong text-line-strong ${fits}`}
          >
            <Plus size={22} strokeWidth={1.5} />
            <svg width="18" height="18" viewBox="0 0 18 18" className="absolute -top-[9px] -right-[9px]">
              <path d="M9 1l1.8 5.2L16 8l-5.2 1.8L9 15l-1.8-5.2L2 8l5.2-1.8z" className="fill-marigold" />
            </svg>
          </span>
        </span>
        <span className="flex flex-col gap-2">
          <span className={`${title} text-ink`}>{BLANK_DOOR.title}</span>
          <span className={`${body} text-ink-soft`}>{BLANK_DOOR.consequence}</span>
        </span>
      </button>
    </div>
  )
}
