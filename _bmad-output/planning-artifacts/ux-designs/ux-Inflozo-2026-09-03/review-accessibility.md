---
title: Accessibility lens — the reviewer gate on step 5's spines
status: record
created: 2026-09-03
lens: behavioural accessibility floor, against NFR-5 (axe-core · WCAG 2.1 AA · zero violations) and NFR-6
subject: EXPERIENCE.md and DESIGN.md, as they stood at commit 61127bb3
---

# Accessibility review — eight findings, all eight resolved

Run at Finalize as the one ad-hoc lens (the rubric walker's Pass 1 coverage checks ran inline and
passed). The lens was told to judge only what the two spines specify, to leave visual contrast to
`DESIGN.md`, and to say so plainly if it found nothing real.

**It found something real in every case, and six of the eight were defects in the spine rather than
gaps in the product.** All are fixed; this file is the record of what was wrong, because a review
whose findings are absorbed silently teaches nobody.

---

## 1 · §7.3's focus-model deliverable was never delivered — the most serious of the eight

**PRD §7.3 says, verbatim: "The focus order is a UX-pass deliverable"**, and names three parts — the
canvas must be **reachable and escapable** by keyboard, selection state must **survive chrome taking
focus**, and the mark toolbar must be **operable without destroying the iframe selection it acts
on**. The first draft answered part one with a single restatement ("the tab order crosses it as if
it were not there"), left *escapable* contradicted (`Esc` was bound to deselect), and specified the
Inline Toolbar as a mouse consequence with no keyboard route in or out.

**Fixed.** § Accessibility Floor now opens with "The focus model across the canvas boundary" and
discharges all three: a skip link plus the canvas as one tab stop; an **`Esc` ladder** that steps
outward one level per press and announces where it landed; selection explicitly surviving a move to
the sidebar; and **`⌥F10`** into the toolbar with the range captured on raise, re-applied on a mark,
and restored exactly on dismiss.

**How it was missed:** §7.3 is in the architecture-direction section, not in §5's requirements or in
the step-5 prompt's source list, and the pass read the FRs and the NFRs rather than §7.3's prose.
A UX-pass deliverable stated only inside a technical-assumptions section is easy to walk past.

## 2 · Keyboard reorder was mandated by one section and made impossible by the next

The floor said "Every action reachable without a mouse, including **reorder**. A drag that has no
keyboard equivalent is a defect." Interaction Primitives then called FR-D11's map "the complete set"
— it has no reorder binding — and closed the door with "states added later carry no shortcut,
deliberately." Four drag surfaces had no keyboard path: Layers, the section drag handle, item lists,
and the Assets drop zone.

**Fixed**, by drawing the distinction that resolves it rather than by adding global shortcuts:
**FR-D11 governs *global* bindings; standard within-component keyboard behaviour is not a shortcut
in its sense and is required by NFR-5.** A table now gives every reorderable surface `↑`/`↓` for
focus and **`⌥↑`/`⌥↓` to move**, and states that the Assets drop zone is also a file input.

## 3 · A countdown that destroys work, with no extension and no announcement

F2's B5b popover carries a countdown; on expiry the requester may take over and the holder's
unsynced edits are cleared unconditionally with no merge path. The first draft parked the duration
as "tunable defaults the Architect owns" — but a tunable default is an *operator* control, not a
user one — and the floor's live-region list named only B5c, which is what the *loser* sees
afterwards.

**Fixed**, and the fix turned out to be a clarification rather than a new affordance: **it is a
no-response timer, not a decision timer.** It now stops the instant the holder interacts with the
popover at all, focus included, so it only runs out when nobody is there. **B5b is announced
assertively**, because a request that arrives silently is one a screen-reader user answers by not
answering.

## 4 · The floor was gated by a tool that cannot see most of it

Of the eight bullets as first written, **only one is reliably axe-core-detectable** — that a greyed
control's reason is real text in the reading order. Keyboard completeness, cross-frame focus order,
focus visibility, reduced motion, default focus on destructive confirms and live regions all sit
outside a static rule engine. Worse, NFR-5 says the scan runs on NFR-6(a)'s render matrix and "no
second matrix exists" — and that matrix is *section designs*, so the floor's own "Scope includes the
Inflozo app itself" had no named target at all.

**Fixed**, by adding a table that names a verifier per floor item — axe-core for what it can see,
NFR-6(d) E2E for the keyboard paths, a manual screen-reader pass for the live regions, NFR-6(a) with
the query forced for reduced motion and a viewport case for 200% zoom.

> **And one flag left open, deliberately.** **NFR-6(d)'s E2E list names no accessibility journey** —
> auth, connect, build, shuffle, dark authoring, deploy, rollback, billing, quotas, all mouse-driven.
> Four rows of that table depend on an E2E pass that does not exist in the list. Adding one
> keyboard-only journey is the smallest fix; **it is an NFR amendment and was not made here.**

## 5 · Eight unmodified single-character shortcuts, with no remap and no disable

`L` `P` `.` `[` `]` `1` `2` `3`. **WCAG 2.1.4 Character Key Shortcuts is Level A, therefore inside
the AA threshold**, and requires one of: turn off, remap, or active-on-focus. It matters concretely
here because the editor hosts a `contenteditable` inside an iframe, so a speech-input or
tremor-affected user emits a stray `P` or `R` outside a text field and fires Preview Mode or a Site
Remix.

**Fixed** with the third and least invasive remedy: **every single-character shortcut is live only
while the editor shell holds focus, and never while a text field or `contenteditable` has it.** No
new settings surface. **axe-core does not detect this**, so it would have shipped.

## 6 · The 1024px floor evicted the low-vision user instead of degrading for them

R-76's floor was stated as a CSS width. **A 1440px display at 200% browser zoom presents roughly a
720px CSS viewport**, so a user who zooms is thrown out of the editor onto Small Screen Notice —
a straight **WCAG 1.4.4 Resize Text (AA)** failure, and the opposite of what the owner ruled, which
was about phones.

**Fixed:** the notice now fires on **a coarse pointer at a small viewport**, and the editor **stays
usable at 200% browser zoom on a desktop-class device**, reflowing rather than redirecting.
`DESIGN.md`'s `app-floor` token is a device threshold, not a zoom threshold. **This narrows how
R-76 is measured; it does not reverse it**, and the owner was told.

## 7 · The live-region rule contradicted itself in one sentence, and omitted the core loop

It read: "the persistence indicator, deploy progress and the takeover notice announce **politely**;
the takeover notice is **assertive**." Both cannot be true. And nothing announced the changes the
product is actually built around: `]` rearranging a section inside the iframe, Variant Shuffle,
`⇧R` re-rolling every design, the 300ms pack crossfade, and the Backup Gate's deploy button silently
becoming enabled.

**Fixed** with a politeness table, and a **canvas status region** that announces the design and its
position after a change — *"Design 8 of 18 — Image Backdrop"* — the pack after a switch, the count
after a Remix, and the gate's enablement.

## 8 · Three shape-only marks broke the floor's own "text equivalent" claim

The floor asserted "Colour classifies; it never carries the only signal" while A5 made
designed-versus-auto-generated a bare hollow-or-filled dot, marked feature images with "a small
marker", and `DESIGN.md`'s `moon-badge` was a 12px shape carrying the sole signal that a control has
a dark override.

**Fixed** at each mark in prompts A5 and A6, and generalised in both spines: **a shape carries a
signal on its own no more than a colour does.** `DESIGN.md` gains a Don't for it and the badge specs
gain their labels. The Pro badge needed no change — the kit and B10 already draw ✦ *and* the word.

---

## What the lens checked and found genuinely sound

The greyed-versus-absent pattern with its reason in a designed helper-caption slot rather than a
`title` (rulings R-33 / R-68 / R-69) · "Remove never greys" · the persistence indicator's four
labels-not-dots · the single reduced-motion-respecting confetti · refusals stated with reasons
rather than silent failures (the pin refusal, the second Post Content, the Empty Template Warning).

One further catch, taken: the destructive-confirm rule was written as a **closed three-item list**
in a repo whose standing rule is that counts are derived — and it already omitted project delete,
delete-in-use assets and D3a's "Overwrite and ship anyway". It is now stated as a rule.
