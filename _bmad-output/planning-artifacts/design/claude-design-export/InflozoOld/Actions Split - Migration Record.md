# The Actions split — migration record

**Ruled by the owner, 31 August 2026.** The shared **Actions** control becomes a labelled group of one
**On · Off** toggle per action, each opening its own **P0·4** member-aware card. All toggles off is the
old "None". The owner chose the library-wide split over a headers-only split or a named exception, and
scheduled it as one job; this record is that job's receipt.

**Canonical definition:** **P0·4a** in `P0 Editor Primitives - Spec.md` — the rule, the full old-to-new
value mapping, and the three consequences. Every category cites that section rather than restating it.

**The rule it comes from, by name:** *one toggle per thing — no compound values*. Actions was the last
compound value standing after the Headers pass applied that rule to everything a single category owned.

---

## What changed, by category

| Category | Designs | Old value set | New group |
|---|---|---|---|
| **A1 Headers** | 1, 2, 5, 12, 13, 14, 15 — seven | None · Sign in · Subscribe · Sign in + Subscribe | **Sign in** · **Subscribe** |
| **A2 Announcement Bars** | 11 Toast — one | Button · Link · Button + link · None | **Button** · **Link** |
| **A4 Heroes** | 1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 18 — fourteen | Both · Primary · None | **Primary action** · **Secondary action** |
| **A4 Heroes** | 7 Masthead — one | None · Primary | **Primary action** alone, shipping off |
| **A6 CTA Banners** | 1, 2, 3, 4, 5, 7, 8, 9, 11, 13, 15 — eleven | Both · Primary | **Secondary action** alone; the primary is a stated constant |
| **A32 Paywall** | 1 Fade, 6 Split Pitch — two | Button · Button and email field (· Text link) | the form axis stays a control; **Email field** becomes a toggle |

**36 designs. 36 control tables rewritten. 36 control panels redrawn.** No design was renumbered,
renamed or redesigned; no action gained or lost a rendering behaviour. Only the way the editor reaches
the decision changed.

## What deliberately did not change

- **Single-axis controls named "Action".** A form (Button · Text link · None), a placement (At each row ·
  One for the section · None; Pinned to the foot · Under the nav), an alignment, a treatment. The test is
  unchanged: "A + B" in a value name is two things; a list of settings for one thing is one control.
  Checked in A2 (four designs), A7, A15, A21, A29, A32 (the remaining designs) and A6·10 Pair.
- **P0·4 itself.** The member-aware card is the same card; it is now reached from a toggle instead of
  from a value. No P0 frame changed.
- **The count-agnostic product copy** and **P0's per-prop mark allowlist**, both written in the
  repository, were not touched anywhere in this pass.

## Consequences, and the rule each one rests on

1. **A constant is not a toggle.** A6's primary action and A32·6's button are always drawn, so their
   groups state the constant and offer no switch — the split rule's own words. A32·6's Action row
   disappeared as a result: with the field split out, the form axis had one value left.
2. **A combination nobody drew is greyed, not invented.** A4's *Both · Primary · None* never offered a
   secondary without a primary. **Secondary action greys with its reason while Primary action is off** —
   "a secondary action needs a primary beside it" — under the greyed-control pattern (P0·0). A1's two
   actions were each a drawn value on their own and stay independent.
3. **A group with a floor keeps its last toggle on.** No group in these six categories has hit that floor;
   the rule stands for the ones that will.

## Two things found while doing it, and fixed

- **`A1-13 Centre Nav` and `A1-15 Big Type`** drew the Actions value as *"Search + Sign in + Subscribe"*.
  Search left that value when it became the standing category control (A1 §0·4) and the two panels had
  never been updated. The stale compound went with the rest of the split.
- **`A2-11 Toast`** lost four rows to an over-reaching scripted edit — Body text, Width, the universal
  block's heading and Background role. All four were restored from A2's own control table and the panel's
  markup re-balanced. Recorded because those rows are now re-authored rather than untouched.

## Open item for the owner

**The `_build/` generator scripts still carry the old vocabulary.** `_build/a32d1.js`, `_build/a32d2.js`
and their siblings construct panel rows from value arrays that still read `['Button', 'Button and email
field', 'Text link']` and the pre-split Actions lists. The drawn frames are the current truth and have
been updated; the generators have not, so **re-running them would regenerate the pre-split panels**.
Whether those scripts are live tooling that must be migrated too, or a superseded scaffold, is not
something this pass could decide without guessing — it is left alone and raised here.

## Where each category records it

Each of the six specifications carries its own **"Patch notes — the Actions split, 31 August 2026"**
entry naming the rule and listing its frames: `A1 Headers`, `A2 Announcement Bars`, `A4 Heroes`,
`A6 CTA Banners`, `A32 Paywall` and `P0 Editor Primitives`. A1's **open question 5** is struck through
and closed with the owner's name and the date; P0's **open item 8** likewise.
