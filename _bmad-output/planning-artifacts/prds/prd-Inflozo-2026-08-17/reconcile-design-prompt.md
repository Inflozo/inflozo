---
title: Reconciliation — Claude Design master prompt vs PRD
source: ../../design/claude-design-prompt.md
prd: ./prd.md
date: 2026-08-17
---

# Design-Prompt ↔ PRD Reconciliation

Severity legend: **gap-critical** (PRD must absorb it) · **gap-nice** (PRD should reference it) · **stale** (design prompt must change on next revision) · **contradiction** (the two documents disagree; a ruling is needed).

---

## 1. Functional expectations in the design prompt absent from the PRD

- **gap-nice** — **Magic-link resend with 30 s countdown** (S1, state b). FR-A1 covers magic-link auth but no FR specifies a resend affordance or its cooldown. Add to FR-A1 or accept as design-owned detail.
- **gap-nice** — **First-run onboarding chooser** (S2: three large choice cards — Connect / Starter / Blank — plus "You can do all of this later"). FR-B2 and FR-C1 cover the *pieces*, but no FR owns the first-run onboarding surface itself or its skippability. (It also predates FR-C7 — see §4.)
- **gap-nice** — **Dashboard top-bar search** (S3). FR-B covers cards, sites strip, quota meter, and "What's new", but no FR requires project search on the dashboard.
- **gap-nice** — **"Free-only" filter toggle** in the Section Picker (S5) and public gallery (M4). Neither FR-D12 nor FR-N2 mentions it. With the open-canvas/gated-exits model (FR-L3) this filter is now *more* load-bearing — it is how a Free user plans a deployable design — so it should be added to FR-D12/FR-N2 rather than dropped.
- **gap-nice** — **"Watch it work" demo video CTA** (M1 hero secondary action). Implies a produced product-demo asset that no FR or epic (E14) accounts for.

## 2. Qualitative material the FR structure silently drops

- **gap-critical** — **The voice canon and named microcopy.** The deploy action is named **"Ship it"** (subsequent: "Ship update"); success toast "Live! Your site just got gorgeous."; empty dashboard "Every great site starts somewhere. Yours starts with 480 gorgeous sections."; gscan step "Checking your theme (Ghost will love it)"; rule "never cutesy in destructive or billing flows." FR-J8's progress UI uses generic labels ("Checking (gscan)") and never names the primary CTA. This copy is implementation-affecting (button labels, toasts, stage names) and currently has no PRD home — reference the design prompt §2.6 as the normative copy source or lift the strings into FRs.
- **gap-nice** — **"Playful Pro" personality definition** (Framer polish × Canva warmth; "a slot machine you always win"). PRD §1.2 says "genuinely fun… like a toy" but never names the personality or its anchors; downstream agents lose the calibration.
- **gap-nice** — **Motion spec** (§2.5): 160 ms ease-out standard, 200 ms overlay scale-fade, 180 ms shuffle slide-fade, springy drag with 2° tilt, 1–2 px hover lifts. Only the 300 ms pack crossfade survived into FR-E2; the rest of the motion language has no PRD reference.
- **gap-nice** — **One-confetti-moment rule** is *partially* carried: P6 says "one celebratory moment (first deploy)", but the PRD does not bind it to FR-J8's Live state, nor carry the "first deploy only" scoping or the explicit reduced-motion caveat (NFR-5 is generic). Cross-reference P6 ↔ FR-J8.
- **gap-nice** — **Accessibility specifics beyond NFR-5**: coral usage restricted to ≥16 px semibold text or non-text elements (AA), visible focus rings everywhere, 44 px touch targets on mobile frames. NFR-5/FR-G4 state WCAG AA generically; the coral rule is the one most likely to be violated without being written down.
- **gap-nice** — **"Skeletons, not spinners" and every-state-designed** (§3 principle 5). No NFR/FR requires designed empty/loading/error states; E15 audits would have no criterion to check against.
- **gap-nice** — **Restraint system**: one coral action per surface; marigold only for Pro/celebration; Pro badge = marigold ✦ pill. FR-L3's "subtle ✦ badge" preserves the glyph but the color-discipline system exists only in the design prompt.
- **gap-nice** — **Companion-doc linkage**: Epic E1 says "design tokens/components per the companion design doc" without naming a document. The PRD should explicitly cite `design/claude-design-prompt.md` (§2–§4) as that companion doc so the reference resolves.

