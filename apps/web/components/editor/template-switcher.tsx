'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import {
  CanvasAuthor, CanvasError, CanvasHome, CanvasMemberHome, CanvasPage, CanvasPaywall, CanvasPost, CanvasPrivate, CanvasSignin,
  CanvasSignup, CanvasTag, ChevronDown, ChevronRight, ChevronUp, CircleOff,
} from '@/components/kit/icons'
import { ring } from '@/components/kit/greyed'
import { BAR_POPOVER, BarMenuCard, BarMenuRow, TRIGGER_LABEL, TRIGGER_VALUE, triggerClass } from '@/components/editor/bar-menu'
import { CANVASES, canvasPath, isMembership, isSurface, type CanvasKey } from '@/lib/editor'
import { PAYWALL_WORDS } from '@/lib/paywall'
import { arrowKeys, openMenu } from '@/lib/menu'
import { isApp } from '@/routing'

/* D5b · THE TEMPLATE SWITCHER (`D5 Canvas Markers and Template Switcher.dc.html`:99-266) — the editor's first control
   that changes canvas, and its FIRST SOFT NAVIGATION.

   THE FRAME, MEASURED — AND THEN AMENDED BY THE OWNER (R-171, 2026-09-21). The closed control is D5b's 32px pill, 12px
   padding, 8px gap, white on a 1px `line` border at radius 8, with `Template` at 12/500 muted, the canvas's name at
   12.5/600 and a 12px chevron — down closed, up open, as D5b draws it open (:106). D5b drew the menu as a plain list of
   dots and words; the owner asked for it to look like View as's, so its card, heading, scrolling list and rows are
   `bar-menu.tsx`'s, which View as uses too: 284 wide (D5b's), radius 12, 6px padding, `shadow-lg`, headed
   "Templates", and each row a Tabler glyph for its canvas, the name at 13/500 over ONE line saying what the template
   is (`CANVASES[key].caption`), and a trailing slot. The current row is HIGHLIGHTED — D5b's coral tint and its name at
   600 — and carries no tick (R-172), as View as's does; the Membership group's rows are indented to 31px under a 13/600 heading with its 12px chevron. The list
   scrolls inside the card when it outgrows 420px, and opens on the checked row. `openMenu` places it, clamps both
   edges (R-126) and flips it, and the platform gives light dismiss, Escape and focus return because it is a
   `popover="auto"`.

   THE MARK MOVED, AND ITS WORD IS HEARD RATHER THAN PRINTED (R-171). A designed canvas carries a FILLED dot, an
   untouched one a HOLLOW dot — in the row's trailing slot now, where D5b printed "Auto-generated". The owner asked for
   the words to go and the marks to take their place; each word stays in the row for a screen reader (`sr-only`), so
   no one is left with a shape and no meaning. This departs, on his word, from the rule R-130 set here that a shape
   never travels alone.

   AND THERE IS A THIRD STATE THE FRAME DOES NOT DRAW, NOW RULED (R-130, the owner, 2026-09-18). A canvas that is
   never synthesized — R-129's three membership ones and Private — and that the user has not designed is neither: a
   filled dot would SAY it is designed, which is false, and "Auto-generated" would be false too
   (`sections-inventory.md:785`). D5b draws Signup filled and Signin auto-generated, which FR-D6 contradicts for both,
   so the frame illustrates the two states across its rows rather than asserting these. The owner answered his own
   Question 4 with a GLYPH rather than a word: Tabler's `circle-off` (`kit/icons.tsx`'s header carries the licence and
   the scope R-92 now excepts). Its word, "Empty", is a screen reader's since R-171, like "Auto-generated".

   WHAT IT DOES NOT SHIP, AND WHY (R-128, the owner, 2026-09-18): the rule, the `FROM THE ROUTES MANAGER` heading and
   the `+ New template` row are ABSENT until Story 7.16 builds the Routes Manager for them to reach — R-118's rule, a
   second time. Nothing is greyed and nothing is captioned; an absent row asks no questions. The custom group would
   have had nothing to list anyway: `custom_templates` has no writer.

   ABSENT, NOT GREYED, THE OTHER WAY TOO: a conditional canvas the project does not call for (Private) is simply not in
   `canvases`, and its address 404s — `lib/editor.ts`'s `canvasesOf` and `CONDITIONAL` decide, and `read.ts` hands the list over.

   R-98's PRESSED CONTROL. The row that starts a navigation says "Opening…" and goes `aria-disabled` and `aria-busy`
   until the transition settles, and the menu stays open while it does so — a menu that vanished on the press would
   take the only thing saying what is happening with it. `useTransition` and not `useSubmitting`, which needs a
   `<form>` (`sites/panel-link.tsx:88` is the built precedent). The editor stays mounted across the push: the canvas
   lives in the `[id]` layout, which survives a change of its child segment. */

