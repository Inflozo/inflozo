'use client'

import { usePathname, useRouter } from 'next/navigation'
import { memo, useEffect, useRef, useState, useTransition } from 'react'
import {
  CanvasAuthor, CanvasCards, CanvasCustom, CanvasError, CanvasHome, CanvasMemberHome, CanvasPage, CanvasPaywall, CanvasPost, CanvasPrivate, CanvasSignin,
  CanvasSignup, CanvasTag, ChevronDown, ChevronRight, ChevronUp, CircleOff, Plus, Route,
} from '@/components/kit/icons'
import { CountBadge } from '@/components/kit/badge'
import { ring } from '@/components/kit/greyed'
import { BAR_POPOVER, BarMenuCard, BarMenuRow, TRIGGER_LABEL, TRIGGER_VALUE, triggerClass } from '@/components/editor/bar-menu'
import { CARD_WORDS } from '@/lib/cards'
import {
  canvasPath, captionOf, isMembership, isRouteCanvas, isSurface, labelOf, newTemplatePath, ROUTES_GROUP, routesPath, SURFACES_HEADING, type Canvas,
  type CanvasKey,
} from '@/lib/editor'
import { ROUTES_WORDS } from '@/lib/routes'
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
   is (`captionOf`), and a trailing slot. The current row is HIGHLIGHTED — D5b's coral tint and its name at
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

   THE ROUTES MANAGER'S TAIL (R-128's pair, R-245; built by Story 7.16b, D5b `:161-179`). After Template surfaces: a rule,
   then — only over rows, because an absent row asks no questions — the `FROM THE ROUTES MANAGER` heading (D5b's 10/600 muted
   capitals, not a fold) over one row per Routes Manager template (`RouteCanvas`, from `editorData`'s `custom_templates`
   read, in `templatesOf` order), each R-171's anatomy: `CanvasCustom`, the template's display name, "Custom template" and its
   mark — designed or Empty, never Auto-generated, because a custom template is never synthesized (FR-D6; D5b's "Long read ·
   Auto-generated" is the frame's slip, routine call 6) — and a rule under them; then D5b's "New template" (a plus, the name at
   600, no line under it), which opens Routes & Templates with its New template sheet (`?new=template`, routine call 8); then
   Story 7.16a's "Manage routes", the entry S9a's caption names, its glyph Tabler's `route`. Both pushes say "Opening…" while
   they run (R-98): "New template" in its NAME, having no line to say it in. The Routes page (`projects/[id]/routes/actions.ts`)
   is `custom_templates`' one writer. D5b draws the group after Private; it predates the Template surfaces group, and this
   keeps every routing row together (routine call 5).

   ABSENT, NOT GREYED, THE OTHER WAY TOO: a conditional canvas the project does not call for (Private) is simply not in
   `canvases`, and its address 404s — `lib/editor.ts`'s `canvasesOf` and `CONDITIONAL` decide, and `read.ts` hands the list over.

   R-98's PRESSED CONTROL. The row that starts a navigation says "Opening…" and goes `aria-disabled` and `aria-busy`
   until the transition settles, and the menu stays open while it does so — a menu that vanished on the press would
   take the only thing saying what is happening with it. `useTransition` and not `useSubmitting`, which needs a
   `<form>` (`sites/panel-link.tsx:88` is the built precedent). The editor stays mounted across the push: the canvas
   lives in the `[id]` layout, which survives a change of its child segment. */

/** R-171 (the owner, 2026-09-21): each canvas carries a Tabler glyph at the head of its row — "Use relevant icons from
 *  Tabler icons" — and a custom template from the Routes Manager carries `CanvasCustom` (Story 7.16b). Keyed by canvas,
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
  cards: CanvasCards,
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

/** Story 7.16b — no Routes Manager template named: one value, so `memo` keeps its identity */
const NO_NAMES: Readonly<Record<string, string>> = {}