## 3. Contradictions between design prompt and current PRD decisions

- **contradiction** — **S5: "Pro card clicked on Free plan → slide-up upgrade sheet"** directly violates FR-D12/FR-L3/FR-L5 ("Free users can add any Pro section — enforcement happens at the exits"; "never while playing with Pro sections on canvas"). The picker must add Pro sections for Free users with no sheet; the upgrade sheet moves to the deploy/export exit (see §4).
- **contradiction** — **S4 sidebar shows "posts-per-page" as a Page-tab setting.** The PRD derives `posts_per_page` from the Home feed section's Count control (FR-J2) and per-collection settings in the Routes Manager (FR-I2). A page-level posts-per-page control has no backing model and would conflict with both.
- **contradiction** — **S4 top bar "autosave dot ('Saved' fades in/out)"** predates the local-first decision. FR-D10 requires four indicator states — Saved locally / Syncing / Synced / Retrying — plus a per-user periodic-autosave toggle and always-available ⌘S. A single binary "Saved" dot misrepresents (and would hide) the honest local-vs-cloud split the Addendum A1 explicitly wants surfaced.
- **contradiction** — **S6 shows Variant Shuffle "highlighting the changed Layout Picker selection" in the sidebar.** In the PRD model a variant is a distinct registry entry with its own control schema (FR-G3); shuffle is surfaced via a sidebar *variant carousel* (FR-D13), while the Layout Picker is a per-section control for arrangements *within* a variant. The mock conflates the two mechanisms.
- **contradiction** (low) — **S8 deploy modal uses a radio (Deploy / Deploy & activate)**; FR-J8 records the owner requirement that these are "distinct buttons." The Ship-it dropdown's separate menu items may satisfy it, but the modal interaction needs a ruling.
- **contradiction** (low) — **Persistent dashed "Upgrade" ghost cards** on the dashboard (S3) and Sites (S11) vs FR-L5's "contextual upgrade prompts at exactly four moments… never a blocking interstitial elsewhere." Passive cards aren't interstitials, but they are standing prompts outside the four moments — needs an explicit ruling (allow-as-passive or remove).
- **contradiction** (low) — **M4 gallery has one top-level light/dark toggle**; FR-N2 specifies a **per-preview** light/dark toggle on each variant card.
- **contradiction** (low) — **S1 presents passkey as a co-equal auth option on the sign-in/sign-up card.** FR-A2: magic link is primary and first; passkeys can only be *registered* after sign-in, are feature-flagged, and are offered on *subsequent* sign-ins. S1 needs a returning-user framing and a flag-off variant; a new user cannot use the passkey button at all.

## 4. Stale design-prompt facts — what a design revision must change