/** R-171 (the owner, 2026-09-21): each canvas carries a Tabler glyph at the head of its row — "Use relevant icons from
 *  Tabler icons" — and a custom template from Story 7.16's Routes Manager will carry `CanvasCustom`. Keyed by canvas,
 *  so a canvas added to `CANVASES` without a glyph is a type error, never a row that silently draws nothing. */
const GLYPH: Readonly<Record<CanvasKey, typeof CanvasHome>> = {
  home: CanvasHome,
  post: CanvasPost,
  page: CanvasPage,
  tag: CanvasTag,
  author: CanvasAuthor,
  'custom-signup': CanvasSignup,
  'custom-signin': CanvasSignin,
  'custom-member-home': CanvasMemberHome,
  error: CanvasError,
  private: CanvasPrivate,
  paywall: CanvasPaywall,
}

/** The row's state mark, in D5b's two states plus R-130's third — since R-171 in the row's TRAILING slot, where its
 *  printed word used to be. `data-mark` is the state itself, so a reader — the probe included — asks the element what
 *  it is instead of inferring it from a computed border, which an icon has none of. Its word is the mark's hover
 *  title here and the row's `sr-only` text below: `DESIGN.md`'s carve-out for a word the screen does not print, the
 *  shape R-132, R-136 and R-159 already use. */
const Mark = ({ state, word }: { state: 'designed' | 'auto' | 'empty'; word: string | null }) => (
  <span title={word ?? undefined} className="inline-flex shrink-0">
    {state === 'empty' ? (
      <CircleOff size={9} data-mark={state} className="text-ink-soft" />
    ) : (
      <span
        aria-hidden
        data-mark={state}
        className={`size-2 rounded-full ${state === 'designed' ? 'bg-ink' : 'border-[1.5px] border-line-strong'}`}
      />
    )}
  </span>
)

