'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { Check, ChevronDown, ChevronRight, ChevronUp, CircleOff } from '@/components/kit/icons'
import { ring } from '@/components/kit/greyed'
import { CANVASES, canvasPath, isMembership, type CanvasKey } from '@/lib/editor'
import { arrowKeys, openMenu } from '@/lib/menu'
import { isApp } from '@/routing'

/* D5b · THE TEMPLATE SWITCHER (`D5 Canvas Markers and Template Switcher.dc.html`:99-266) — the editor's first control
   that changes canvas, and its FIRST SOFT NAVIGATION.

   THE FRAME, MEASURED. The closed control is a 32px pill, 12px padding, 8px gap, white on a 1px `line` border at
   radius 8, with `Template` at 12/500 muted, the canvas's name at 12.5/600 and a 12px chevron — down closed, up open,
   as D5b draws it open (:106). The menu is 284 wide, radius 12, 6px padding, 1px gaps and `shadow-lg`, which IS the
   shadow D5b draws it with, value for value; a row is 7/10 at radius 8 with a 9px gap; the current row takes `coral-tint`,
   600 and a 13px check; the Membership group's rows are indented to 31px under a 13/600 heading with its 12px
   chevron. `openMenu` places it, clamps both edges (R-126) and flips it, and the platform gives light dismiss, Escape
   and focus return because it is a `popover="auto"` — which is why this is built WITH `openMenu` and the Kit's row
   shape rather than by widening `Menu`'s contract: D5b has group headings and indents that `Menu` has no place for.

   THE WORD IS NOT OPTIONAL (D5b's own caption). A designed canvas carries a FILLED dot and no word; an untouched one
   carries a HOLLOW dot AND the word "Auto-generated". "A shape alone is the same failure as a colour alone", and this
   menu is where a user decides which canvas to open.

   AND THERE IS A THIRD STATE THE FRAME DOES NOT DRAW, NOW RULED (R-130, the owner, 2026-09-18). A canvas that is
   never synthesized — R-129's three membership ones and Private — and that the user has not designed is neither: a
   filled dot would SAY it is designed, which is false, and "Auto-generated" would be false too
   (`sections-inventory.md:785`). D5b draws Signup filled and Signin auto-generated, which FR-D6 contradicts for both,
   so the frame illustrates the two states across its rows rather than asserting these. The owner answered his own
   Question 4 with a GLYPH rather than a word: Tabler's `circle-off`, which is why it is the one Tabler path in
   `kit/icons.tsx` (its header carries the licence and the scope R-92 now excepts). The word "Empty" stays beside it —
   his rule that a shape never travels alone is exactly why the icon needed answering for in the first place.

   WHAT IT DOES NOT SHIP, AND WHY (R-128, the owner, 2026-09-18): the rule, the `FROM THE ROUTES MANAGER` heading and
   the `+ New template` row are ABSENT until Story 7.16 builds the Routes Manager for them to reach — R-118's rule, a
   second time. Nothing is greyed and nothing is captioned; an absent row asks no questions. The custom group would
   have had nothing to list anyway: `custom_templates` has no writer.

   ABSENT, NOT GREYED, THE OTHER WAY TOO: a conditional canvas the project does not call for (Private) is simply not in
   `canvases`, and its address 404s — the caller decides, from the server (`read.ts`'s `privateCanvasOpen`).

   R-98's PRESSED CONTROL. The row that starts a navigation says "Opening…" and goes `aria-disabled` and `aria-busy`
   until the transition settles, and the menu stays open while it does so — a menu that vanished on the press would
   take the only thing saying what is happening with it. `useTransition` and not `useSubmitting`, which needs a
   `<form>` (`sites/panel-link.tsx:88` is the built precedent). The editor stays mounted across the push: the canvas
   lives in the `[id]` layout, which survives a change of its child segment. */

const ROW = 'flex w-full items-center gap-[9px] rounded-sm py-[7px] pr-[10px] text-left transition-colors'