- **stale** — **ZIP export is absent everywhere.** FR-J12 grants theme ZIP export on all plans, yet no screen offers it: the Ship-it dropdown (S4) lists only Deploy · Deploy & activate · History. Add an Export ZIP action (top bar and/or history drawer) — this is the highest-priority missing surface together with the next item.
- **stale** — **The exit-gating sheet is undesigned.** With FR-L3's open canvas, the *replacement* for S5's deleted upgrade sheet is the itemized **"Pro sections in this design"** block sheet at deploy/export (upgrade, or Shuffle-swap each listed section to a Free variant). Also new: the subtle ✦ badge on placed Pro sections *on canvas* — a canvas-adjacent state the "no chrome at rest" principle must accommodate.
- **stale** — **Redesign proposals (FR-C7) have no screens.** Needed: post-auto-branding "redesign my site" moment showing 2–3 starter+pack proposals populated with the user's real content (structurally varied, not palette-only), pick-to-create, and the re-runnable entry on the dashboard's New-project path. S2/S3 predate this entirely.
- **stale** — **Inline formatting toolbar (FR-D4) has no frame.** A Koenig/Medium-style floating toolbar with exactly bold / italic / underline / link (via Link Picker) on any text prop, headlines included — a new S4 sub-state to design.
- **stale** — **Site Remix (FR-D17) has no affordance.** Whole-canvas re-roll with scope options (pack only / variants only / both) and single-step undo — nothing in S4 or §4 components anticipates it.
- **stale** — **Edit lock (FR-D18 / Addendum A2) has no states.** Needed: read-only project mode, "Request editing" nudge, holder-side release prompt, "No response; that session has X unsaved edits" takeover dialog, and revived-holder "your unsynced edits were not included" notice.
- **stale** — **Layers panel lacks the pinned "Site-wide" group** (FR-D5): headers/announcement bars/footers are global singletons with a globe badge, present in every template's panel, non-reorderable into page flow. The §4 component list has a Moon badge but no globe badge — add it.
- **stale** — **Content-source pill (FR-D15)** — "Previewing with: {site} / Sample content", switchable — is missing from the S4 top bar.
- **stale** — **Routes.yaml "one more step" card (FR-I4) is missing from the deploy flow.** Ghost has no official routes-upload API; the guided manual card (download button + Ghost Admin → Labs instructions) is the primary flow and "deploys never silently skip routes." S8/S9 must carry this moment.
- **stale** — **Pre-activation snapshot (FR-J13)** needs two designed moments: the warning shown when the snapshot cannot be captured before first Activate, and the snapshot's restore row in the History drawer (exempt from retention pruning).
- **stale** — **"Updates available" notice (FR-J14)** — library-version advance with a human-readable change summary, on project card and/or editor — has no design; explicitly in-app only (FR-P2).
- **stale** — **Per-project credit-removal control (FR-J15)** — Pro can disable the "Built with Inflozo" footer + README credit per project — has no home (project settings? deploy modal?). Free always retains credits; M5/S12 should market credit removal as a Pro feature.
- **stale** — **Grace-period banner (FR-L2)** — `pro_past_due`, 7-day grace — undesigned.
- **stale** — **Shuffle surplus-items microcopy (FR-D13)** — sidebar count "8 items · 3 shown in this design" when a variant renders fewer list items — missing from S6.
- **stale** — **Light-only project variant (FR-D7)** — hidden sun/moon toggle when the project is Light only, plus the per-section "Clear dark overrides" action — missing from S4/S7.
- **stale** — **Template switcher shows "Members" as one segment**; FR-D6/FR-I1 require three member templates (Signup / Signin / Account) — needs a sub-selector or three entries.
- **stale** — **Starter chooser fidelity**: S2 shows a "fan of 3 mini template previews"; FR-B2/FR-O2 require full-page scrollable previews with a light/dark toggle before creation, across all 10 starters (Appendix E).
- **stale** — **M5 pricing limits table** (projects, sites, sections, storage, rollback) must add ZIP export (Free ✓, with credits/Free variants) and credit removal (Pro), and reframe the sections row per Appendix F's open-canvas split ("canvas: all 487 · deploy/export: Free variants only").
- **stale** — **Legal pages absent from the marketing screen list** — FR-N1 requires Terms, Privacy, and a Refund policy (Dodo-mandated); the design prompt's M-series stops at M9 with no legal template.
- **stale** — **S12 omits "sign out everywhere"** (FR-A6) from the Security section.
- **stale** — **S7 token editors omit two tokens** — shadow level (None/Subtle/Lifted) and link style (Underline/Accent) from FR-E1 — showing only radius/density/button-style.

---

**Totals: 42 findings** — 5 gaps in the PRD (§1) · 8 qualitative drops (§2) · 8 contradictions (§3) · 21 stale items for the next design revision (§4).
