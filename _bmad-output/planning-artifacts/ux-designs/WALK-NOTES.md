---
title: Inflozo — the owner's walk notes
status: live
created: 2026-09-03
purpose: the owner's optional notebook from walking step 5b and 5c. Since 2026-09-04 (R-80 amended) it is NOT the channel for UI findings — those come from his manual test of each deployed story, recorded in that story's spec
---

# Walk notes

**Walked 5b on:** _(the owner writes the date here, and on the line under `build-sequence.md` step 5b, *The walk*)_

This file is yours. Nobody else writes in it. The checklist is in `build-sequence.md` step 5b under
*The walk*; the short version: double-click `prototype/index.html`, follow each trail below to its
last page, and on each page write one line under that screen — `fine`, or what reads wrong. Every
heading below is a trail on 5b's front door and every line is a step on it, exactly as the front door
lists them. When every trail has its lines, 5b is walked (§A12 decision 3). Then open
`walkthrough/index.html` and write how it feels at the bottom.

The five things to look at hardest, from the review (`review-5b-5c-2026-09-03.md`):

- [ ] The deploy wizard — six steps on a first deploy, four afterwards; the Staff Token Offer and the Backup Gate are not drawn yet and their pages say so
- [ ] The figures on Billing, Upgrade and Pricing — the table beside each frame is Appendix F.1's; where the frame disagrees, the table is right and A7 fixes the frame
- [ ] The design ring in the editor — only the drawn positions are here and 5c does not cycle it yet; judge the model: canvas and control panel change *together*
- [ ] The connect flow's words about Ghost — three keys, no Staff token required, nothing promised that Ghost does not do
- [ ] Whether every screen reads as reachable from the product itself — the trails and the surface list are scaffolding

## The four journeys

### J1 · Connect → first deploy

_The solo publisher. One Ghost site, is its Owner, and reads “Staff Access Token” as a warning sign. Two endings, and both ship a site._

- Sign In (`sign-in.html`) — 
- Magic Link Sent (`magic-link-sent.html`) — 
- First Run (`first-run.html`) — 
- Connect · Integration (`connect-integration.html`) — 
- Connect · Keys (`connect-keys.html`) — 
- Auto-Branding (`auto-branding.html`) — 
- Redesign Proposals (`redesign-proposals.html`) — 
- Editor — she builds (`editor.html`) — 
- Deploy Destination · step 1 of 6 (`deploy-destination.html`) — 
- Staff Token Offer · step 2 (`staff-token-offer.html`) — 
- Backup Gate · step 3 (`backup-gate.html`) — 
- Pre-flight Check · step 4 (`preflight-check.html`) — 
- Snapshot Gate · step 5 (`snapshot-gate.html`) — 
- Deploy Progress · step 5 (`deploy-progress.html`) — 
- Deploy Live · step 6 (`deploy-live.html`) — 

### J2 · Blank-canvas build

_The creator with taste. Full credential reach, opinionated, will find the ceiling of a closed control vocabulary. What it proves: the canvas never tells her she is wrong._

- First Run — Blank canvas (`first-run.html`) — 
- Editor — the empty canvas (`editor.html`) — 
- Section Picker · ⌘K (`section-picker.html`) — 
- Editor — the section lands (`editor.html#selected`) — 
- Design Picker — the climax beat (`editor.html#design-picker`) — 
- Control Sidebar (`editor.html#control-sidebar`) — 
- Inline Toolbar (`editor.html#inline-toolbar`) — 
- Style Packs (`style-packs.html`) — 
- Template Switcher — not drawn (`editor.html#not-drawn`) — 
- Layers · L (`editor.html#layers`) — 
- Preview Mode · P (`editor.html#preview`) — 
- Device Preview · 3 (`editor.html#device`) — 
- Site Remix · ⇧R (`editor.html#remix`) — 
- Deploy Wizard — four steps this time (`deploy-wizard.html`) — 

### J3 · Free-plan ship

_The solo publisher, on Free, one project, one site. Open canvas, gated exits — enforcement happens only at deploy, export, and any surface exposing compiled theme code._

- Dashboard · Free (`dashboard.html#free`) — 
- Editor — Pro designs placed (`editor.html#pro-badge`) — 
- Ship it — the Pro Exit Sheet, before the wizard opens · the climax beat (`pro-exit-sheet.html`) — 
- Itemised — the four remedies (`pro-exit-sheet.html#remedies`) — 
- Upgrade Sheet — or she swaps (`upgrade-sheet.html`) — 
- Pricing — the same terms, publicly (`pricing.html`) — 
- Into the wizard — step 1 (`deploy-destination.html`) — 
- Backup Gate (`backup-gate.html`) — 
- Pre-flight Check (`preflight-check.html`) — 
- Snapshot Gate (`snapshot-gate.html`) — 
- Deploy Live (`deploy-live.html`) — 