/** The row's mark, in D5b's two states plus R-130's third. `data-mark` is the state itself, so a reader — the probe
 *  included — asks the element what it is instead of inferring it from a computed border, which an icon has none of. */
const Mark = ({ state }: { state: 'designed' | 'auto' | 'empty' }) =>
  state === 'empty' ? (
    <CircleOff size={9} data-mark={state} className="shrink-0 text-ink-soft" />
  ) : (
    <span
      aria-hidden
      data-mark={state}
      className={`size-2 shrink-0 rounded-full ${state === 'designed' ? 'bg-ink' : 'border-[1.5px] border-line-strong'}`}
    />
  )

export function TemplateSwitcher({
  projectId,
  current,
  canvases,
  auto,
  empty,
}: {
  projectId: string
  /** the canvas the editor is showing — its row takes the check and navigates nowhere */
  current: CanvasKey
  /** every canvas this project offers, in D5b's row order */
  canvases: readonly CanvasKey[]
  /** the canvases that are untouched: a hollow dot and the word "Auto-generated" (AD-22) */
  auto: ReadonlySet<CanvasKey>
  /** the canvases that are neither designed nor auto-generatable: a hollow dot and the word "Empty" */
  empty: ReadonlySet<CanvasKey>
}) {
  const router = useRouter()
  // The internal `/app` prefix is on the path on localhost and never on the app host, so a push has to carry whatever
  // the address already carries — the same question `canvasSrc(isApp(pathname))` asks for the canvas document.
  // Without it a local run pushes `/projects/…`, which is not a route there, and lands on a 404 (executed 2026-09-18).
  const prefix = isApp(usePathname()) ? '/app' : ''
  const [pending, start] = useTransition()
  const [open, setOpen] = useState(false)
  /** the row pressed, so only IT says "Opening…" while the transition is in flight */
  const [going, setGoing] = useState<CanvasKey | null>(null)
  /** D5b's Membership group, open as the frame draws it — the chevron is the control that shuts it */
  const [groupOpen, setGroupOpen] = useState(true)
  const menu = useRef<HTMLDivElement>(null)

  // the transition settling is the new canvas being there; the menu closes then, not on the press (R-98)
  useEffect(() => {
    if (pending || going === null) return
    setGoing(null)
    if (menu.current?.matches(':popover-open')) menu.current.hidePopover()
  }, [pending, going])

  const go = (key: CanvasKey) => {
    // the current canvas closes the menu and navigates nowhere
    if (key === current) {
      menu.current?.hidePopover()
      return
    }
    if (pending) return // one navigation at a time — a second press has nowhere sensible to land
    setGoing(key)
    start(() => router.push(`${prefix}${canvasPath(projectId, key)}`))
  }

  const row = (key: CanvasKey) => {
    // three states, two shapes: designed (filled, no word), auto-generated (hollow, "Auto-generated") and
    // never-auto-generated-and-not-yet-designed (hollow, "Empty") — see the note above
    const state = auto.has(key) ? 'auto' : empty.has(key) ? 'empty' : 'designed'
    const word = state === 'auto' ? 'Auto-generated' : state === 'empty' ? 'Empty' : null
    const busy = going === key
    return (
      <li key={key} className="flex flex-col">
        <button
          type="button"
          data-canvas={key}
          aria-current={key === current ? 'true' : undefined}
          aria-disabled={busy || undefined}
          aria-busy={busy || undefined}
          onClick={() => go(key)}
          className={`${ROW} ${isMembership(key) ? 'pl-[31px]' : 'pl-[10px]'} ${ring} ${
            key === current ? 'bg-coral-tint' : 'hover:bg-paper'
          }`}
        >
          <Mark state={state} />
          <span data-name className={`flex-1 text-ui-dense ${key === current ? 'font-semibold' : 'font-medium'}`}>
            {CANVASES[key].label}
          </span>
          <span data-word className="text-[10px] text-ink-soft">{busy ? 'Opening…' : word}</span>
          {key === current ? <Check size={13} className="shrink-0 text-coral-deep" /> : null}
        </button>
      </li>
    )
  }

  // D5b's group sits between Author and 404, which is exactly where the membership canvases sit in `CANVASES` — so the
  // three slices are cut out of the row order rather than re-ordered here (R-129's names are `lib/editor.ts`'s).
  const membership = canvases.filter(isMembership)
  const first = canvases.findIndex(isMembership)
  const before = first === -1 ? canvases : canvases.slice(0, first)
  const after = first === -1 ? [] : canvases.slice(first + membership.length)

  return (
    <>
      <button
        type="button"
        id="editor-template"
        aria-label={`Template: ${CANVASES[current].label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        popoverTarget="editor-template-menu"
        onClick={(event) => {
          if (menu.current) openMenu(menu.current, event.currentTarget, { side: 'down', align: 'left' })
        }}
        className={`flex h-8 items-center gap-2 rounded-sm border border-line bg-surface px-3 transition-colors hover:border-line-strong ${ring}`}
      >
        <span className="text-control-label font-medium text-ink-soft">Template</span>
        <span className="text-[12.5px] font-semibold">{CANVASES[current].label}</span>
        {open ? <ChevronUp size={12} className="text-ink-soft" /> : <ChevronDown size={12} className="text-ink-soft" />}
      </button>
      <div
        ref={menu}
        id="editor-template-menu"
        popover="auto"
        onToggle={(event) => setOpen((event as unknown as ToggleEvent).newState === 'open')}
        onKeyDown={arrowKeys}
        className="border-0 bg-transparent p-0"
      >
        {/* A PLAIN LIST WITH A LABEL, as every menu in the app is (`kit/select.tsx`'s `Menu`), and the group is a
            nested labelled list. `role="menu"` would make each `<li>` an invalid child and buy nothing the Kit's
            shape does not already give: the popover is the focus trap, `arrowKeys` the movement, `aria-current` the
            row in force. */}
        <ul
          aria-label="Template"
          className="flex max-h-[min(420px,70vh)] w-[284px] list-none flex-col gap-px overflow-y-auto rounded border border-line bg-surface p-[6px] shadow-lg"
        >
          {before.map(row)}
          {membership.length > 0 ? (
            <li className="flex flex-col">
              <ul aria-labelledby="editor-template-membership" className="flex list-none flex-col gap-px">
                {/* THE CHEVRON IS A CONTROL, so it is a button (the owner's test of Story 5.5, 2026-09-18): D5b draws
                    the group with one and it drew nothing here, which is the same fault R-118 names from the other
                    end — a control that is present must work. The heading keeps its own id, so the group stays
                    labelled by it whether it is open or shut, and `arrowKeys` walks it with every row because it is
                    now one of the menu's `button`s. Collapsed rows are NOT rendered rather than hidden: a hidden
                    button is still a `querySelector('button')`, so `arrowKeys` would step onto a row nobody can see. */}
                <li className="flex flex-col">
                  <button
                    type="button"
                    id="editor-template-membership"
                    aria-expanded={groupOpen}
                    aria-controls="editor-template-membership-rows"
                    onClick={() => setGroupOpen((was) => !was)}
                    className={`flex items-center gap-[9px] rounded-sm px-[10px] py-[7px] text-left text-ui-dense font-semibold transition-colors hover:bg-paper ${ring}`}
                  >
                    {groupOpen ? (
                      <ChevronDown size={12} aria-hidden className="shrink-0 text-ink-soft" />
                    ) : (
                      <ChevronRight size={12} aria-hidden className="shrink-0 text-ink-soft" />
                    )}
                    Membership
                  </button>
                </li>
                <li id="editor-template-membership-rows" className="flex flex-col">
                  <ul className="flex list-none flex-col gap-px">{groupOpen ? membership.map(row) : null}</ul>
                </li>
              </ul>
            </li>
          ) : null}
          {after.map(row)}
        </ul>
      </div>
    </>
  )
}