export function TemplateSwitcher({
  projectId,
  current,
  canvases,
  auto,
  empty,
  pathOf,
}: {
  projectId: string
  /** the canvas the editor is showing — its row is highlighted and navigates nowhere */
  current: CanvasKey
  /** every canvas this project offers, in D5b's row order */
  canvases: readonly CanvasKey[]
  /** the canvases that are untouched: a hollow dot and the word "Auto-generated" (AD-22) */
  auto: ReadonlySet<CanvasKey>
  /** the canvases that are neither designed nor auto-generatable: R-130's `circle-off` glyph and the word "Empty" */
  empty: ReadonlySet<CanvasKey>
  /** Story 5.20 — where a canvas lives, when it is not the app's own `canvasPath`: the keyboard harness's pages, so its
   *  walk can switch canvas without a database (R-146). The app passes none. */
  pathOf?: (key: CanvasKey) => string
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
  /** Story 5.20 — the Template surfaces group, in the Membership group's shape and with its own chevron */
  const [surfacesOpen, setSurfacesOpen] = useState(true)
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
    start(() => router.push(pathOf ? pathOf(key) : `${prefix}${canvasPath(projectId, key)}`))
  }

  const row = (key: CanvasKey) => {
    // three states: designed (filled), auto-generated (hollow) and never-auto-generated-and-not-yet-designed (R-130's
    // `circle-off`) — see the note above. Since R-171 the mark is the row's trailing glyph and its word is heard, not
    // printed: "Remove Auto generated and Empty text from right of list items. Instead show the relevant icons there".
    const state = auto.has(key) ? 'auto' : empty.has(key) ? 'empty' : 'designed'
    const word = state === 'auto' ? 'Auto-generated' : state === 'empty' ? 'Empty' : null
    const busy = going === key
    const Glyph = GLYPH[key]
    return (
      <li key={key} className="flex flex-col">
        <BarMenuRow
          data-canvas={key}
          current={key === current}
          aria-disabled={busy || undefined}
          aria-busy={busy || undefined}
          onClick={() => go(key)}
          indent={isMembership(key) || isSurface(key)}
          glyph={<Glyph size={15} className="shrink-0 text-ink-soft" />}
          name={CANVASES[key].label}
          // R-98: the pressed row's line says what is happening while the transition runs
          caption={busy ? 'Opening…' : CANVASES[key].caption}
          trailing={
            <>
              <Mark state={state} word={word} />
              {word === null ? null : <span data-word className="sr-only">{word}</span>}
            </>
          }
        />
      </li>
    )
  }

  // D5b's group sits between Author and 404, which is exactly where the membership canvases sit in `CANVASES` — so the
  // three slices are cut out of the row order rather than re-ordered here (R-129's names are `lib/editor.ts`'s).
  const membership = canvases.filter(isMembership)
  const first = canvases.findIndex(isMembership)
  const before = first === -1 ? canvases.filter((k) => !isSurface(k)) : canvases.slice(0, first)
  const after = first === -1 ? [] : canvases.slice(first + membership.length).filter((k) => !isSurface(k))
  // STORY 5.20 — the TEMPLATE SURFACES group, last (EXPERIENCE.md:207-222): a canvas that is not a page, in D5b's
  // Membership group's shape. It holds Paywall alone — Cards arrives with Story 7.13 (R-118), and Error pages is 404.
  const surfaces = canvases.filter(isSurface)

  /** One of D5b's groups: a chevron BUTTON heading the group (the owner's test of Story 5.5 — a control that is present
   *  must work), its rows indented under it, and its rows NOT RENDERED while it is shut, so `arrowKeys` never steps onto
   *  a row nobody can see. Never shut while one of its own rows is the only thing saying "Opening…" (R-98). */
  const group = (id: string, heading: string, keys: readonly CanvasKey[], open: boolean, toggle: (next: (was: boolean) => boolean) => void) =>
    keys.length === 0 ? null : (
      <li className="flex flex-col">
        <ul aria-labelledby={id} className="flex list-none flex-col gap-px">
          <li className="flex flex-col">
            <button
              type="button"
              id={id}
              aria-expanded={open}
              aria-controls={`${id}-rows`}
              onClick={() => toggle((was) => (going !== null && keys.includes(going) ? was : !was))}
              className={`flex items-center gap-[9px] rounded-sm px-[10px] py-[7px] text-left text-ui-dense font-semibold transition-colors hover:bg-paper ${ring}`}
            >
              {open ? (
                <ChevronDown size={12} aria-hidden className="shrink-0 text-ink-soft" />
              ) : (
                <ChevronRight size={12} aria-hidden className="shrink-0 text-ink-soft" />
              )}
              {heading}
            </button>
          </li>
          <li id={`${id}-rows`} className="flex flex-col">
            <ul className="flex list-none flex-col gap-px">{open ? keys.map(row) : null}</ul>
          </li>
        </ul>
      </li>
    )

  return (
    <>
      {/* NO `aria-label`: the button is named by its own words, "Template Home" (WCAG 2.5.3 — View as's rule, R-171) */}
      <button
        type="button"
        id="editor-template"
        aria-expanded={open}
        popoverTarget="editor-template-menu"
        onClick={(event) => {
          if (menu.current) openMenu(menu.current, event.currentTarget, { side: 'down', align: 'left' })
        }}
        className={triggerClass(open)}
      >
        <span className={TRIGGER_LABEL}>Template</span>
        <span className={TRIGGER_VALUE}>{CANVASES[current].label}</span>
        {open ? <ChevronUp size={12} className="text-ink-soft" /> : <ChevronDown size={12} className="text-ink-soft" />}
      </button>
      <div
        ref={menu}
        id="editor-template-menu"
        popover="auto"
        onToggle={(event) => {
          const opening = (event as unknown as ToggleEvent).newState === 'open'
          setOpen(opening)
          // the groups open WITH the menu, as D5b draws them: a fold left shut would hide the checked row next time
          if (opening) {
            setGroupOpen(true)
            setSurfacesOpen(true)
          }
        }}
        onKeyDown={arrowKeys}
        className={BAR_POPOVER}
      >
        {/* A PLAIN LIST UNDER ITS HEADING, as every menu in the app is (`kit/select.tsx`'s `Menu`), and the group is a
            nested labelled list. `role="menu"` would make each `<li>` an invalid child and buy nothing the Kit's
            shape does not already give: the popover is the focus trap, `arrowKeys` the movement, `aria-current` the
            row in force. The card, its heading and the scrolling list are View as's too (`bar-menu.tsx`, R-171). */}
        <BarMenuCard width="w-[min(284px,calc(100vw-16px))]" headingId="editor-template-heading" heading="Templates">
          {before.map(row)}
          {/* A PLAIN LIST UNDER ITS HEADING, and each group a nested labelled list (`group` above): the Membership group
              between Author and 404, where D5b draws it, and Story 5.20's Template surfaces group last */}
          {group('editor-template-membership', 'Membership', membership, groupOpen, setGroupOpen)}
          {after.map(row)}
          {group('editor-template-surfaces', PAYWALL_WORDS.group, surfaces, surfacesOpen, setSurfacesOpen)}
        </BarMenuCard>
      </div>
    </>
  )
}