// Story 5.23b — `memo` (R-208): the editor hands it values that keep their identity while unchanged and handlers of fixed
// identity, so it redraws when what it shows changes and not on every render of the editor.
export const TemplateSwitcher = memo(function TemplateSwitcher({
  projectId,
  current,
  canvases,
  auto,
  empty,
  pathOf,
  customised = 0,
  names = NO_NAMES,
}: {
  projectId: string
  /** the canvas the editor is showing — its row is highlighted and navigates nowhere */
  current: Canvas
  /** every canvas this project offers, in D5b's row order, then each Routes Manager template's (Story 7.16b) */
  canvases: readonly Canvas[]
  /** the canvases that are untouched: a hollow dot and the word "Auto-generated" (AD-22) */
  auto: ReadonlySet<Canvas>
  /** the canvases that are neither designed nor auto-generatable: R-130's `circle-off` glyph and the word "Empty" */
  empty: ReadonlySet<Canvas>
  /** Story 5.20 — where a canvas lives, when it is not the app's own `canvasPath`: the keyboard harness's pages, so its
   *  walk can switch canvas without a database (R-146). The app passes none. */
  pathOf?: (key: Canvas) => string
  /** STORY 7.13 — S14d's amber count of customised cards, which follows Editor cards' label (absent at zero, never "0") */
  customised?: number
  /** STORY 7.16b — each Routes Manager template's display name, by canvas (`labelOf`) */
  names?: Readonly<Record<string, string>>
}) {
  const router = useRouter()
  // The internal `/app` prefix is on the path on localhost and never on the app host, so a push has to carry whatever
  // the address already carries — the same question `canvasSrc(isApp(pathname))` asks for the canvas document.
  // Without it a local run pushes `/projects/…`, which is not a route there, and lands on a 404 (executed 2026-09-18).
  const prefix = isApp(usePathname()) ? '/app' : ''
  const [pending, start] = useTransition()
  const [open, setOpen] = useState(false)
  /** the row pressed, so only IT says "Opening…" while the transition is in flight */
  const [going, setGoing] = useState<Canvas | null>(null)
  /** Story 7.16a — "Manage routes" pressed, so it alone says "Opening…" while the push runs (R-98) */
  const [routing, setRouting] = useState(false)
  /** Story 7.16b — "New template" pressed, so it alone says "Opening…" while the push runs (R-98) */
  const [naming, setNaming] = useState(false)
  /** D5b's Membership group, open as the frame draws it — the chevron is the control that shuts it */
  const [groupOpen, setGroupOpen] = useState(true)
  /** Story 5.20 — the Template surfaces group, in the Membership group's shape and with its own chevron */
  const [surfacesOpen, setSurfacesOpen] = useState(true)
  const menu = useRef<HTMLDivElement>(null)

  // the transition settling is the new canvas being there; the menu closes then, not on the press (R-98)
  useEffect(() => {
    if (pending || (going === null && !routing && !naming)) return
    setGoing(null)
    setRouting(false)
    setNaming(false)
    if (menu.current?.matches(':popover-open')) menu.current.hidePopover()
  }, [pending, going, routing, naming])

  const go = (key: Canvas) => {
    // the current canvas closes the menu and navigates nowhere
    if (key === current) {
      menu.current?.hidePopover()
      return
    }
    if (pending) return // one navigation at a time — a second press has nowhere sensible to land
    setGoing(key)
    start(() => router.push(pathOf ? pathOf(key) : `${prefix}${canvasPath(projectId, key)}`))
  }

  const row = (key: Canvas) => {
    // three states: designed (filled), auto-generated (hollow) and never-auto-generated-and-not-yet-designed (R-130's
    // `circle-off`) — see the note above. Since R-171 the mark is the row's trailing glyph and its word is heard, not
    // printed: "Remove Auto generated and Empty text from right of list items. Instead show the relevant icons there".
    const state = auto.has(key) ? 'auto' : empty.has(key) ? 'empty' : 'designed'
    const word = state === 'auto' ? 'Auto-generated' : state === 'empty' ? 'Empty' : null
    const busy = going === key
    const Glyph = isRouteCanvas(key) ? CanvasCustom : GLYPH[key]
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
          name={labelOf(key, names)}
          // Story 7.13 — S14d's count, read as "N customised cards"; on no other row
          count={key === 'cards' && customised > 0 ? <CountBadge n={customised} words={CARD_WORDS.count(customised)} /> : undefined}
          // R-98: the pressed row's line says what is happening while the transition runs
          caption={busy ? 'Opening…' : captionOf(key)}
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
  const page = (k: Canvas) => !isSurface(k) && !isRouteCanvas(k)
  const before = (first === -1 ? canvases : canvases.slice(0, first)).filter(page)
  const after = first === -1 ? [] : canvases.slice(first + membership.length).filter(page)
  // STORY 5.20 — the TEMPLATE SURFACES group, last (EXPERIENCE.md:207-222): a canvas that is not a page, in D5b's
  // Membership group's shape. Paywall, then Editor cards (Story 7.13); Error pages is 404.
  const surfaces = canvases.filter(isSurface)
  // STORY 7.16b — the Routes Manager's templates, under D5b's heading after the surfaces (routine call 5)
  const routes = canvases.filter(isRouteCanvas)
  const rule = (at: string) => <li key={at} aria-hidden className="flex flex-col py-1"><hr className="mx-2 h-px border-0 bg-line" /></li>

  /** One of D5b's groups: a chevron BUTTON heading the group (the owner's test of Story 5.5 — a control that is present
   *  must work), its rows indented under it, and its rows NOT RENDERED while it is shut, so `arrowKeys` never steps onto
   *  a row nobody can see. Never shut while one of its own rows is the only thing saying "Opening…" (R-98). */
  const group = (id: string, heading: string, keys: readonly Canvas[], open: boolean, toggle: (next: (was: boolean) => boolean) => void) =>
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
        <span className={TRIGGER_VALUE}>{labelOf(current, names)}</span>
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
          {group('editor-template-surfaces', SURFACES_HEADING, surfaces, surfacesOpen, setSurfacesOpen)}
          {/* Story 7.16b — the rule; then, over rows only, D5b's heading, the Routes Manager's templates and a second rule */}
          {rule('rule-routes')}
          {routes.length === 0 ? null : (
            <>
              <li className="flex flex-col">
                <p id="editor-template-routes" className="px-[10px] pb-[5px] pt-[2px] text-[10px] font-semibold uppercase tracking-[0.04em] text-ink-soft">
                  {ROUTES_GROUP.heading}
                </p>
                <ul aria-labelledby="editor-template-routes" className="flex list-none flex-col gap-px">{routes.map(row)}</ul>
              </li>
              {rule('rule-new')}
            </>
          )}
          {/* Story 7.16b — D5b's "New template": Routes & Templates with its sheet open (routine call 8). Not a canvas, so it
              navigates and is never the current one; R-98's "Opening…" is its NAME, since the row has no line */}
          <li className="flex flex-col">
            <BarMenuRow
              data-new-template=""
              aria-disabled={naming || undefined}
              aria-busy={naming || undefined}
              onClick={() => {
                if (pending) return
                setNaming(true)
                start(() => router.push(`${prefix}${newTemplatePath(projectId)}`))
              }}
              glyph={<Plus size={15} className="shrink-0 text-ink-soft" />}
              name={naming ? ROUTES_WORDS.opening : ROUTES_GROUP.newTemplate}
              strong
            />
          </li>
          {/* Story 7.16a — "Manage routes", last (S9a's caption). Not a canvas: the Routes Manager is its own page
              (`lib/editor.ts`'s `ROUTES`), so the row navigates and is never the current one */}
          <li className="flex flex-col">
            <BarMenuRow
              data-manage-routes=""
              aria-disabled={routing || undefined}
              aria-busy={routing || undefined}
              onClick={() => {
                if (pending) return
                setRouting(true)
                start(() => router.push(`${prefix}${routesPath(projectId)}`))
              }}
              glyph={<Route size={15} className="shrink-0 text-ink-soft" />}
              name={ROUTES_WORDS.manageRoutes}
              caption={routing ? ROUTES_WORDS.opening : ROUTES_WORDS.manageRoutesCaption}
            />
          </li>
        </BarMenuCard>
      </div>
    </>
  )
})
