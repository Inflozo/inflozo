'use client'

import { useRef, useState, type RefObject } from 'react'
import { Button } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel, sheet, title } from '@/components/kit/dialog'
import { ring } from '@/components/kit/greyed'
import { Refresh } from '@/components/kit/icons'
import { NOTHING_TO_REMIX, REMIX_WORDS, UNDO_NOTE, remixAsk } from '@/lib/remix'

/* ─────────────────────────────────────────── Story 5.12 — THE DICE, AND THE ONE CONFIRM BEHIND IT (FR-D17).
 *
 * NO FRAME DRAWS THIS CONTROL. The export never drew any button for Site Remix — `EXPERIENCE.md:154` gives `⇧R`
 * as the surface's only door — so the button is extrapolated from the control it sits beside, `mode-toggle.tsx`
 * (R-74), and the die itself is R-163: the owner's own "real little cube", in our token colours, which is R-92's
 * third stated exception. Its geometry is ModeToggle's to the pixel (28 × 28, an 8px radius, ink-soft, hovering
 * to paper-sunk, the press prevented so it never steals the canvas's caret).
 *
 * ICON-ONLY IS PAID FOR: `REMIX_WORDS` is the accessible name AND the hover title, through `DESIGN.md:534-536`'s
 * carve-out — the one R-132, R-136 and R-159 already use — and it carries the key, so a screen reader hears the
 * shortcut it could have pressed instead.
 *
 * THE QUESTION COMES FIRST AND THE ROLL IS THE ANSWER (R-164, owner, 2026-09-20). A press opens the confirm AT
 * ONCE — nothing has been decided yet, so there is nothing to animate — and the cube tumbles only once **Remix**
 * is pressed, with the canvas re-rolling as it settles. That is the slot machine the FR asks for: you pull the
 * handle, the die runs, and the result is there when it stops. It also means the roll can never delay the
 * question, which is what the first build did.
 *
 * THE RE-ROLL LANDS ON THE ROLL'S OWN `transitionend`, NEVER ON A TIMER. `globals.css`'s reduced-motion block
 * forces every transition to 0.01ms, so the event fires at once there and after the roll otherwise: one code
 * path, nothing to keep in step with the CSS, and no `setTimeout` a reader who asked for no motion would still
 * wait out. The guard is `propertyName === 'transform'`, because a transition list fires once per property.
 *
 * THE CONFIRM IS B8 AS RE-SPECIFIED (`B Missing Surfaces.dc.html:1587`): its heading glyph, its sentence, its
 * coral primary and its "one undo, always available" line, inside the app's ONE dialog vocabulary
 * (`kit/dialog.ts`, 460px, opening on Cancel — R-115, UX-DR14). WITHOUT its "Re-roll what" group (one Style Pack
 * exists — R-118, UX-DR3), without "Include the header and footer" and "Every page" (R-161), and without its
 * toast (EXPERIENCE.md:541 makes the count a polite `#editor-said` announcement instead).
 *
 * WHERE NOTHING CAN MOVE IT SAYS SO AND OFFERS CLOSE ALONE (R-12's shape, as R-134 already answers an empty
 * "Clear dark overrides"). That is today's answer in the customer's own editor, because every category in the
 * shipped library holds one design (R-158) — honest, not a bug, and not a greyed button.
 */

/** The six rotations that bring each face to the front. Any six distinct pairs would do; these are the cube's own. */
const FACES: readonly (readonly [number, number])[] = [
  [0, 0], [0, 180], [0, 90], [0, -90], [-90, 0], [90, 0],
]

/** The resting tilt, applied to the SAME transform the roll writes so the two cannot fight. It is what makes 18px
 *  read as a cube rather than a square with dots: two faces stay in view at rest. */
const TILT = { x: -18, y: 24 }

/** `run(gesture)` reaches the dice's own press through this, so `⇧R` and the button are one handler (R-141).
 *  It is `press`, not `roll`: since R-164 the press opens the question and the roll is what CONFIRMING it looks
 *  like, so a key that rolled would skip the confirm entirely. */
export type RemixHandle = { press: () => void }

