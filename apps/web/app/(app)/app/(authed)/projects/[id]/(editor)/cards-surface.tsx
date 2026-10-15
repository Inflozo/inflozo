'use client'

import { useEffect, useId, useMemo, useRef, useState, type RefObject } from 'react'
import { cardsCss, cardValues, CARDS, designedCards, excludedChunks, type CardControl, type CardDesigns, type CardEntry } from '@inflozo/library'
import { iconSvg } from '@inflozo/section-runtime'
import { IconPicker, loadIcons } from '@/components/controls/icon-picker'
import { BAR_POPOVER, BarMenuCard, TRIGGER_LABEL, TRIGGER_VALUE, triggerClass } from '@/components/editor/bar-menu'
import { CustomisedBadge } from '@/components/kit/badge'
import { Button } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel, sheet, title } from '@/components/kit/dialog'
import { ReadOnly, ring, type Greyed } from '@/components/kit/greyed'
import { ChevronDown, ChevronUp, InfoCircle, Undo } from '@/components/kit/icons'
import { Segmented } from '@/components/kit/segmented'
import { SwatchRow } from '@/components/kit/swatch-row'
import { Toggle } from '@/components/kit/toggle'
import { CARD_WORDS, resetSentence } from '@/lib/cards'
import { wearPack } from '@/lib/canvas'
import { arrowKeys, openMenu } from '@/lib/menu'
import type { PackChoice } from '@/lib/pack-switch'

/* STORY 7.13 — THE EDITOR CARDS SURFACE (FR-Q7; S14 as EXPERIENCE.md re-specifies it, on Story 5.20's Template-surface shell).
 *
 * FOUR PARTS, each drawn from `S14 Editor Cards.dc.html` and placed where the built shell keeps its regions:
 *   - `CardMenu`, S14a's Card dropdown, beside the Template switcher in the ink bar's centred group (routine call 2) — every
 *     card in Ghost's own menu order (`CARDS`), a changed card's `customised` badge, R-6's no-colour mark;
 *   - `CardsLayers`, S14a's left panel in Layers' place: the customised cards, the count still on Ghost's defaults, and the
 *     site-wide sentence;
 *   - `CardsCanvas`, the card document (`style-guide.ts`'s `cardsDocument`) in a page card at reading width, the pack worn on
 *     it and its two card `<style>` elements rewritten in place as values change; the selected card's 2px accent ring and
 *     name tag, scrolled into view; a click on another card selects it;
 *   - `CardPanel`, S14e's right panel: the name and the `customised` pill, the card's own controls through the Kit, Reset to
 *     Ghost default behind S14c's one-step confirm (opening on Cancel), and R-6's sentence where it applies.
 *
 * NOTHING HERE STARTS SERVER WORK OR WRITES A RECORD: a value or a reset goes up as the next record through the editor's
 * `commitCards` — one journal entry, one ⌘Z, the save the editor's own indicator (R-98) — and a window reading along has
 * every control greyed by the Kit's `ReadOnly` (R-192), while the dropdown, the left list and the canvas stay live: a card's
 * choice is a view, never an edit. Every sentence is `CARD_WORDS`' (R-170); every name the registry's.
 *
 * NOT BUILT, on R-118's rule: S14b's Treatment dropdown and S14e's "From the {treatment} treatment" block (Story 10.110). */

/** The canvas's ring and name tag: state marks on the card document, styled by `chrome` below. */
const SELECTED = 'data-inflozo-card-selected'
const TAG = 'data-inflozo-card-tag'

/** The card a canvas element belongs to: the nearest ancestor that is a listed card's root, by the registry's selectors. */
export function cardAt(el: Element | null): CardEntry | undefined {
  for (let at: Element | null = el; at !== null; at = at.parentElement) {
    const hit = CARDS.find((c) => c.root !== null && at?.matches(c.root))
    if (hit !== undefined) return hit
  }
  return undefined
}