### J4 · Downgrade recovery

_The multi-site operator. Six projects, two sites, 312 MB of assets, and a client’s card was cancelled. Their churn is client attrition, not dissatisfaction — which is exactly why this must not feel like a punishment._

- Grace Banner — payment failed (`grace-banner.html`) — 
- During grace, nothing is withdrawn (`grace-banner.html#kept`) — 
- Billing — update the card, or let it lapse (`billing.html`) — 
- Over-Limit Sheet — the climax beat (`over-limit-sheet.html`) — 
- Sites — disconnect down to one (`sites.html`) — 
- Assets — read-only until under (`assets.html#over-quota`) — 
- Deploy History — retained, never pruned (`deploy-history.html`) — 
- Resolved — nothing was lost (`billing.html#limits`) — 

## The eight flows

### F1 · Pre-deploy snapshot gate

_FR-J13 · fires at the FIRST theme upload to a site, deploy-only included_

- Running (`snapshot-gate.html`) — 
- The two wrong sentences (`snapshot-gate.html#respec`) — 
- Capture failed (`snapshot-gate.html#failed`) — 
- And why its reason is wrong (`snapshot-gate.html#respec-b12b`) — 
- Restore, from the snapshot row (`deploy-history.html#additions`) — 

### F2 · The three-party edit-lock choreography

_FR-D18 · addendum.md §AD2_

- The reader (`edit-lock.html#reader`) — 
- The holder (`edit-lock.html#holder`) — 
- The takeover (`edit-lock.html#takeover`) — 
- The one deviation (`edit-lock.html#respec`) — 
- Deploy and export require the lock (`edit-lock.html#deploy-blocked`) — 

### F3 · The guided routes-upload card

_FR-I4 · routes.yaml uploads automatically; this is the fallback_

- The card as drawn (`routes-fallback.html`) — 
- Its cause is wrong (`routes-fallback.html#respec`) — 
- And its Ghost menu path is gone (`routes-fallback.html#menu-path`) — 
- Add the token instead — and it becomes automatic (`staff-token-offer.html`) — 

### F4 · The library-update confirm

_FR-J14 · the flow §37.7 found correct_

- The notice, in the project card (`dashboard.html#library-update`) — 
- The confirm — mandatory before compile (`library-update-confirm.html`) — 
- Its one stale line (`library-update-confirm.html#stale`) — 
- Why a confirm exists at all (`library-update-confirm.html#why`) — 
- Pre-flight, and on to the deploy (`preflight-check.html`) — 

### F5 · The Preview-only explanation, and its clearing conditions

_FR-C2 · probed, never asked_

- Set at connect, by the probe (`connect-keys.html#validation`) — 
- The notice (`preview-only-notice.html`) — 
- Who clears it, and when (`preview-only-notice.html#probe`) — 
- Preview-Only Destination (`deploy-destination.html#preview-only`) — 
- And the copy that wastes an afternoon (`deploy-destination.html#preview-fix`) — 
- The site card (`sites.html`) — 

### F6 · The post-deploy template-binding checklist

_FR-I6 · a checklist, not a notification_

- Deploy Live — “one step left” (`deploy-live.html#binding`) — 
- The checklist as drawn (`template-binding-checklist.html`) — 
- Every step on it is wrong (`template-binding-checklist.html#corrections`) — 
- One nudge, once, a day later (`notifications.html`) — 
- Empty Template Warning — not drawn (`editor.html#not-drawn`) — 

### F7 · The pre-deploy backup gate

_BACKUP-GATE.md · a consent gate, not a technical control_

- The gate — not drawn anywhere in the export (`backup-gate.html`) — 
- Ghost(Pro) — the honest block (`backup-gate.html#ghostpro`) — 
- The checked-row list it inherits (`backup-gate.html#inherits`) — 
- And the six-step rail it sits in (`deploy-destination.html#first-deploy`) — 

### F8 · Deploy history with pinning

_FR-J7/J9 · at most 10 stored versions on Pro and 3 on Free_

- The drawer as drawn (`deploy-history.html`) — 
- Pinning, the snapshot row, the partial row (`deploy-history.html#additions`) — 
- The limit is stated, not implied (`deploy-history.html#limit`) — 
- Partial success — a state nobody drew (`partial-success.html`) — 
- One state, two causes (`deploy-uploaded.html#same-state`) — 

## 5c — how it feels

_Open `walkthrough/index.html` after 5b and click through it as a user would. Free text; a line per
screen if you like, or just what stood out. It is not the gate._

-

## Anything else

-