export function RemixDice({
  canvas,
  count,
  undoable = false,
  onRemix,
  handle,
}: {
  /** the canvas being re-rolled, named in the words — R-161 scopes Remix to the one you are looking at */
  canvas: string
  /** how many sections would actually change, derived by the caller from the rings (standing rule 4) */
  count: number
  /** does one press really put it all back? True in the editor; `/controls` stores nothing and has no history */
  undoable?: boolean
  onRemix: () => void
  handle?: RefObject<RemixHandle | null>
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  /** CANCEL PUTS FOCUS BACK ON THE DICE, and it has to be said rather than left to the user agent. A modal
   *  `<dialog>` restores focus to whatever held it when `showModal()` ran — and `onMouseDown` is prevented
   *  below (ModeToggle's rule), so a press of the BUTTON never focuses it and the restore lands on the canvas,
   *  or on `<body>` where nothing had focus yet. `⇧R` routes through this same `roll()`, so the dice is the
   *  invoking control on both doors and is where Cancel, `Esc` and the backdrop all return to. */
  const die = useRef<HTMLButtonElement>(null)
  /** a second press while the cube is in the air is ignored: one roll, one dialog */
  const rolling = useRef(false)
  const [turn, setTurn] = useState({ ...TILT, rolls: 0 })

  /** THE DICE'S ONE DOOR, and both the button and `⇧R` come through it: the confirm opens at once (R-164). A
   *  press while the cube is still in the air is ignored — one roll, one re-roll. */
  const press = () => {
    if (rolling.current) return
    openOnCancel(dialog.current)
  }
  if (handle) handle.current = { press }

  /** CONFIRMED: the cube runs, and `onRemix` fires as it settles, so the dice is rolling for exactly as long as
   *  the re-roll takes to arrive. */
  const go = () => {
    dialog.current?.close()
    rolling.current = true
    const face = FACES[Math.floor(Math.random() * FACES.length)] ?? FACES[0]!
    // TWO WHOLE TURNS ON TOP OF THE FACE, so the value always changes however the draw falls — a transform that
    // did not change would fire no `transitionend`, and the re-roll would never land
    setTurn((was) => ({ x: TILT.x + face[0] - 360 * (was.rolls + 1), y: TILT.y + face[1] + 720 * (was.rolls + 1), rolls: was.rolls + 1 }))
  }

  return (
    <>
      <button
        ref={die}
        type="button"
        id="editor-remix"
        aria-label={REMIX_WORDS}
        title={REMIX_WORDS}
        // ModeToggle's rule, for ModeToggle's reason: the press never takes focus out of the canvas, so a caret in
        // a text prop survives it
        onMouseDown={(event) => event.preventDefault()}
        onClick={press}
        className={`remix-dice inline-flex size-7 items-center justify-center rounded-sm transition-colors hover:bg-paper-sunk ${ring}`}
      >
        <span
          aria-hidden
          className="remix-dice__cube"
          style={{ transform: `rotateX(${turn.x}deg) rotateY(${turn.y}deg)` }}
          onTransitionEnd={(event) => {
            if (event.propertyName !== 'transform' || !rolling.current) return
            rolling.current = false
            onRemix()
          }}
        >
          {FACES.map((_, n) => (
            <span key={n} className={`remix-dice__face remix-dice__face--${n + 1}`} />
          ))}
        </span>
      </button>

      <dialog
        ref={dialog}
        data-remix-confirm
        onClick={closeOnBackdrop}
        onClose={() => die.current?.focus()}
        aria-labelledby="editor-remix-title"
        aria-describedby="editor-remix-body"
        className={`${sheet} gap-[18px]`}
      >
        <div className="flex flex-col gap-[6px]">
          <h2 id="editor-remix-title" className={`flex items-center gap-[10px] ${title}`}>
            {/* B8's own heading glyph — the Kit's `Refresh`, the same one Shuffle wears in the section's pill */}
            <Refresh size={16} className="shrink-0" />
            Remix {canvas}?
          </h2>
          <p id="editor-remix-body" className="text-ui-dense leading-[1.55] text-ink-soft">
            {count > 0 ? remixAsk(count, canvas) : NOTHING_TO_REMIX}
          </p>
        </div>
        <div className="flex items-center gap-[10px]">
          {count > 0 && undoable ? <span className="text-helper-caption text-ink-soft">{UNDO_NOTE}</span> : null}
          <span className="flex-1" />
          <Button type="button" variant="secondary" size={36} data-cancel onClick={() => dialog.current?.close()}>
            {count > 0 ? 'Cancel' : 'Close'}
          </Button>
          {count > 0 ? (
            <Button
              type="button"
              variant="coral"
              size={36}
              data-remix-go
              onClick={go}
            >
              Remix
            </Button>
          ) : null}
        </div>
      </dialog>
    </>
  )
}