/** S14a's Card dropdown: the trigger in the template switcher's anatomy, and the menu of every card in Ghost's order. */
export function CardMenu({ card, designs, onChoose }: { card: CardEntry; designs: CardDesigns; onChoose: (key: string) => void }) {
  const menu = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const customised = new Set(designedCards(designs).map((c) => c.key))
  return (
    <>
      <button
        type="button"
        id="editor-card"
        aria-expanded={open}
        popoverTarget="editor-card-menu"
        onClick={(event) => {
          if (menu.current) openMenu(menu.current, event.currentTarget, { side: 'down', align: 'left' })
        }}
        className={triggerClass(open)}
      >
        <span className={TRIGGER_LABEL}>{CARD_WORDS.cardLabel}</span>
        <span className={TRIGGER_VALUE}>{card.label}</span>
        {open ? <ChevronUp size={12} className="text-ink-soft" /> : <ChevronDown size={12} className="text-ink-soft" />}
      </button>
      <div
        ref={menu}
        id="editor-card-menu"
        popover="auto"
        // it opens on the card in force (`aria-current`), as the switcher opens on its checked row — `openMenu`'s own one
        // frame does it; a second frame from here would race a fast keyboard
        onToggle={(event) => setOpen((event as unknown as ToggleEvent).newState === 'open')}
        onKeyDown={arrowKeys}
        className={BAR_POPOVER}
      >
        <BarMenuCard width="w-[min(250px,calc(100vw-16px))]" headingId="editor-card-heading" heading={CARD_WORDS.menuHeading}>
          {CARDS.map((c) => (
            <li key={c.key} className="flex flex-col">
              <button
                type="button"
                data-card={c.key}
                aria-current={c.key === card.key ? 'true' : undefined}
                onClick={() => {
                  menu.current?.hidePopover()
                  onChoose(c.key)
                }}
                className={`relative flex w-full items-center justify-between gap-2 rounded-[7px] px-[10px] py-[5px] text-left text-[12.5px] transition-colors ${c.key === card.key ? 'bg-coral-tint font-semibold' : 'font-medium hover:bg-paper'} ${ring}`}
              >
                <span className="truncate">{c.label}</span>
                <span className="flex shrink-0 items-center gap-[6px]">
                  {customised.has(c.key) ? <CustomisedBadge words={CARD_WORDS.customised} /> : null}
                  {/* R-6's mark, S14a's "NO COLOUR CTLS" in words */}
                  {c.colour ? null : <span data-no-colour className="font-mono text-[9px] uppercase text-ink-soft">{CARD_WORDS.noColourMark}</span>}
                </span>
              </button>
            </li>
          ))}
        </BarMenuCard>
      </div>
    </>
  )
}

/** S14a's left panel: the customised cards (each a way to it), the count still on Ghost's defaults, the site-wide sentence;
 *  and, once, the line a refused stored record leaves (the matrix's malformed row). */
