import { SyncAlert, SyncArrowUp, SyncCheck, SyncClock, SyncUpload } from './icons'

/* THE PERSISTENCE INDICATOR — B Missing Surfaces, B6 · "PERSISTENCE, FIVE STATES", as ruling R-142 amends it.
 *
 * B6 DREW A DOT AND A LABEL. The owner replaced both on 2026-09-19: "instead of dot, keep the colors but with
 * icons inside a circle. Use appropriate Tabler Icons for different stages. Add title/labels so we can hover
 * over it to know the status." What stays from the frame is the set of states, their meanings and their hues;
 * what changes is that the state is carried by a GLYPH and the word moved to the hover and to assistive tech.
 *
 * WHY THAT IS SAFER THAN THE DOT IT REPLACES, and the reason the ruling was worth taking. Measured against the
 * bar's own paper, B6's four dots come in at 1.62:1 (grey), 2.86:1 (coral), 2.75:1 (mint) and 4.85:1 (danger) —
 * three of them under the 3:1 WCAG 2.1 asks of a graphic that carries meaning. They were legal only because the
 * LABEL carried it and the dot was decoration. Worse, coral "Syncing" against mint "Synced" is **1.04:1** — as
 * near identical as two colours get, and it is the pair that separates "still sending" from "safe on the
 * server". With a distinct glyph per state colour is no longer the only signal, which is what
 * `EXPERIENCE.md`'s "colour classifies; it never carries the only signal" actually asks for.
 *
 * SO THE FILL IS EACH HUE'S DEEPER `-text` VALUE, NOT ITS BRIGHT ONE, and the glyph is white on it: 5.28-5.41:1
 * for the icon and 4.85-4.97:1 for the circle against paper, where the bright fills give 2.99:1 and 3.11:1. The
 * project has done exactly this once before and for exactly this reason — `marigold-solid`, where white on the
 * frame's own resting gold measured 3.61:1 and the resting fill became the frame's darker hover shade (Story 1.5,
 * ruled by the owner 2026-09-06). Same hues, the export's own deeper value of each.
 *
 * THE FIVE LABELS ARE STILL B6'S FIVE, and the union is still the compile error for a sixth. They are no longer
 * PRINTED; they are the `title` a hover shows and the accessible name a screen reader reads, which is the text
 * equivalent `EXPERIENCE.md`'s accessibility floor requires every state to have. A sighted user gets glyph +
 * colour; everyone gets the word.
 *
 * NEVER A SPINNER. B6's own note survives the ruling untouched: nothing here animates, and Syncing is a static
 * arrow rather than a turning one.
 */

export type PersistenceState =
  | 'Saved on this device'
  | 'Syncing'
  | 'Synced'
  | 'Retrying'
  | 'Syncing every change to the cloud'

/** Per state: the circle's fill, and the glyph inside it. Colour and shape are redundant with each other by
 *  construction — neither is ever the only signal. */
const look: Record<PersistenceState, { fill: string; Glyph: typeof SyncCheck }> = {
  // the two resting states, and the whole of what R-144 made visible: green is "on the server", grey is
  // "written here, not sent yet". Before that ruling both were one grey dot.
  Synced: { fill: 'bg-mint-text', Glyph: SyncCheck },
  'Saved on this device': { fill: 'bg-ink-soft', Glyph: SyncClock },
  Syncing: { fill: 'bg-coral-text', Glyph: SyncArrowUp },
  Retrying: { fill: 'bg-danger-text', Glyph: SyncAlert },
  // no local storage: the device holds nothing, so every change goes straight up. Grey like the resting state
  // and told apart from it by its glyph, never by its colour.
  'Syncing every change to the cloud': { fill: 'bg-ink-soft', Glyph: SyncUpload },
}

export function PersistenceIndicator({
  state,
  seconds,
}: {
  state: PersistenceState
  /** Retrying counts down to the next attempt, so waiting feels finite. It has nowhere to be printed since
   *  R-142, so it rides in the name — the hover and the announcement both carry it. */
  seconds?: number
}) {
  const { fill, Glyph } = look[state]
  const name = state === 'Retrying' && seconds !== undefined ? `Retrying · ${seconds}s` : state
  return (
    <span className="inline-flex items-center">
      {/* The circle is `aria-hidden` and the NAME lives in the live region below it: one announcement, not two,
          and `title` is what a hover shows. A `role="img"` here would be read as well as the status, so the
          same three words would arrive twice. */}
      <span
        aria-hidden
        title={name}
        data-sync-state={state}
        className={`inline-flex size-4 shrink-0 items-center justify-center rounded-full text-surface ${fill}`}
      >
        <Glyph size={10} />
      </span>
      {/* POLITE, and the text equivalent the accessibility floor asks of every state. It is `sr-only` rather
          than absent: the words are B6's own and they still have to reach somebody. */}
      <span role="status" className="sr-only">
        {name}
      </span>
    </span>
  )
}