export function CardsLayers({ designs, card, refused, onChoose }: { designs: CardDesigns; card: CardEntry; refused: boolean; onChoose: (key: string) => void }) {
  const customised = designedCards(designs)
  return (
    <div data-cards-layers className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-2 px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-soft">{CARD_WORDS.customisedHeading}</span>
        {customised.length === 0 ? (
          <span data-none-customised className="text-[12.5px] text-ink-soft">{CARD_WORDS.noneCustomised}</span>
        ) : (
          <ul className="flex list-none flex-col gap-px">
            {customised.map((c) => (
              <li key={c.key}>
                <button
                  type="button"
                  data-customised-card={c.key}
                  aria-current={c.key === card.key ? 'true' : undefined}
                  onClick={() => onChoose(c.key)}
                  className={`-mx-2 flex w-[calc(100%+16px)] items-center rounded-sm px-2 py-1 text-left text-[12.5px] transition-colors hover:bg-paper-sunk ${c.key === card.key ? 'font-semibold' : 'font-medium'} ${ring}`}
                >
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        )}
        <span data-on-defaults className="text-[11.5px] text-ink-soft">{CARD_WORDS.onDefaults(CARDS.length - customised.length)}</span>
      </div>
      {refused ? <p data-cards-refused role="status" className="mx-4 rounded-sm bg-paper-sunk p-[9px_10px] text-[11.5px] leading-[1.5] text-ink-soft">{CARD_WORDS.malformed}</p> : null}
      <div className="mt-auto border-t border-line px-4 py-3">
        <span className="text-[11.5px] leading-[1.5] text-ink-soft">{CARD_WORDS.siteWide}</span>
      </div>
    </div>
  )
}

/** The canvas's own two card stylesheets, as the theme would ship them for `designs`: `cards.css` (the compiler's
 *  `cardsCss`, from the vendored chunks the document carries) and the simulated `cards.min.css` without the excluded chunks.
 *  A glyph waits for the icon set (`loadIcons`), drawing nothing until it lands. */
function writeCardStyles(doc: Document, designs: CardDesigns, glyph: (name: string) => string | null): void {
  const data = doc.getElementById('card-chunks')?.textContent
  const ours = doc.querySelector('style[data-order="1c-cards.css"]')
  const theirs = doc.querySelector('style[data-order="3-cards.min.css"]')
  if (!data || !ours || !theirs) return
  const chunks = JSON.parse(data) as Record<string, string>
  const names = Object.keys(chunks).sort()
  const excluded = excludedChunks(designs, names)
  let css: string
  try {
    css = cardsCss(designs, chunks, glyph)
  } catch {
    // a divider's glyph the set has not drawn yet (or no longer draws): the rest, without it
    css = cardsCss(designs, chunks, () => '<svg xmlns="http://www.w3.org/2000/svg"></svg>')
  }
  if (ours.textContent !== css) ours.textContent = css
  // Ghost's own bundle: every chunk the theme does not copy, head cut, in Ghost's build order
  const bundle = names.filter((n) => !excluded.includes(n)).map((n) => (chunks[n] as string).split('\n').slice(2).join('\n')).join('\n')
  if (theirs.textContent !== bundle) {
    theirs.textContent = bundle
    theirs.setAttribute('data-chunks', names.filter((n) => !excluded.includes(n)).join(' '))
  }
}

/** The selection chrome's one rule set — the canvas's own 2px accent ring and the card-name tag (S14e) — written into the
 *  card document by the editor, in the APP's own tokens read off this page (the document carries the design's tokens and
 *  none of the app's), keyed on `data-inflozo-card-*` so the page at rest carries no chrome. */
function chrome(doc: Document): void {
  if (doc.querySelector('style[data-order="5-chrome"]')) return
  const app = getComputedStyle(document.documentElement)
  const coral = app.getPropertyValue('--color-coral').trim()
  const surface = app.getPropertyValue('--color-surface').trim()
  const style = doc.createElement('style')
  style.setAttribute('data-order', '5-chrome')
  style.textContent = `[${SELECTED}]{outline:2px solid ${coral};outline-offset:2px}[${TAG}]{position:absolute;z-index:2147483647;display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:5px;background:${coral};color:${surface};font:400 10px/1 ui-monospace,Menlo,monospace;letter-spacing:.04em;text-transform:uppercase;pointer-events:none}`
  doc.head.append(style)
}

/** The selected card's ring and tag on the canvas: the FIRST card of its kind (its first recorded variation), scrolled
 *  into view — or nothing, for a card Ghost prints no element for. */
function ringCard(doc: Document, card: CardEntry, scroll: boolean): void {
  chrome(doc)
  for (const el of doc.querySelectorAll(`[${SELECTED}]`)) el.removeAttribute(SELECTED)
  doc.querySelector(`[${TAG}]`)?.remove()
  const root = card.root === null ? null : doc.querySelector<HTMLElement>(card.root)
  if (root === null) return
  root.setAttribute(SELECTED, '')
  const tag = doc.createElement('span')
  tag.setAttribute(TAG, '')
  tag.setAttribute('aria-hidden', 'true')
  tag.textContent = card.label
  const box = root.getBoundingClientRect()
  const win = doc.defaultView
  tag.style.top = `${box.top + (win?.scrollY ?? 0) - 22}px`
  tag.style.left = `${box.left + (win?.scrollX ?? 0) - 2}px`
  doc.body.append(tag)
  // the card document's OWN window, never `scrollIntoView`: that scrolls every scrolling ancestor, the editor's included,
  // and a scroll in the editor closes an open menu (`openMenu`) — a card chosen from the dropdown lost the next one's focus
  if (scroll && win) win.scrollTo({ top: Math.max(0, box.top + win.scrollY - (win.innerHeight - box.height) / 2) })
}

/** The card document, once it has LOADED — never the blank one before it, nor a new one still parsing after a card's
 *  choice changed the address (its `head` and `body` are null then, and a dress would throw into the error screen; found
 *  by the keyboard gate at Story 7.13's Dev, the icon set landing mid-load). The load listener dresses it when it lands. */
const loadedDoc = (frame: HTMLIFrameElement | null): Document | null => {
  const doc = frame?.contentDocument
  return doc && doc.readyState === 'complete' && doc.getElementById('card-chunks') ? doc : null
}

/** The Editor cards canvas: the card document in a page card at reading width (S14a), with the pack worn, the two card
 *  stylesheets written for `designs`, and the selected card ringed. The document is asked for per card — Ghost's card
 *  scripts run once, at load — and a value change rewrites its styles in place. */
export function CardsCanvas({ src, card, designs, pack, frameRef, onChoose }: {
  src: string
  card: CardEntry
  designs: CardDesigns
  pack: Pick<PackChoice, 'tokens' | 'faces'>
  frameRef: RefObject<HTMLIFrameElement | null>
  onChoose: (key: string) => void
}) {
  const [icons, setIcons] = useState<((name: string) => string | null) | null>(null)
  // the pack's faces name the canvas route beside the page (`canvas?font=…`); this document is one level down
  // (`/style-guide/frame`), so they are worn as `../canvas?font=…` — the same files, the same addresses' cache
  const worn = useMemo(() => ({ tokens: pack.tokens, faces: pack.faces.replaceAll('url(canvas?', 'url(../canvas?') }), [pack.tokens, pack.faces])
  const latest = useRef({ card, designs, pack: worn, icons, onChoose })
  latest.current = { card, designs, pack: worn, icons, onChoose }
  useEffect(() => {
    let alive = true
    void loadIcons().then((m) => {
      if (alive) setIcons(() => (name: string) => iconSvg(name, m.iconDrawing))
    })
    return () => {
      alive = false
    }
  }, [])
  const glyph = (name: string) => latest.current.icons?.(name) ?? null
  /** everything the document wears, from `latest`: the pack, the card styles, the ring */
  const dress = (scroll: boolean) => {
    const doc = loadedDoc(frameRef.current)
    if (!doc) return
    wearPack(doc, latest.current.pack)
    writeCardStyles(doc, latest.current.designs, glyph)
    ringCard(doc, latest.current.card, scroll)
  }
  // a load is a new document: dress it, scroll the card into view, and take its presses
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const loaded = () => {
      const doc = loadedDoc(frame)
      if (!doc) return
      dress(true)
      // A PRESS SELECTS, AND A TOGGLE STILL OPENS: the press is never prevented on a card, so Ghost's own scripts answer
      // it; a link never navigates the canvas and a form never submits (the editor canvas's own traps, AD-21)
      doc.addEventListener('click', (event) => {
        // the frame's OWN `Element`: a node of the card document is never an instance of this window's, so a bare
        // `instanceof Element` read every press as no element — no card was ever selected and no link held back
        const target = doc.defaultView !== null && event.target instanceof doc.defaultView.Element ? event.target : null
        if (target?.closest('a[href], button[type=submit], input[type=submit]')) event.preventDefault()
        const hit = cardAt(target)
        if (hit !== undefined && hit.key !== latest.current.card.key) latest.current.onChoose(hit.key)
      })
      doc.addEventListener('submit', (event) => event.preventDefault())
      doc.defaultView?.addEventListener('resize', () => ringCard(doc, latest.current.card, false))
    }
    frame.addEventListener('load', loaded)
    if (loadedDoc(frame)) loaded()
    return () => frame.removeEventListener('load', loaded)
    // one listener per mounted frame; the document's own listeners leave with the document
  }, [])
  // a value, an undo or a reset: the two stylesheets rewritten in place — the page never reloads for it
  useEffect(() => {
    const doc = loadedDoc(frameRef.current)
    if (doc) {
      writeCardStyles(doc, designs, glyph)
      ringCard(doc, card, false)
    }
  }, [designs, icons])
  // the pack in force, worn in place
  useEffect(() => {
    const doc = loadedDoc(frameRef.current)
    if (doc) wearPack(doc, worn)
  }, [worn])
  return (
    // one stop in the tab order, as the page canvas is (UX-DR9): the document inside leaves it (`tabIndex={-1}`)
    <section aria-label="Canvas" data-cards-canvas tabIndex={0} className="relative flex min-h-0 min-w-0 flex-1 flex-col items-center bg-canvas-ground px-7 pt-6">
      <div className="flex min-h-0 w-full max-w-[864px] flex-1 flex-col overflow-hidden rounded-[6px_6px_0_0] bg-paper-raised shadow-canvas-page">
        {/* one element for the surface's life: a card's choice changes its address, so the load listener stays */}
        <iframe ref={frameRef} data-cards-frame src={src} title={`${CARD_WORDS.label} canvas`} tabIndex={-1} className="block min-h-0 w-full flex-1 border-0" />
      </div>
    </section>
  )
}

/** The value a control shows: the record's, or its start. */
const valueOf = (designs: CardDesigns, card: CardEntry, control: CardControl): string => cardValues(designs, card)[control.name] ?? control.start

/** S14e's right panel: the card's name and `customised` pill, its own controls (or its one line), Reset to Ghost default
 *  behind S14c's confirm, and R-6's sentence where it applies. Every control is the Kit's, through `ControlField`'s shapes. */
export function CardPanel({ card, designs, readOnly, swatches, onValue, onReset, onChoose }: {
  card: CardEntry
  designs: CardDesigns
  readOnly: boolean
  /** the pack's colours for the callout's background roles (S14e's swatches), by value */
  swatches: Readonly<Record<string, string>>
  onValue: (control: string, value: string) => void
  onReset: () => void
  onChoose: (key: string) => void
}) {
  const base = useId()
  const confirm = useRef<HTMLDialogElement>(null)
  const customised = designedCards(designs).some((c) => c.key === card.key)
  const values = cardValues(designs, card)
  const greyedOf = (control: CardControl): Greyed | undefined => {
    const w = control.greyedWhile
    if (w === undefined || !w.values.includes(values[w.control] ?? '')) return undefined
    return { reason: CARD_WORDS.greyed[`${card.key}.${control.name}`] ?? '' }
  }
  const field = (control: CardControl) => {
    const id = `${base}-${card.key}-${control.name}`
    const value = valueOf(designs, card, control)
    const greyed = greyedOf(control)
    const changed = value !== control.start
    const aside = changed && !greyed ? (
      <button
        type="button"
        aria-label={`Reset ${control.label}`}
        title={`Reset ${control.label}`}
        onClick={() => onValue(control.name, control.start)}
        className={`-my-1 inline-flex size-5 items-center justify-center rounded-sm text-ink-soft hover:bg-paper-sunk hover:text-ink ${ring}`}
      >
        <Undo size={12} />
      </button>
    ) : null
    switch (control.kind) {
      case 'toggle':
        return <Toggle key={id} id={id} label={control.label} checked={value === 'on'} greyed={greyed} aside={aside} onToggle={(on) => onValue(control.name, on ? 'on' : 'off')} />
      case 'roles':
        return (
          <SwatchRow
            key={id}
            id={id}
            label={control.label}
            active={value}
            greyed={greyed}
            aside={aside}
            onChange={(v) => onValue(control.name, v)}
            swatches={control.values.map((v) => ({ role: v.value, label: v.label, ...(swatches[v.value] === undefined ? {} : { color: swatches[v.value] }) }))}
          />
        )
      case 'icon':
        return (
          <div key={id} className="flex flex-col gap-[5px]" data-greyed={greyed ? '' : undefined}>
            {greyed ? (
              // P0-0: the slot greyed with its reason; the icon in force named
              <>
                <span className="text-control-label font-medium text-ink-faint">{control.label}</span>
                <span aria-disabled id={id} tabIndex={0} aria-describedby={`${id}-reason`} className="text-[12px] text-ink-faint">{value}</span>
                <p id={`${id}-reason`} className="text-[11.5px] leading-[1.5] text-ink-soft">{greyed.reason}</p>
              </>
            ) : (
              <IconPicker id={id} label={control.label} value={value} onChange={(name) => onValue(control.name, name ?? control.start)} />
            )}
          </div>
        )
      default:
        return <Segmented key={id} id={id} label={control.label} options={control.values.map((v) => ({ value: v.value, label: v.label }))} active={value} greyed={greyed} aside={aside} onChange={(v) => onValue(control.name, v)} />
    }
  }
  const none = CARD_WORDS.none[card.key]
  return (
    <div data-card-panel={card.key} className="flex flex-col gap-4">
      {card.controls.length === 0 ? (
        <p data-card-none className="text-[12px] leading-[1.5] text-ink-soft">
          {none}
          {card.key === 'gif' ? (
            <>
              {' '}
              <button type="button" onClick={() => onChoose('image')} className={`font-semibold text-coral-text underline-offset-2 hover:underline ${ring}`}>
                {CARD_WORDS.openImage}
              </button>
            </>
          ) : null}
        </p>
      ) : (
        <ReadOnly on={readOnly}>
          <div className="flex flex-col gap-[14px] rounded-[12px] border border-line bg-surface p-3">{card.controls.map(field)}</div>
          {/* S14e's foot: per card, never whole-set (S14c) — offered while there is something to reset */}
          {customised ? (
            <Button type="button" id="card-reset" variant="secondary" size={32} weight="font-medium" onClick={() => openOnCancel(confirm.current)}>
              {CARD_WORDS.reset}
            </Button>
          ) : null}
        </ReadOnly>
      )}
      {card.colour ? null : (
        // R-6, S14a and S14e: the sentence in the panel of each card that offers no colour controls
        <div data-no-colour-note className="flex items-start gap-2 rounded-sm bg-paper-sunk p-[9px_10px]">
          <InfoCircle size={13} className="mt-px shrink-0 text-ink-soft" />
          <span className="text-[11.5px] leading-[1.5] text-ink-soft">{CARD_WORDS.noColour}</span>
        </div>
      )}
      <dialog ref={confirm} onClick={closeOnBackdrop} aria-labelledby={`${base}-reset-title`} aria-describedby={`${base}-reset-body`} className={`${sheet} gap-[18px]`}>
        <div className="flex flex-col gap-[6px]">
          <h2 id={`${base}-reset-title`} className={title}>{CARD_WORDS.resetTitle(card.label)}</h2>
          <p id={`${base}-reset-body`} className="text-ui-dense leading-[1.55] text-ink-soft">{resetSentence(designs, card.key)}</p>
        </div>
        <div className="flex justify-end gap-[10px]">
          <Button type="button" variant="secondary" size={36} data-cancel onClick={() => confirm.current?.close()}>
            {CARD_WORDS.cancel}
          </Button>
          {/* R-192: the one button here that edits */}
          <ReadOnly on={readOnly}>
            <Button
              type="button"
              id="card-reset-confirm"
              variant="coral"
              size={36}
              onClick={() => {
                confirm.current?.close()
                onReset()
              }}
            >
              {CARD_WORDS.resetCard}
            </Button>
          </ReadOnly>
        </div>
      </dialog>
    </div>
  )
}

/** The panel head's own words and pill (S14e): the card's name, uppercased by CSS, and `customised` while it is. */
export function CardPanelHead({ card, designs }: { card: CardEntry; designs: CardDesigns }) {
  const customised = designedCards(designs).some((c) => c.key === card.key)
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span id="editor-panel-name" className="truncate text-[13px] font-semibold uppercase tracking-[0.04em] text-ink-soft">{card.label}</span>
      {customised ? <CustomisedBadge words={CARD_WORDS.customised} solid /> : null}
    </span>
  )
}
