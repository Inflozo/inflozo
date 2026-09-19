---
name: Inflozo
status: final
created: 2026-09-03
updated: 2026-09-04
sources:
  - "{planning_artifacts}/prds/prd-Inflozo-2026-08-17/prd.md"
  - "{planning_artifacts}/prds/prd-Inflozo-2026-08-17/addendum.md — §AD1, §AD2"
  - "{planning_artifacts}/prds/prd-Inflozo-2026-08-17/reconcile-designs.md — §SCREENS, §37.7"
  - "{planning_artifacts}/prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md — R-1 … R-85, §A15 (the Appendix A export, verified 2026-09-04)"
  - "{planning_artifacts}/architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md — AD-1 … AD-38"
  - "{planning_artifacts}/architecture/architecture-Inflozo-2026-08-19/BACKUP-GATE.md"
  - "{planning_artifacts}/design/claude-design-export/Inflozo/ — the whole directory"
---

# Inflozo — Experience Spine

## Foundation

Inflozo is a visual site builder for **Ghost CMS**. A user drags ready-made section designs onto a
canvas that renders the same markup Ghost will render, styled by the same CSS Inflozo ships; the
product compiles the result into a clean Ghost theme and deploys it to the customer's own site.

**Two authorities, and they do not overlap.**

- **`prd.md` decides behaviour** — what a surface does, its states, its requirements, and every
  string it prints (Appendix H is the voice canon).
- **The Claude Design export decides visual language** — which components a surface is built from,
  its tokens, spacing, density and tone. This is **ruling R-74** (owner, 2026-09-02), binding until
  the project finishes.

"Design artifacts are non-normative" has always been scoped to behaviour. It has never meant a flow
may invent a second interface vocabulary. **Where a flow needs behaviour the drawn screens do not
show, the components stay and what they do changes.** `DESIGN.md` is the visual identity reference
and is itself a transcription of the export.

**Every surface below has one stable name, and that name is used identically here, in the journeys
and in the flows.** Step 5b turns this document into a static clickable prototype — one plain HTML
page per surface (ruling **R-75**) — and it keys its pages off these names. A surface that goes by
two names becomes two half-pages.

**Every surface below points at a drawn frame by filename.** Until 2026-09-04 a surface with no
frame named the frame it was extrapolated from and carried a Claude Design prompt in Appendix A;
those prompts ran, their export landed the same day, and the `D1`…`D8` canvases they drew are cited
below (`reconcile-designs-decisions.md` §A15 verified them frame by frame). Appendix A stays as the
record of what was asked. There are no surfaces described in prose and left there.

**One user role.** Every account has identical capabilities, differentiated only by plan — Free or
Pro (PRD §3, Appendix F.1). The `admin` claim that gates suggestions-board moderation is an internal
Supabase claim, not a product role, and has no surface here.

### Form factor — desktop and tablet, and the floor is designed

*Ruling **R-76** (owner, 2026-09-03).* Resolved per surface by reading the frames, as the export
drew them:

| | Widths | Surfaces |
|---|---|---|
| **Phone, tablet and desktop** | 390 · 834 · 1440 | Sign In · Magic Link Sent · Dashboard · Account Menu · Notifications · Billing · Suggestions · every marketing page |
| **Tablet and desktop only** | 834 · 1440 | Editor and everything it contains · Section Picker · Variant Shuffle · Style Packs · Deploy Wizard · Deploy History · Routes Manager · Theme Settings · Translations · Assets · Sites · Editor Cards · Paywall Editor · Post Content · Error Pages |

**The editor is drawn at 834 and at 720 as well as at 1440** — `D8 Editor Below 1440.dc.html` D8a
(834 × 1112, touch) and D8b (720 × 900, captioned as a 1440 display at 200% browser zoom). Until the
D canvases landed on 2026-09-04 every one of those surfaces was drawn at 1440 and at no other width,
and the 834 column was the owner's ruling rather than the export's evidence; prompt A8 is what made
it true, because R-74 forbids a surface that exists only in prose.

On a **coarse pointer below 834px** (a phone — the tablet A8 drew at 834 keeps the editor; ruling R-76, its
width amended to 834 by R-87 on 2026-09-04), opening a project lands on **Small Screen Notice** — a designed
surface, not a broken layout — which says the editor needs a wider screen and offers what does work from a phone:
the project's deploy history, a one-tap rollback, the sites list and billing. The Dashboard itself
stays fully usable at 390, exactly as `S3 Dashboard.dc.html` draws it.

This matches what was drawn rather than deciding against it: `S1`, `S3` and `M1`–`M9` each carry a
390 frame, and `S4`–`S14` carry none — and **Small Screen Notice** is drawn at 390
(`D4 Dashboard Sheets and Blocks.dc.html` D4f), captioned with its coarse-pointer condition.

> `R Responsive System.dc.html` is **not** this app's responsive spec. Its first line says so —
> "responsive behaviour is a property of the archetype, not the design" — and it governs the
> **fifteen structural archetypes of the sections Inflozo builds**, at 1440 / 834 / 390. It is
> consumed by the section library, not by the chrome.

---

## Information Architecture

Every row names a drawn frame. The surfaces that had none until 2026-09-04 name the D canvas and
the frame label the Appendix A prompt drew for them — `D1`…`D8`; there is no D7, because A7
corrected frames that already existed.

### Marketing — in scope only where a journey lands on it

| Surface | Frame | Reached from | Purpose |
|---|---|---|---|
| **Pricing** | `M5 Pricing.dc.html` | Upgrade Sheet · Grace Banner · marketing nav | Free and Pro, the two purchasable plans. `pro_past_due` is never shown as a plan (Appendix F.1) |

The other marketing pages exist and are drawn (`M1`–`M9`); this pass does not re-specify them.

### Entry

| Surface | Frame | Reached from | Purpose |
|---|---|---|---|
| **Sign In** | `S1 Sign In.dc.html` S1a | inflozo.com, any signed-out URL | Magic link or passkey. No passwords exist anywhere in the product (FR-A1) |
| **Magic Link Sent** | S1b | Sign In | Address echoed, 15-minute validity, resend countdown, "Use a different email" |
| **Passkey Prompt** | S1c | Sign In | The OS sheet. Inflozo draws the page behind it and nothing of the sheet itself |

### Onboarding

| Surface | Frame | Reached from | Purpose |
|---|---|---|---|
| **First Run** | `S2 Onboarding.dc.html` S2a | `/`, whenever the account has **no project and no connected site** — so the first sign-in, and every sign-in until one of the two exists | Three doors: connect a Ghost site (recommended) · start from a starter · blank canvas. **Built by Story 3.8 (2026-09-11) at `/start`**, the last story of Epic 3, planned after 3.4 so the Recommended door runs connect → auto-brand → a project (DW-19, closed). **Nothing is remembered about it** — the owner's Question 1 ruling (option 1, 2026-09-11): it is not a one-time event with a mark against the account, it is simply what *Projects* looks like while you have nothing, and it stops being that the moment you have a site or a project. The rule is derived from two counts on every render (`lib/first-run.ts`), so the story added no column and needed no migration. The redirect lives in **`(dashboard)/layout.tsx`, not in the page**, and that is measured rather than stylistic: `loading.tsx` is a Suspense boundary, so a `redirect()` from inside the page is flushed after the shell and can only be delivered as a CLIENT navigation — on a production build `/` answered **200**, the customer watched the project-card skeleton for ~150ms before the welcome screen (the owner's own finding 2 on Story 3.4, reintroduced on the first screen a new customer sees) and with scripts off the redirect never arrived at all. From the layout it is a real **307**. A layout is not given `searchParams`, so `proxy.ts` hands it the query string (`SEARCH_HEADER` in `routing.ts`): **any** query string renders the dashboard, because `/?restored=1` and `/?signed-out-failed=1` carry sentences that live there and a redirect would swallow them. **Four departures from the frame, each deliberate (R-74):** it lives inside the app shell, as S2b·1, S2b·2 and S2c already do — `/start` is not in the shell's `BARS`, so there is no top bar and no second call to action competing with the three cards; the starter door's count comes from Appendix E's roster, not from S2a's "Three ready-made sites", and its one sentence is shared with the New Project Sheet so the two surfaces cannot disagree about what a starter is; "colours", not the frame's "colors"; and 834 and 390 are extrapolated — `grid-cols-1 tablet:grid-cols-3`, the app's one collapse rule, with the illustrations scaled to the narrower cell at 834 and the 44px heading at S3b's own 28px below tablet; one rounding inside that: the starter fan's centre card is cast at `.12` alpha in the frame and the token layer has `.08` and `.14`, so it takes `shadow-md`. **And the door has two sides** (review, 2026-09-11): `start/layout.tsx` sends an account that has a project or a site from `/start` back to `/` — a project made from the welcome screen's own Blank door used to leave the customer standing on the three doors, and a typed `/start` drew them over an account with work; both layouts ask one reader, `server/first-run.ts`, so there is one decider. The nav marks Projects current on `/start`, because it is that page |
| **Connect · Integration** | S2b·1 | First Run · Sites · Connect Site Modal | Guided, screenshotted: create a Custom Integration in Ghost Admin |
| **Connect · Keys** | S2b·2 | Connect · Integration | API URL + Admin API key + Content API key. **Not the Staff Access Token** (FR-C1). On Ghost(Pro) the API URL is the site's `*.ghost.io` **admin domain**, which can differ from the public domain (read at docs.ghost.org/admin-api, 2026-09-03: "All Ghost(Pro) blogs have a `*.ghost.io` domain as their admin domain"); the public `url` is read from `GET /admin/site/` at connect and on the daily health check, so the Sites card, "View site" and Deploy Live link to the public domain, never the admin one (F-068, FR-C8) |
| **Auto-Branding** | S2c | Connect · Keys, on success · the Sites card's offer link | Accent, navigation and logo read from the site — "Use your brand" or "Skip". **TWO COLUMNS AND TWO CHROMES since the owner's ask of 2026-09-10:** the left column is everything READ off the customer's Ghost — logo, title and host, accent, menu, the fonts note and the mini homepage wearing the accent — and the right is everything DECIDED: "Which project?" with the two presses below it. Reached from the **Sites card's offer link** it is a POPUP over the list — `/sites?brand=…`, a parameter on the list itself; reached from **connect** it is still S2's full-screen onboarding beat, which the owner ruled should stay that way (Question 7, option 1, 2026-09-10). One component draws both, so the two cannot disagree |
| **Redesign Proposals** | `B Missing Surfaces.dc.html` B22 *(re-specified — see below)* | Auto-Branding · Dashboard | 2–3 whole-site starter × Style Pack combinations on the user's real content (FR-C7, ruling R-78) |
| **Starter Chooser** | B23a *(Appendix E's roster since 2026-09-04, A7 item 19)* | First Run · New Project Sheet | All ten starters (Appendix E), filterable, with a "Start empty" escape |

### Dashboard and account

| Surface | Frame | Reached from | Purpose |
|---|---|---|---|
| **Dashboard** | `S3 Dashboard.dc.html` S3a · S3b empty · S3c Free | sign-in, logo | Project cards, asset meter, what's-new |
| **New Project Sheet** | `D4 Dashboard Sheets and Blocks.dc.html` D4a · D4b Free at the cap *(from S2a + B23a)* | Dashboard "New project" | FR-B2's creation paths: Starter · Blank · Redesign proposals. **Duplicate is not one of them** — owner ruling R-93 (2026-09-06) keeps duplicating on a project's ⋯ menu (FR-B3). D4a still draws the door; it is not built, and the export is not edited (R-74) |
| **Account Menu** | S3d | avatar | Account settings · Billing · Suggestions · Docs · Shortcuts · Sign out |
| **Notifications** | S3e + B21 | bell | Deploy outcomes, site health, compatibility notices, billing, library updates (FR-B7) |
| **Sites** | `S11 Sites.dc.html` S11a · S11c Free | nav | Connected sites with health badges. **Built, and the badges are Story 3.7's (2026-09-10):** the card's state line — the owner's own, DW-57 — now carries three states rather than one, mint **Connected**, marigold **Reconnect needed** with the reason and the date under it and a **Reconnect** button beside them (the frame's `:94-100`), and marigold **Checking…** with a pulsing amber dot while a check is in flight. The third is the owner's own addition of 2026-09-10 and no frame draws it (R-74). The reason and date come from the OPEN `site_health` notification row, not from a column, so the story added none and needed no migration. The ⋯ menu is complete bar the frame's **Reconnect** row, which is drawn on the unhealthy card instead: **Use this site's brand** (the owner's instruction of 2026-09-10, moved off the card body), **Re-check connection**, **Manage API keys**, a rule, **Disconnect** |
| **Connect Site Modal** | S11b | Sites | Connect · Integration and Connect · Keys, as a modal |
| **Manage Keys** | `S11e Manage Keys Popup.dc.html` **S11e** *(the owner's, 2026-09-10; in the export by his ruling at Story 3.6's Question 4)*, over S11d + B20 *(re-specified)* | site ⋯ menu, **and the unhealthy card's own Reconnect button** *(Story 3.7, 2026-09-10 — the second entry point this row had been promising)* | Three credentials, each present or absent with what it enables (FR-C8). **Built by Story 3.6 (2026-09-09) at `/sites/keys?site=…`, and Story 3.7 gave it the SECOND entry point this row had been promising (2026-09-10):** "Reconnect needed" is a `sites.health` state, and that column, its badge, the daily check that writes it and the once-per-transition email are 3.7's — built, so the unhealthy card now carries a **Reconnect** control that is a `PanelLink` to this same panel, one plain click opening it as the window over the list and a modified or scripts-off click taking the full page, exactly as the ⋯ row does. Two departures from the frames, both recorded in `lib/connect-rule.ts`'s `KEYS` and asserted there (R-74): **no reveal control and no trailing characters** (the secret half never leaves the Admin chokepoint, so the mask is the Admin key's public id half and the screen says Inflozo cannot read the rest back either), and **"Added" / "Not added" rather than B20's "Working"** (nothing checks on load — **Test connection** is where a customer asks, and the continuous answer is 3.7's badge). Also absent, each deliberately: **"Passed · 2 min ago"** (a stored `last_checked_at` — Story 3.7 writes that column and draws its stamp on the CARD's "Checked …", not on this panel, so **Test connection** still stores nothing and this screen still states present or absent) and any **plan field** (probed, never declared — FR-C2). **AND SINCE THE OWNER'S TEST OF 3.6 (2026-09-10) IT IS A POPUP OVER THE SITES LIST, NOT A SCREEN INSTEAD OF IT** — his finding 1, and his finding 2 redrew it: S11d's single column ran off the bottom of a laptop, and **S11e** holds the same content in two — the three keys on the left, everything you READ rather than type in a context rail on the right, with Test connection on the rail's bottom edge. *"Same content as the long screen, nothing removed"* is the frame's own constraint and it is what was built; the one addition to it is the Admin row's mask, which the owner ruled back in at Question 3 (2026-09-10) because it is the only thing on the screen that says WHICH key is stored. **The popup is `/sites?manage=…` — a PARAMETER ON THE LIST, not a route of its own** *(his second test of it, 2026-09-10, findings 1 to 5)*: it was an intercepting route for one day, and an intercepted popup lives at the panel's own URL, so opening it moved the path off `/sites` and took the shell's top bar with it, and every answer from inside it — **Test connection**, a save, a refusal — was a navigation Next did not intercept, so the full page loaded behind the still-open window and took the Sites list with it. On a parameter the route never changes, the credential read is still taken once and only when somebody opens it (with no `?manage=` there is nothing to render), and `/sites/keys?site=…` stays exactly where it was for a typed URL, a modified click, a refresh and a scripts-off browser. Both draw one component |
| **Connected Sites Strip** | B25 | Dashboard | Health at a glance, "3 of 10" |
| **Assets** | `S10 Assets.dc.html` S10a–d · D8d drop zone with a Choose files button | nav | Library, drag-drop, delete-in-use, details |
| **Billing** | `S12 Billing.dc.html` S12a | Account Menu | Plan, limits, email, passkeys, danger zone |
| **Upgrade Sheet** | S12b | any Pro exit, any cap | Free vs Pro, monthly / yearly |
| **Delete Account** | S12c | Billing | Typed confirm, serious voice |
| **Invoices** | S12d | Billing | Receipts, Dodo portal link |
| **Suggestions** | `S13 Suggestions.dc.html` S13a–c | Account Menu | Board, submit sheet, empty state |
| **Over-Limit Sheet** | D4c · D4d Which project stays editable · D4e Read-only project | grace expiry · any blocked exit while over | Itemised: what is over and by how much (FR-L3) |
| **Small Screen Notice** | D4f, at 390 | opening a project on a coarse pointer below 834px | What works from a phone (R-76) |

### Editor

| Surface | Frame | Reached from | Purpose |
|---|---|---|---|
| **Editor** | `S4 Editor.dc.html` S4a rest · S4b hover · S4c selected · `D8 Editor Below 1440.dc.html` D8a at 834 · D8b at 720 | project card | Top bar · Layers · canvas · Controls sidebar (FR-D1) |
| **Template Switcher** | S4a · `D5 Canvas Markers and Template Switcher.dc.html` D5b, complete | top bar | Home · Post · Page · Tag · Author · **Membership (Signup / Signin / Member Home)** · 404 · conditional Private · custom templates · + New template (FR-D6) |
| **Layers** | B7 · D8e focused row *(as R-126 amends B7, 2026-09-18)* | `L` · left panel | Ordered sections; a **Site-wide** group above the page's own, both drawn the same with a hairline between, the row's only control a `⋯` |
| **Design Picker** | B1a | Controls sidebar | The category's full design ring — "Design 7 of 18", twelve thumbs then a `+N` tile |
| **Design Nav** | B1b | hover on a section | The same counter and arrows riding on the section itself |
| **Control Sidebar** | B2 + `Editor Sidebar Kit.dc.html` | selection | Per-design controls, ~4–7 per design |
| **Inline Toolbar** | `P0-1 Inline Text Toolbar.dc.html` | text selection | Bold · italic · underline · link, and nothing else (FR-D4) |
| **Link Entry** | B4b + P0-1 | Inline Toolbar → link | Searches the user's own posts and pages as you type |
| **Section Picker** | `S5 Section Picker.dc.html` S5a · S5c dark | `⌘K` · "+ Add section" | Full-screen, category rail, live previews in the project's own pack |
| **Variant Shuffle** | `S6 Variant Shuffle.dc.html` | `[` `]` · Shuffle | Cycles a section's ring in place, carrying content |
| **Style Packs** | `S7 Style Packs.dc.html` S7a–d | sidebar "Change" | The pack roster, mid-switch crossfade, edit and create |
| **Site Remix** | B8 *(re-specified)* | `⇧R` | Re-rolls pack and/or every design, content preserved (FR-D17) |
| **Preview Mode** | B3a editing · B3b preview | `P` · Preview | Behaviours run, all editing chrome gone (FR-D20) |
| **Device Preview** | B11a · B11b *(corrected 2026-09-04, A7 item 6)* | `1` `2` `3` | Both axes resize to a real device size (FR-D8, AD-21) |
| **Persistence Indicator** | B6 *(extended)* | always in the top bar | Saved on this device · Syncing · Synced · Retrying (FR-D10) |
| **Edit Lock** | `B Missing Surfaces.dc.html` B5a read-only bar · B5b request popover · B5c takeover modal | opening a project someone else holds · Request editing · take over | One editing context per project (FR-D18, flow **F2**): the reader's bar, the holder's popover, the takeover confirm. Its fourth state — Ship it or Export from a read-only session — is `D8 Editor Below 1440.dc.html` D8g |
| **Content Source Pill** | B9 | canvas foot | "Previewing with: {site} / Sample content", and the preview subject (FR-D15, FR-D22) |
| **Preview Subject Picker** | D5e *(from B9's menu)* | Content Source Pill | Which post / page / tag / author this canvas renders (FR-D22) |
| **Member State Preview** | S4d *(corrected 2026-09-04, A7 item 18)* + B9 | top bar eye | Anonymous · Free member · Paid member — **three states** (FR-D16) |
| **Pro Design Badge** | B10 | selection of a Pro design | A price tag, not a lock. No sheet on click, ever |
| **Auto-Generated Marker** | D5a | any untouched synthesized template | "Auto-generated — edit anything to make it yours" (FR-D6, Appendix H) |
| **Main Feed Marker** | D5c | Layers · the section itself | Which feed is the paginated one, and reassign (FR-H2) |
| **Page 2 Preview** | D5d | main-feed section · pagination control | "Page 2" with "Back to page 1" (FR-D21, Appendix H) |
| **Empty Template Warning** | D5f | removing the last section of a custom template | "The page still loads, wearing a different design" (FR-I1) |
| **Editor Cards** | `S14 Editor Cards.dc.html` S14a–e | Editor left nav → Template surfaces | Every Koenig card, six A33 treatments, per-card reset (FR-Q7) |
| **Paywall Editor** | `C Post Body.dc.html` **C3a** | Editor left nav → Template surfaces | Its own canvas, one design active per project (FR-H6) |
| **Post Content** | `C Post Body.dc.html` C2a | Post and Page canvases | The section that renders the article (A25) |
| **Style-Guide Fixture** | `C Post Body.dc.html` C4 | every body, always | The generated article every post design is judged against (FR-H3, FR-H4) |
| **Error Pages** | Editor left nav → Template surfaces *(A31 designs)* | Editor left nav | `error.hbs`, and `private.hbs` when a Private Gate is designed |
| **Theme Settings** | `D6 Theme Settings Completed.dc.html` D6a Pro · D6b Free *(completes B17)* | Editor left nav | `posts_per_page`, project mode, credits, the custom-settings builder (FR-Q1/Q2/Q3) |
| **Custom Settings Builder** | D6a right column · D6c Text-prop confirm | Theme Settings | Promote a control to a Ghost theme setting |
| **Translations** | B18 *(re-specified)* | Theme Settings | Every chrome string the theme prints (FR-Q6) |
| **Routes Manager** | `S9 Routes.dc.html` S9a · S9b error · S9d empty *(re-specified)* | Template Switcher → Manage routes | Collections, custom routes, taxonomies, live YAML |
| **New Collection Sheet** | S9c *(re-specified)* | Routes Manager | Path, filter conditions, template, per-route limit |
| **New Route Sheet** | S9e | Routes Manager | A template or a channel |

### Deploy

| Surface | Frame | Reached from | Purpose |
|---|---|---|---|
| **Deploy Wizard** | `S8 Deploy.dc.html` S8a–d | "Ship it" · `⌘⏎` | 4 steps normally; **6 on the first deploy to a site** |
| **Deploy Destination** | S8a · `D1 First-Deploy Gates.dc.html` D1a on the first deploy | step 1 | The site, Deploy & activate vs Deploy only, **and the theme name** (FR-J10) |
| **Staff Token Offer** | D1b · D1c declined | step 2, first deploy to a site only | "One more step unlocks a safety net" — and its decline path (FR-C1) |
| **Backup Gate** | D1d self-hosted · D1d′ shortcut ticked · D1e Ghost(Pro) | step 3, once per site | The consent checklist. **Blocks the deploy button** (`BACKUP-GATE.md`) |
| **Pre-flight Check** | S8b *(extended)* | step 4 | **Compiles the theme and runs gscan on it** — the `compiling` and `checking` stages of the deploy job (AD-20): templates, helpers, routes, and every warning the PRD names. The compiled artefact is what Ship it uploads |
| **Drift Report** | `D3 The Drift Report.dc.html` D3a drift found · D3b could not verify · D3c no drift | inside Pre-flight, every deploy after the first | A passing row when nothing changed; **it stops the deploy** when something did, naming the files by layer name (FR-J16) |
| **Library Update Notice** | B14a | project card | "Updates available" (FR-J14) |
| **Library Update Confirm** | B14b *(re-specified)* | before compile, whenever the library has advanced | The mandatory consent step (FR-J14) |
| **Pro Exit Sheet** | B13a *(corrected 2026-09-04, A7 item 4)* | any blocked exit on Free | Four remedies, itemised (FR-L3) |
| **Snapshot Gate** | B12a running · B12b degraded *(corrected 2026-09-04, A7 item 2)* | the first named stage of step 5, first upload to a site only | Inflozo's own archive of the live theme, before the upload begins (FR-J13) |
| **Deploy Progress** | S8c | step 5 | Uploading → Activating — the artefact Pre-flight compiled and checked, on the same job row (AD-20, FR-J8). **No Cancel once uploading starts** — S8c greys it with its reason, "Once it starts, it finishes" (corrected 2026-09-04, A7 item 13) |
| **Deploy Live** | S8d | step 6, when the deploy activated | The product's one confetti moment |
| **Deploy Uploaded** | `D2 Deploy History Completed.dc.html` D2f | step 6, when the user chose **Deploy only** | The other ending. Uploaded on purpose, not live, with Activate one click away |
| **Deploy Failure** | S8d′ | step 5, on failure | A human sentence and the action that fixes it |
| **Partial Success** | D2e in the wizard · D2d the history row | upload succeeded, activation failed | "Your theme is on your site but isn't live yet" (FR-J8) |
| **Preview-Only Destination** | S8a′ *(re-specified)* | step 1, Preview-only site | Export instead of deploy |
| **Preview-Only Notice** | B15 *(re-specified)* | site card · Sites | What Preview-only is, and what clears it (FR-C2) |
| **Routes Fallback Card** | B16 *(corrected 2026-09-04, A7 item 3)* | after deploy, when routes could not be uploaded | The guided manual upload (FR-I4) |
| **Template Binding Checklist** | B19 *(corrected 2026-09-04, A7 item 1)* | Deploy Live, when custom templates were emitted | One row per emitted template (FR-I6) |
| **Deploy History** | S8e · D2a pinning, Pro · D2b pin refusal · D2c Free | clock icon · Ship it ▾ → History | Versions, pinning, rollback, restore-to-original (FR-J7/J9, F8) |
| **Grace Banner** | B24 *(corrected 2026-09-04, A7 item 5)* | every surface, while `pro_past_due` | 7 days, and what does not happen (FR-L2/L3) |

### The three canvases that are not pages

`C Post Body.dc.html` draws a left-nav group the rest of the export does not: **Template surfaces**
— Paywall, Cards, Error pages — sitting under **Post template** in the Editor's left navigation.
That group is the entry point for **Paywall Editor**, **Editor Cards** and **Error Pages**, and it
is drawn in ink chrome rather than paper so a canvas that is not a page announces itself. It is
also where FR-Q9's fallback lands: a treatment whose host section is absent is still selected here.

### Editor shell — what the frames fix, and what is open for the architect

**What the frames fix** (F-078). There is **one editor shell**, and it is `S4a`'s: the top bar, the
**Layers** panel on the left, the canvas, the Controls sidebar on the right. The **Template Switcher**
in the top bar is the canvas selector — Home, Post, Page, the archives, the membership canvases, 404,
Private, custom templates — and switching a template is navigation, not a mode. `C3a`'s **Template
surfaces** group (Paywall · Cards · Error pages) is the entry to **Paywall Editor**, **Editor Cards**
and **Error Pages**; it hangs under **Post template** and is reached through the switcher, so the left
panel stays Layers on every canvas. Where `C1a`/`C3a` draw that group as its own ink-chrome list and
`S4a` draws Layers alone, the two are the same shell on two canvases, not two shells.

**Settled by Story 5.1 (2026-09-17), and left open here until then:** the **URL scheme** and the
**iframe canvas boundary** (the record is `spec-5-1-the-editor-shell-the-canvas-boundary-and-the-url-scheme.md`
§ Design Notes; AD-21 carries the boundary). *The scheme:* `/projects/<uuid>` is the editor on Home and
`/projects/<uuid>/post` · `page` · `tag` · `author` · `error` the other canvases; `/home` 308s to the
project's address; `index`, `private`, `custom-<slug>`, `paywall` and `cards` are reserved and 404 until
their stories open them. The address names the project and the canvas and nothing else — selection,
device, mode, View as, Preview and folds are modes, never in the URL — and changing canvas is a push, so
Back walks the canvases visited and then leaves. The uuid, never the slug, and another user's project
answers the same 404 as a missing one. *The boundary:* inside the canvas is the site and what is painted
on it (the insertion hairline, PAUSED, the empty icon slot — CSS keyed on `data-inflozo-*`); outside
is everything you press, the hover quick actions and "+" included, as one floating bar anchored to the
hovered section. The prototype's inline canvas was a rendering shortcut, not a statement about either.
**Story 5.2 moved the name tag and both outlines outside (2026-09-17, R-120)**, with a selected Pro
design's Pro badge (R-119): each is anchored to its section the way the pressable chrome is, inside the
page card so the card clips it. The tag because inside the frame it would shrink with the fit, borrow
the site's fonts and need the design's root to be positioned; the outlines because the browser floors
an outline's or a border's width to whole pixels before the fit shrinks the frame (0.6px and 1.2px at
1440, measured), so each is a box the section's size whose line is an inset shadow at S4b's 1px and
S4c's 1.5px (AD-21; the spec's Design Notes). **The owner's test moved that layer into the canvas
(2026-09-17):** drawn by the editor page, the outline slid a few pixels onto neighbouring sections while
the canvas scrolled, because the page repositioned it a frame after the browser scrolled the canvas. The
outlines, the tag and the Pro badge are now a layer inside the canvas document, beside the site's
sections and never in them, so they scroll with their section; they look exactly as before and leave
nothing behind at rest (AD-21; R-120).

---

## Voice and Tone

Microcopy only. The brand voice lives in `DESIGN.md` § Brand & Style; the canon is **PRD Appendix
H**, which governs every string in this document. `appendix-h1-string-catalog.md` is a different
thing — it is the catalog of strings that ship **inside the user's theme** and is not app copy.

Short, warm, confident, lightly playful. Errors are human and name the fix.

**Canonical strings, reused verbatim:**

| String | Where |
|---|---|
| **"Ship it"** ("Ship update" thereafter) | the deploy button, everywhere |
| **"Live! Your site just got gorgeous."** | Deploy Live |
| **"Every great site starts somewhere. Yours starts with hundreds of gorgeous sections."** | Dashboard, empty |
| **"Checking your theme (Ghost will love it)"** | Pre-flight Check |
| **"One more step unlocks a safety net — a copy of your current theme before we replace it, plus a check that nothing else has changed it."** | Staff Token Offer |
| **"This name is permanent. Ghost remembers it on every page you assign, and renaming it later would quietly unassign them all."** | the custom-template naming step, once |
| **"Auto-generated — edit anything to make it yours"** | Auto-Generated Marker |
| **"Page 2"** with **"Back to page 1"** | Page 2 Preview |
| **"Gated content — shown with sample text"** | the body on a members-only canvas |

| Do | Don't |
|---|---|
| "Ghost said no — this Admin API key no longer works. It was regenerated or removed in Ghost Admin." + Reconnect *(a 401 `Unknown Admin API Key` — Admin API keys never expire, `MEASUREMENTS.md` §37)*. **The shipped copy widened this to "this Admin API key doesn't match your site" (R-100, 2026-09-09)**, because the same 401 also means a key issued by a DIFFERENT Ghost install and the voice must not name a cause it cannot tell apart | "An error occurred." · "Your Admin key expired." — a failure Ghost never produces · **"These keys belong to a different Ghost site" on a 401** — Ghost gives one answer to a wrong key and to another site's key, so this claims a diagnosis Inflozo never made |
| "Your theme is on your site but isn't live yet." | "Deploy failed." |
| "7 unsynced edits will be lost." | "Some changes may not be saved." |
| "Hundreds of gorgeous sections" | any design, category or free-set total |
| "Free includes 1 project. Pro gives you 25." | hiding a product limit |
| Billing, delete and takeover surfaces stay serious | a pun anywhere near money or loss |
| "We can't see whether you did this." | implying a verification that does not exist |

**Three rules that are structural rather than stylistic.**

1. **Exactly one confetti moment exists** — the first successful deploy — and it respects
   reduced-motion.
2. **The unit is called a *design***, in every user-facing string and every marketing page. Not a
   layout, a variation, a template or a block. "Variant Shuffle" keeps its name as a *feature*.
3. **Product copy about the library is count-agnostic.** A **product limit** — 10 stored versions on
   Pro and 3 on Free, 1 project · 1 site on Free, 10 MB per upload — is a requirement and a flow
   that hides it is wrong. A **library total** — how many designs, categories or free designs exist
   — is forbidden, because FR-J14 commits to monthly drops and any number baked into copy is wrong
   within a month.

---

## Component Patterns

Behavioural. Visual specs live in `DESIGN.md` § Components.

| Component | Behavioural rules |
|---|---|
| **Greyed control** | Exists here, unavailable now — and **always shows the reason**, as one sentence in the helper-caption slot. Never a tooltip. Drawn in `P0-0 Greyed Control Pattern.dc.html` |
| **Absent control** | Never exists here. The panel says why. **The two are different and a user must be able to tell them apart** — the test is whether the control could *ever* do anything in this design: could-never → absent; could-but-not-now → greyed (rulings R-33, R-68) |
| **Greyed control whose value is not one of its own** | Marks no value, and the reason names the value in force — "the list you picked is the order" (ruling R-69) |
| **Empty list** | Neither greyed nor absent. A picker with nothing picked is drawn as the empty list it is (R-68) |
| **Item list** | Add · Remove · drag, on an array the **user typed**. Never on a Ghost-bound repeat, which gets a count instead. **Remove never greys** — at the floor it stays active and explains itself (ruling R-12) |
| **Reordering by drag** | While a row is dragged it lifts, and **a dashed empty slot the size of the row shows where it will land**; the rows between slide aside to make room, and nothing reorders until the drop. **Every editable list does this** — the item list, Layers, a hand-picked post list — and every one keeps its keyboard equivalent (`⌥↑` / `⌥↓`). No frame draws the slot; it is the Kit's own dashed border, the "+ Add" button's (owner, 2026-09-13, finding 9 on Story 4.5; built in `components/controls/item-list.tsx`) |
| **Design picker** | Position is always shown ("Design 7 of 18"). `]` past the last returns to the first. Switching **carries, parks and defaults**: a control in both designs carries its value, one only in the design being left is parked against it, one only in the design being entered takes its default (FR-D19) |
| **Section on canvas** | Hover → 1px outline, name tag, ◀ ▶ design arrows, duplicate, delete, drag handle, and a "+" between sections. **The name tag holds the top-left; the Pro badge holds the top-right and the quick-action pill sits directly to its left** (R-125, Story 5.4). Click → persistent outline and sidebar. Click text inside a selection → inline editing. **Click the ground — around the page, below the last section, or below the Layers rows → deselected, editing and all** (R-123). **A click on Ghost's own words — a post's title, your site's name — shows a lock pill naming them, "Post title — set in Ghost", and nothing becomes editable** (R-122, Story 5.3). Esc deselects |
| **Inline toolbar** | Exactly four marks. **A mark a field does not permit is absent, not greyed** — a fixed button order keeps the shapes recognisable at any width (`P0 Editor Primitives - Spec.md`). **A field that permits no mark shows no toolbar at all**, and ⌘B ⌘I ⌘U ⌘K do nothing in it; a Text Field is **one line** and a Text Area takes line breaks (Story 5.3) |
| **Site-wide singleton** | Header, announcement bar and footer are one shared instance shown in every template's Layers as the Site-wide group with its template count (B7's pinned card and globe went with R-126, 2026-09-18). Cannot be duplicated. Deleting or hiding one confirms that it affects every template (FR-D5) |
| **Pro badge** | Marigold ✦ on selection only. **No upgrade sheet on click, ever** — that is the Pro Exit Sheet's job, once, at the exit |
| **Persistence indicator** | **One ICON IN A CIRCLE, never a spinner** (R-142, 2026-09-19 — B6 drew a dot and a printed label, and the owner replaced both). Five states, and the fifth is the browser with no local storage, which must never be told its work is saved on the device. Each state has its own Tabler glyph as well as its own hue, so colour is never the only signal; B6's five labels are still the only five, and they are now the `title` a hover shows and the accessible name a live region announces rather than printed words. **AT REST IT REPORTS WHAT IS OWED** (R-144): a green check when everything is on the server, a grey clock the moment there is an edit that is not — B6's four-second "Synced" flash, and the timer behind it, are gone. The expanded panel appears only on Retrying, and moves to the notification system when that is built |
| **Feedback banner** | One icon, one plain sentence. Sky informs, mint succeeds, marigold nudges without blocking, danger is serious |
| **Wizard step rail** | Numbered, and the count grows: 4 steps on an ordinary deploy, 6 on the first deploy to a site |
| **Typed confirm** | Only where the action is irreversible and account-wide — Delete Account, and project delete |

---

## State Patterns

**Every empty state is designed, not omitted.** Every surface below answers "what does this show
when it has nothing to show".

**And every control that starts work SAYS SO, from the press until the work lands** (the owner's
test of Story 3.4, 2026-09-09 — ruling **R-98**). Two halves, and a surface owes both:

- **A control in flight changes its label and stops taking the press** — "Use your brand" becomes
  "Taking your brand…" — and it is `aria-disabled` with `aria-busy`, never `disabled`, so it keeps
  focus and stays announced while it is the thing being waited on. The Kit's `Submit` carries a
  **required** `busy` label, so a control cannot ship without one.
- **A navigation's answer is the destination's own skeleton**, which is why the Loading column
  below is not decoration: a link is answered by the route it opens, so a route the user reaches
  by a soft navigation has a skeleton **in its own shape**, not a parent's. A route no soft
  navigation reaches says so and has none.

This is written here rather than as a column because it binds **every** row, including the ones
whose Loading cell is "—": a surface with nothing to shimmer still has controls that act.

| Surface | Empty | Loading | Error | Refusal |
|---|---|---|---|---|
| **Dashboard** | S3b: "Every great site starts somewhere. Yours starts with hundreds of gorgeous sections." + New project | skeleton cards | a project card carrying a Failed chip, with "See what failed →" | Free at 1 project: New Project Sheet opens on the Upgrade Sheet path (FR-B4) |
| **Editor** | a blank canvas with "+ Add section" and nothing else — the canvas is sacred, so no grid, no placeholder | skeleton section blocks | Content API unreachable → falls back to sample content **and names the cause** (FR-H4) | coarse pointer below 834px → Small Screen Notice |
| **Control Sidebar** | "Nothing selected. Click any section on the canvas — its controls appear here." | — | — | greyed control + reason |
| **Section Picker** | search with no matches: the category rail stays, the grid says what was searched for | lazy previews, skeletons | — | a design whose `bindingContext` does not match this template is **never shown** (FR-D12) |
| **Layers** | a template with no sections shows only the Site-wide group, its page count at 0 | — | — | second Post Content refused at placement, with the reason (R-37) |
| **Routes Manager** | S9d: "Your site uses Ghost's default routing. Nice and simple." | — | S9b: line-numbered YAML error, deploy blocked with the reason on the Ship button | a filename that collides, or a rename of a deployed template — refused at the naming step, with why (FR-I3) |
| **Assets** | drop zone with the accepted types | per-file progress with a real byte count | over quota → read-only, existing files stay | delete-in-use → S10c, serious |
| **Deploy History** | first deploy: "Nothing shipped yet" and the limit stated anyway | — | — | pin refusal at N−1, with the reason (F8) |
| **Notifications** | "Nothing yet. Deploy outcomes land here even if you closed the tab." | — | — | — |
| **Sites** | Sites with none: an **empty screen** in S3b's shape — a drawing, "One handshake and you're in.", "Connect your Ghost site — it takes about a minute." and a centred **Connect site** that opens the connect sheet. **Amended 2026-09-08 on the owner's test of Story 3.2 (finding 7, and Questions 5 and 6): it used to read "the connect card as the whole page".** The full-page handshake did not go — it is `/sites/connect`, where **Connect site** leads with JavaScript off. No frame draws the empty screen; it is extrapolated from S3b (R-74) | **AMENDED 2026-09-10 by the owner, and built by Story 3.7: an amber dot that PULSES and the word **Checking…**, in place of the state line's mint **Connected** — not a spinner on the badge.** The swap is a `:has()` on the ⋯ menu's own submit `aria-busy`, so it costs no client component and degrades to no motion under `prefers-reduced-motion` through `globals.css`'s existing global rule | "Reconnect needed" badge + the reason and date, both read from the open `site_health` notification row, with a **Reconnect** button beside them (`S11 Sites.dc.html:99-100`) — **built, Story 3.7** | Free at 1 site: S11c's ghost slot — **built, Story 3.5 (2026-09-09)**, the grid's next cell, its sentence `siteCapSentence('free')`'s and its pill `goProLabel()`'s |
| **Paywall Editor** | **members disabled on the site** (`members_signup_access` = none): `C3a`'s empty-state shape — what Ghost does instead, two numbered steps and a Re-check. **Not** "no paid tiers": Ghost's paywall renders on every gated post — members-only, paid or tier-gated — whether or not a paid tier exists (`content-cta.hbs` carries its own `visibility="members"` branch; VERIFY-AT-BUILD item 11), so a free newsletter gating posts to members is exactly a site this editor serves. `C3b` has said the same since 2026-09-04 — "Members are switched off … subscription access is set to Nobody" (A7 item 12) | — | — | the same shape, naming the setting |
| **Suggestions** | S13c | — | — | — |
| **Main feed** | the designated feed design's **own declared empty state** — never back-filled (ruling R-36) | — | — | — |
| **Secondary `{{#get}}` feed** | **renders nothing at all**, heading and container together | — | — | — |
| **A section whose items the user typed** | **renders nothing at zero** — an editor who has typed no steps is mid-build, not looking at an error (ruling R-41) | — | — | — |

**Partial and degraded states, which are first-class here rather than errors:**

| State | Surface | Treatment |
|---|---|---|
| **In flight** | **every surface with a control** | The control says what it is doing and refuses the second press — the label swaps, `aria-disabled` + `aria-busy`, never `disabled`; a navigation is answered by the destination's own skeleton instead. R-98, above. With scripts off there is no busy state and none is owed: the click is a document navigation and the browser reports it |
| **Partially credentialed** | Manage Keys, Deploy Wizard | Three credentials, each **present or absent with what it enables**. Never an error badge (FR-C1, FR-C8) |
| **Preview-only** | Preview-Only Notice, Preview-Only Destination, Sites | Sky, not danger. Probed, never asked. Clears automatically |
| **Uploaded, not activated** | Partial Success | A **partial success**, recorded as one. Re-activate is one click. Sends no failure email |
| **Read-only project** (over limit) | Editor | Canvas legible, sidebar dimmed, nothing responds. **Export still works** (FR-J12) |
| **Read-only session** (someone else holds the lock) | Editor | Same treatment, different banner: "Rosa is editing this site — you are reading along", + Request editing |
| **No local storage** | Persistence Indicator | Falls back to per-change cloud sync **and says so in the indicator** — never a false "Saved on this device" (the label; FR-D10's "Saved locally" is the state name — Appendix H) |
| **Offline** | Persistence Indicator | "Retrying · 12s", counting down. Expanded: "Your work is safe on this device." + Retry now |
| **`pro_past_due`** | Grace Banner | Every Pro capability is kept for 7 days. Not a plan, and never shown as one |

---

## Interaction Primitives

**Direct manipulation first, keyboard second, sidebar third** — and every action has at least two of
the three. The shortcuts are FR-D11's, and they are the complete set:

| Key | Action |
|---|---|
| `⌘K` | insert section (Section Picker) |
| `[` `]` | previous / next design |
| `⌘D` | duplicate · `Del` delete |
| `⌘Z` / `⇧⌘Z` | undo / redo — 100 **edits**, not ops |
| `⌘S` | save now |
| `1` `2` `3` | device preview |
| `L` | Layers · `.` dark toggle · `Esc` deselect |
| `P` | Preview Mode · `⇧R` Site Remix · `⌘⏎` Ship it |
| `?` | the shortcuts card — **the one key added to FR-D11's list, R-147** (owner, 2026-09-19, Story 5.9's Q3). `S3 Dashboard.dc.html:362` draws it on the account menu's **Keyboard shortcuts** row, and the editor draws no account menu, so inside the editor it is the card's only door. A single-character shortcut, carrying the identical focus condition below |

**States added after the shortcut map carry no shortcut, deliberately** (FR-D11): the paginated
preview, the preview subject, and the member-state nudge are all reached by clicking.

**When each binding is BUILT is not this table's question, and the two halves answer differently —
R-141 (owner, 2026-09-19, Story 5.8's Q2).** A **⌘-modified** binding may land with the control it
drives: Story 5.8 builds `⌘Z`, `⇧⌘Z` and `⌘S` beside S4a's undo arrows, because neither can collide
with typing on the canvas. A **single-key** binding may not, because it is live only while the shell
holds focus and never inside a text field or a `contenteditable` (UX-DR11, WCAG 2.1.4) — a condition
the keyboard journey verifies as one walk and cannot verify one key at a time. So `[` `]`, `1` `2` `3`,
`L`, `.`, `P`, `⇧R` and `Esc` all stay Story 5.9's.

**And a binding whose ACTION does not exist yet cannot land at all — R-145 (owner, 2026-09-19, Story
5.9's Q1), which is R-118 applied to a key for the first time.** A key with nothing to press is
**absent**: not bound, not listed in the `?` card, never greyed and never captioned (UX-DR3). Story
5.9 builds `L`, `.`, `1` `2` `3`, `Esc`, `⌘D`, `Del` and `?`, and finds `⌘Z`, `⇧⌘Z` and `⌘S` already
passing; **`⌘K` lands with the Section Picker (5.10), `[` `]` with the design ring (5.11), `⇧R` with
Site Remix (5.12), `P` with Preview Mode (5.15) and `⌘⏎` with the deploy wizard (7.18)** — each tested
by the story that lands it, and the map complete when 7.18 ships. The map is **one table** naming all
of them with the story that lands each, and both the handler and the card's rows are derived from it,
so a key can never be advertised without being bound or bound without being listed.

**That rule governs new *global* bindings, and nothing else.** Standard within-component keyboard
behaviour — arrows through a list, `Enter` to select, `⌥`-arrow to move a row, `⌥F10` into a
toolbar — is not a shortcut in FR-D11's sense and is **required** by NFR-5's keyboard-completeness
clause. The full set is in § Accessibility Floor, which is where it is verified.

**Every single-character shortcut above is live only while the editor shell holds focus**, and never
while a text field or a `contenteditable` has it — WCAG 2.1.4. `⌘`-modified shortcuts are
unaffected.

**Undo is the journal tail** (AD-15, `addendum.md` §AD1), which is why it survives a reload. **One
gesture is one edit** — a Variant Shuffle rewrites every prop of a section and is *one* undo step,
one edit. **No operation count is ever surfaced anywhere in the product** (AD-16).

**Nothing blocks on a save.** Every change writes locally and asynchronously; cloud sync runs every
three minutes, on tab close, on lock release, and before any deploy or export (FR-D10).

**Behaviours are off while editing** (FR-D20). Layout-affecting CSS — sticky, hover, transitions —
is always live because it changes what the design *is*. JavaScript behaviour is suppressed, and its
section renders in its resting state, with a **PAUSED chip on the behaviour itself** rather than in
a status bar (B3a). Preview Mode runs everything and hides all chrome.

---

## Accessibility Floor

Behavioural. Visual contrast is `DESIGN.md`'s.

**The standard is NFR-5**: tool **axe-core**, ruleset **WCAG 2.1 AA**, threshold **zero
violations** — pass/fail, no score. Scope includes **the Inflozo app itself**, not only the designs
it ships.

### The focus model across the canvas boundary — §7.3's deliverable

**PRD §7.3 assigns this to the UX pass by name**, in three parts, and this is where they are
discharged. Inline editing happens inside the iframe, in that document's own `contenteditable`; the
sidebar and the mark toolbar live outside it. One edit gesture crosses the boundary, and two
documents each hold their own focus and selection.

**(1) The canvas is reachable and escapable by keyboard.**

- **Reachable:** the canvas is one stop in the editor's tab order, between the Layers panel and the
  Controls sidebar. Tabbing into it moves focus to the canvas container, not into the rendered site.
- **Skippable, which is what makes it usable:** the canvas renders the *user's own site*, so tabbing
  through it means tabbing through every link and control that site emits — a 12-section homepage is
  dozens of stops before the sidebar. **The first focusable element in the editor shell is a skip
  link — "Skip the canvas"** — and the canvas container itself offers the same on focus.
  *(Drawn: `D8 Editor Below 1440.dc.html` D8c — not rendered at rest, visible on the first Tab, in the corrected focus ring.)*
- **Escapable, by one key with a defined ladder rather than a second key to learn.** `Esc` steps
  outward, one level per press, and announces where it landed: *inside inline editing* → leaves text
  editing, the section stays selected · *section selected* → deselects, focus rests on the canvas
  container · *canvas container* → focus leaves the canvas for the editor chrome. From anywhere,
  holding `Esc` is never required and focus is never trapped.

**(2) Selection survives the chrome taking focus.** Moving focus to the Controls sidebar, the
Layers panel or the top bar **does not clear the canvas selection** — the persistent outline stays,
and the sidebar keeps showing that section's controls. This is what makes the sidebar the "second
way to do everything" (FR-D1) rather than a way that only works with a mouse. A selection is cleared
by `Esc`, by selecting something else, by deleting it, **or by a press on nothing, which is
three places: the canvas ground below the last section, the editor's own ground around the page card,
and the empty space below the Layers rows** (R-123 and its amendment, the owner's rulings of
2026-09-18, reversing Story 5.2's "the selection stays"). That press is the whole `Esc` ladder in
one: any inline editing ends and the section is let go together. Everything else is chrome and keeps
the selection — the Controls sidebar, the top bar, the mark toolbar, the Layers header and a Layers
row — which is what (2) above is for. **The top bar is deliberately not a ground:** its empty space is
a sliver that shrinks with every control still to land in it, and a miss while reaching for one would
cost the selection mid-edit.

**(3) The mark toolbar is operable without destroying the selection it acts on.**

- With a text selection live inside the canvas, **`⌥F10` moves focus into the Inline Toolbar** — the
  ARIA Authoring Practices convention for reaching a toolbar, and it collides with nothing in
  FR-D11's map. The toolbar is a roving-tabindex group: ← and → move between marks, `Enter` or
  `Space` applies one.
- **The selection is held, not re-derived.** Focus leaving the `contenteditable` must not collapse
  it: the range is captured when the toolbar is raised and re-applied when a mark fires.
- **`Esc` dismisses the toolbar and restores that exact selection**, caret and all, so a keyboard
  user is returned to where they were rather than to the top of the field.

### Keyboard completeness — and the distinction that makes it buildable

NFR-5 requires the app to be keyboard-complete "including reorder". **FR-D11's map is the set of
*global* shortcuts, not the set of every key the app answers to.** Standard within-component
keyboard behaviour is not a shortcut and is not governed by FR-D11's "states added later carry no
shortcut" rule — that rule is about *new global bindings*. So:

| Where | Keys |
|---|---|
| **Layers**, and any reorderable list | ↑ ↓ move focus between rows · **`⌥↑` / `⌥↓` move the section itself**, with the canvas following and the move announced · `Enter` selects · `Space` toggles visibility (the eye left the row for the `⋯` menu, R-126, and the key stayed). B7 draws three row states; the fourth, keyboard focus, is D8e — the ring over whichever state the row is in, with the keys captioned |
| **Item list** (P0-3) | the same pattern — the Add, Remove and drag affordances each have a focusable control, and drag has the `⌥`-arrow equivalent |
| **Section Picker** | ↑ ↓ ← → across the grid, `Enter` places, `Esc` closes and returns focus to the invoking position |
| **Design picker** | ← → across the thumbnail strip, mirroring `[` and `]` |
| **Assets** | the drop zone is **also a file input**, with a visible "Choose files" button — a drag-and-drop-only upload has no keyboard path — D8d draws the button, and S10b's size line now reads "up to 10 MB each" |
| **Every menu, popover and sheet** | focus moves in on open, is trapped while open, and returns to the invoking control on close |

**A drag that has no keyboard equivalent is a defect**, and every drag surface in this document has
one above.

### Single-character shortcuts — WCAG 2.1.4, and it is a Level A rule inside the AA threshold

`L`, `P`, `.`, `[`, `]`, `1`, `2` and `3` are unmodified letter, punctuation and number keys.
**2.1.4 Character Key Shortcuts** requires one of: turn off, remap, or active-on-focus. This product
takes the third: **every single-character shortcut is live only while the editor shell holds focus,
and never while a text field or a `contenteditable` has it.** Without that rule, a speech-input user
saying a word near the canvas fires Preview Mode or a Site Remix. `⌘`-modified shortcuts are
unaffected. **axe-core does not detect this**, which is exactly why it is stated here.

### What is announced, and how

**Colour classifies; it never carries the only signal, and neither does shape.** Every state in this
document has a text equivalent — the Pro badge carries the word **Pro** beside its ✦; the
auto-generated, has-feature-image and dark-override marks each carry their words (D5b writes
"Auto-generated" beside the hollow dot, D5e writes "has image" beside the marker, and D6a captions the
moon badge "Dark override").

**THE PERSISTENCE INDICATOR USED TO BE THIS RULE'S OWN EXAMPLE, and R-142 changed how it keeps it
rather than whether.** It read "four *labels* and one dot, not four dots". It is now one dot — a
circle — and no printed label at all, and it satisfies the rule more strongly than it did: each state
carries its own GLYPH as well as its own hue, so colour and shape are redundant with each other, and
the word survives as the `title` a hover shows and the name a polite live region announces. The
measurements are why the change was taken rather than resisted: B6's four dots come in at 1.62:1,
2.86:1, 2.75:1 and 4.85:1 against the bar's paper — three below the 3:1 a meaningful graphic owes —
and coral *"Syncing"* against mint *"Synced"* is **1.04:1**, one appearance for the two states that
separate "still sending" from "safe on the server". A label is one way to keep this rule. A glyph is
another, and here it is the better one. **A text equivalent is still required of every state; being
ALWAYS VISIBLE is not.**

| Region | Politeness | What it announces |
|---|---|---|
| **Canvas status** | polite | The change the canvas just made and the user cannot see happen: the design and its position after `[` / `]` or a Shuffle — *"Design 8 of 18 — Image Backdrop"* — the Style Pack after a switch, and the section count after a Site Remix |
| **Persistence indicator** | polite | Saved on this device · Syncing · Synced · Retrying, and the fallback state |
| **Deploy progress** | polite | Each stage as it starts, and the outcome |
| **Backup Gate** | polite | That the master confirm has become available once the last row is ticked — a button silently turning on is invisible without it |
| **Edit-lock request (B5b)** | **assertive** | A request has arrived and is waiting on this person |
| **Takeover notice (B5c and the revived holder)** | **assertive** | Work that is already gone |

### Time limits

**One timed interaction exists: the edit-lock nudge** (F2). It is a **no-response** timer, not a
decision timer, and the distinction is what keeps it compliant: **it stops the moment the holder
interacts with the popover at all — including focusing it** — and only runs out when nobody is
there. A holder who is present is never hurried, and B5b is announced assertively so a screen-reader
user learns about it while the timer is still running. The magic-link resend countdown (S1b) blocks
nothing: the link itself is valid for 15 minutes and "Use a different email" is always available.

### Destructive confirms

**A confirm whose primary action is irreversible opens with focus on the cancelling action** — drawn as the rule on D8f ("Take over from Rosa?", focus on Wait) and applied on D8g. Stated
as a rule rather than a list, because the list would go stale — it already covers Take over anyway,
Delete account, Roll back, project delete, delete-in-use assets and "Overwrite and ship anyway", and
it covers whatever is added next.

### Reduced motion

Honoured throughout, including the one confetti moment, the 300ms pack crossfade, the 180ms design
slide-fade and the drag tilt. Under `prefers-reduced-motion` each becomes an instant state change,
never a removed affordance.

### What verifies each of these — because axe-core cannot see most of it

Answering the obvious objection rather than leaving it: **of everything above, axe-core reliably
detects one thing** — that a greyed control's reason is real text in the reading order rather than a
`title`. The rest needs a named verifier, and NFR-5's own scope sentence ("the Inflozo app itself")
had none, because the scan runs on NFR-6(a)'s render matrix and that matrix is *section designs*.

| Floor item | Verified by |
|---|---|
| Reason text on a greyed control · accessible names · roles · labels | **axe-core**, run over the app surfaces |
| Cross-boundary focus order, the `Esc` ladder, the skip link, selection survival, `⌥F10` | **NFR-6(d) E2E**, as a scripted keyboard-only pass — no mouse events |
| Keyboard reorder in Layers and in item lists | NFR-6(d) E2E |
| Single-key shortcuts inert inside a text field | NFR-6(d) E2E |
| Live-region announcements | a manual screen-reader pass per surface, once per release |
| Reduced motion | NFR-6(a), with the query forced |
| 200% browser zoom | NFR-6(a), as a viewport case |

> **Closed 2026-09-03 (F-097).** NFR-6(d)'s E2E list originally named no accessibility journey — auth,
> connect, build, shuffle, dark authoring, deploy, rollback, billing and quotas, all mouse-driven — so
> four rows above depended on a pass that did not exist. **NFR-6(d) now carries one keyboard-only
> journey** — sign in, connect, place a section, cycle the ring with `]` and `[`, deploy — run with no
> pointer events, and it is the verifier those four rows name.

> **And since R-146 (owner, 2026-09-19, Story 5.9's Q2) those four rows are checked twice.** The
> editor's half of that journey runs **on every commit**, inside `pnpm check` and so inside the CI job
> `deploy` needs (R-116) — over a **harness mount**: a page that answers "not found" unless
> `INFLOZO_HARNESS=1`, rendering the real editor with the pilot fixture as its props, so a browser can
> open it with no database. The deployed run is unchanged and still the authority: a harness proves the
> wiring and never the stack (R-82), and the same walk runs on `app.inflozo.com` at every story's
> Review. It closes **DW-167**, whose "a DOM is a dependency (Ask First)" had deferred it four times —
> the dependency arrived on its own with Story 4.11's render matrix.

### Where the floor stops, and why it is a scope statement rather than an exemption

The scan does not walk inside `{{content}}` (ruling R-6): Ghost emits its own markup in a post body,
and a scan that walked into it would report violations on a customer's content that no theme can
fix.

**A user's own Style Pack edit can still break contrast**: FR-E3's colour picker runs a live contrast
check and **warns before the edit lands, never blocks** — responsibility transfers to the user at
that point, and the warning is what makes the transfer fair.

**The app needs JavaScript, and the forms are the part that does not** (the owner's ruling at Story
3.9's Question 5, option 1, 2026-09-11; DW-89). Measured on the deployed site with a real session and
scripts off: the connect wizard renders **all three key fields and its submit**, and posts — every
control in this app is a plain `<form action={…}>`, which is why. But a route whose page streams stays
on its skeleton for ever, because Next swaps the fallback for the real content with an inline script:
`/` and `/account` read "Loading…" and never change. That is **a scope statement and not a defect to
fix** — the alternative is every screen waiting for all its data before showing anything, which costs
every customer's first paint to serve a mode almost nobody uses, and R-98's per-route skeleton is the
thing being traded away. **So: no surface promises to work without JavaScript, and the forms' promise
is kept because it is already true and is proved on every run** (`run-verify-ghost-admin.py`'s
`js-off` and `keys-js-off`). A passing `js-off` step is evidence about the FORMS, never about the app.

## Responsive & Platform

Three widths for Inflozo's own surfaces: **1440 · 834 · 390**, per `DESIGN.md` § Layout & Spacing.

**The app floor is 834px, on a coarse pointer** (ruling R-76; its width amended from 1024 to 834 by R-87, owner,
2026-09-04, because A8 drew the editor on a tablet at 834 with touch — D8a). At 834 and above the editor's
four-part shape holds and the Layers panel collapses first. On a touch device below it, **Small Screen Notice**.

> **The floor is a device test, not a width test — and that distinction is load-bearing.** A 1440px
> display at 200% browser zoom presents roughly a 720px CSS viewport. Keying the notice on CSS width
> alone would throw a low-vision user out of the editor for zooming, which is a straight **WCAG 1.4.4
> Resize Text (AA)** failure and the opposite of what R-76 was for — the owner ruled about *phones*.
> So **Small Screen Notice fires on a coarse pointer at a small viewport**, and **the editor stays
> usable at 200% browser zoom on a desktop-class device**, reflowing rather than redirecting: the
> Layers panel collapses to an icon rail, the Controls sidebar becomes an overlay panel, the canvas
> keeps its own scroll. `DESIGN.md`'s `app-floor` token is that device threshold, not a zoom
> threshold.
>
> **Both are drawn** — `D8 Editor Below 1440.dc.html` D8a (834, touch: the Layers icon rail, the
> Controls sidebar as an overlay with a scrim, every target at least 44px, one overflow menu) and
> D8b (720, captioned "a 1440 display at 200% browser zoom", fine pointer, hover live), and
> `D4 Dashboard Sheets and Blocks.dc.html` D4f draws the notice at 390 with the coarse-pointer
> condition in its caption. Until 2026-09-04 the editor existed at 1440 and nowhere else and this
> paragraph was a specification with no frame behind it; prompt A8 is what drew it.

**The canvas is a viewport, not a column** (FR-D8, AD-21, B11a/b). Device preview resizes it in
**both** axes to a real device size — 390 × 844 for mobile, not a 390-wide column of infinite
height — so a sticky header sticks and a full-screen hero fills. **There is no user zoom** (FR-D14,
AD-21): the only scale is fit-to-screen, stated in a mono chip alongside the true size — "viewport
390 × 844 · shown at 55%".

> **All three devices are real viewports, Desktop included** — **1440 × 900** · **834 × 1112** ·
> **390 × 844**, fitted by `min(1, stageW/deviceW, stageH/deviceH)` and never magnified. Tablet's
> height is the export's own (D8a, and the table at the head of this section); Desktop's is
> **R-137** (owner, 2026-09-19, Story 5.7's Q1), which settles a contradiction between two approved
> frames: S4a`:63` draws the resting page card filling the height, B11a`:740` draws the same canvas
> as a fixed 1440 × 900 with its chip, and the chip was deliberately kept through the A7 correction
> pass. **B11a governs the card's geometry** — device-sized, centred in the ground, a radius on all
> four corners — **and S4a governs everything else about it**: the ground, the ink, the shadow and
> the 6px radius. The cost is a third less page in view while editing at 1440; what it buys is that
> `100vh` and the fold are honest on desktop too, and that `prd.md:66`'s carve-out means what it
> should — 900 is a nominal desktop viewport, never this visitor's window.

> **Two different things are called zoom and they must not be confused.** FR-D14's "no zoom" is
> **canvas scale** — how large the previewed site is drawn inside the editor, which is automatic and
> has no user control. **Browser zoom** is the reader's own accessibility setting and Inflozo neither
> owns it nor may defeat it (WCAG 1.4.4). The editor holds at 200% browser zoom; the canvas still
> offers no zoom control of its own. Nothing above reintroduces the control B11 drew and R-74's
> re-specification removed.

> **B11's Zoom control is re-specified.** The frame draws a user-driven "Fit / 55%" picker. FR-D14
> says no zoom in v1 and AD-21 says the only scale is fit-to-screen, never user-driven. **Keep the
> chip, remove the control**: the chip reports the true size and the automatic scale, and the
> device segmented control is the only thing the user operates.

**Touch.** The tablet range is touch-first: 44px minimum targets, hover affordances that also appear
on tap-and-hold, and no interaction that requires a hover state to be discoverable.

---

## What the export already draws — and where it draws the wrong thing

`reconcile-designs.md` §37.7 (2026-08-27) is this pass's work list. Every item was re-verified
against the export **as it stands today**, because four re-exports have landed since §37.7 was
written and two of them touched the S, M and B screens.

**Re-verified again on 2026-09-04**, against the export the Appendix A prompts produced: every row
below now says what the export draws today, with what it drew before in one clause. The string
evidence, frame by frame, is `reconcile-designs-decisions.md` §A15.

### Reported as having no frame — verified one by one

| §37.7 item | Verdict today |
|---|---|
| **Paywall editor** (FR-H6) | **DRAWN — §37.7 was wrong.** `C Post Body.dc.html` **C3a** is the paywall canvas at 1440, with its six controls, its "how readers reach it" explainer, three of the twelve designs, and an empty state whose condition is **members switched off** — C3b was corrected on 2026-09-04 (A7 item 12; until then it said "no paid tiers", which § State Patterns had already refused). Its entry point is drawn twice more ("Open paywall editor →" on C1a, "Open Paywall →" on C2a) and it sits in a drawn left-nav group, **Template surfaces** |
| Backup gate consent checklist | **drawn** — `D1 First-Deploy Gates.dc.html` D1d, D1d′ and D1e, with the `ghost backup` shortcut, the seven rows and the disabled master confirm (was not drawn until the D canvases landed on 2026-09-04) |
| Drift report (FR-J16) | **drawn** — `D3 The Drift Report.dc.html` D3a drift found, D3b could not verify, D3c no drift (was not drawn until 2026-09-04) |
| Credit toggle (FR-J15) | **drawn** — `D6 Theme Settings Completed.dc.html` D6a (Pro, a working toggle) and D6b (Free, greyed with "Credits stay on with the Free plan."); until 2026-09-04 the only "credit" in the app frames was S14's per-card image-credit control |
| Page-2 preview (FR-D21) | **drawn** — `D5 Canvas Markers and Template Switcher.dc.html` D5d (was not drawn until 2026-09-04) |
| Auto-generated marker (FR-D6) | **drawn** — D5a, the sentence in the top bar and at the head of Layers (was not drawn until 2026-09-04). **Built at the head of Layers only: R-130 (owner, 2026-09-18) removed the top-bar chip**, and gave D5b's undrawn third row state — never auto-generated, not yet designed — Tabler's `circle-off` beside the word "Empty" |
| Membership / Private canvases (FR-D6) | **drawn** — D5b's switcher carries **Membership** as a group of three (Signup · Signin · Member home) and a conditional **Private** ("appears only once a Private Site Gate section has been designed · otherwise the row is absent, not greyed"); until 2026-09-04 S4a had one "Members" entry and no Private |
| Project mode + "Clear dark overrides" (FR-D7) | **drawn** — D6a's "This project · Light only / Light + Dark" and "Clear dark overrides · 3 sections carry a dark override", the badge named "Dark override" — printed beside it on D6a's own project-level row, and on a CONTROL row its accessible name and hover title alone (R-136, owner 2026-09-19); until 2026-09-04 the only dark row was S4a's visitor `mode-toggle`, a different setting |
| New project sheet (FR-B2) | **drawn** — `D4 Dashboard Sheets and Blocks.dc.html` D4a, four doors, and D4b at the Free cap; until 2026-09-04 S3 had the button and nothing behind it |
| Downgrade / over-limit sheet (FR-L3) | **drawn** — D4c itemised, D4d "Which project stays editable?", D4e the read-only project (was not drawn until 2026-09-04) |
| First-deploy name confirm (FR-J10) | **drawn** — D1a's "Theme to be created · inflozo-orbit-weekly" with its permanence line (was not drawn until 2026-09-04) |
| Partial-success state (FR-J8) | **drawn** — `D2 Deploy History Completed.dc.html` D2e in the wizard, D2d as the history row, and D2f the deploy-only ending beside it; until 2026-09-04 S8a drew "Deploy only" and S8d′ an *upload* failure, and neither was upload-succeeded-activation-failed |
| Empty-custom-template warning (FR-I1) | **drawn** — D5f, "Remove the last section from Membership?" (was not drawn until 2026-09-04) |
| Preview subject (FR-D22) | **drawn** — D5e, B9's pill opened on source, then subject, the style-guide article first; until 2026-09-04 B9's menu existed with no picker for *which* post |
| Main-feed marker and reassign (FR-H2) | **drawn** — D5c, the MAIN FEED chip on canvas and in Layers, the greyed Count with its reason, "Make this the main feed" on the other feed (was not drawn until 2026-09-04) |
| **Staff Access Token step and its decline path** (FR-C1 — J1's core) | **drawn** — D1b the offer, D1c the decline acknowledged once; until 2026-09-04 there were zero occurrences of "Staff Access Token" anywhere in the export |
| History pinning | **drawn** — D2a (Pro, two of ten pinned), D2b the refusal with its reason, D2c Free; until 2026-09-04 the only "pinned" in the export was B7's Layers group |

**On 2026-09-03 one was found already drawn and two partially drawn; on 2026-09-04 the Appendix A export drew the rest.** Every row above now points at a frame.

### Drawn, but on the wrong mechanism — semantics re-specified, visual treatment kept

Each of these keeps its frame's components, layout, colour and density. Only what it *does* changes. **The rows marked → A7** went to the Claude Design prompt that brings the frames themselves back into line — A7's numbered items are the list and the count — and **A7 ran on 2026-09-04**: each such row now says what the frame draws today, with the string evidence in `reconcile-designs-decisions.md` §A15. The rows that were never in A7 are corrected here and in step 5b's prototype, and the frames catch up whenever a library pass next touches them — prompt **A9**'s second half is that pass, and it runs (§A15, decision 1, ruled R-86 on 2026-09-04). The hold-out of §A12 decision 6 (owner, 2026-09-03 — "until A7 runs") has therefore run its course for the Pro Exit Sheet, the Starter Chooser and S4d, whose frames now carry the PRD's copy; **B22 was held out entirely but was never in A7**, so it is A9's, and so is the S9 YAML pane, which this table had assigned to A7 without A7 carrying it.

| Frame | What it draws | What it must do |
|---|---|---|
| **B19** Template Binding Checklist *(corrected 2026-09-04, A7 item 1)* | now `custom-membership.hbs` "shown as Membership", a three-row checklist (Membership · Signin · Member home) the user ticks, "We can't see whether you did this", and the facsimile showing Ghost's Template dropdown; until 2026-09-04: `page-membership.hbs`, "set the page's URL slug to `membership`", a **MATCHED** badge | FR-I1 forbids `page-{slug}.hbs` — it detaches on retitle and outranks the user's own choice. The file is **`custom-membership.hbs`**; the user picks it from Ghost's page-editor **Template** dropdown. **One row per emitted template**, each naming the filename *and* the dropdown label Ghost derives from it, with a **done-state the user marks themselves**. The MATCHED badge goes: Inflozo cannot see a page's chosen template, and **the flow says so** — "we can't see whether you did this". Keep the right-hand Ghost facsimile panel; it is what makes this work |
| **B12** Snapshot Gate *(corrected 2026-09-04, A7 item 2)* | now "we only do it the first time you upload to a site", "Kept outside your version limit.", and a failure that names the Staff Access Token, the 403 and "there's no permission to switch on"; until 2026-09-04: fired "on every deploy", "snapshots count towards your history", failure blamed integration-key permission | FR-J13: **first upload to a site only**, and the snapshot is **exempt** from history pruning. The 403 is **structural** for every Custom Integration token on every Ghost — there is no permission to fix. The degraded path is the designed one: no snapshot was captured, **Ghost keeps the previous theme under Settings → Design**, and here is how to reactivate it there — true of the **first** upload only: later Inflozo versions replace each other under FR-J10's frozen name and survive only in Deploy History (F-074, VERIFY-AT-BUILD item 61) |
| **S8c** Deploy Progress *(corrected 2026-09-04, A7 item 13)* | now Cancel greyed (`aria-disabled`) with its reason, "Once it starts, it finishes"; until 2026-09-04 a live **Cancel** beside "Uploading to Ghost · 1.1 of 2.4 MB" | FR-J8: **Cancel exists during Compiling and Checking only; once Uploading starts the deploy runs to completion** (idempotent; rollback covers regret), and AD-19 holds the site lock for exactly that span. The card, its progress bar and its stage rows stay; the Cancel goes, or is greyed with its reason in R-33's pattern. The compile and gscan the card does not show happened at Pre-flight, on the same job row (AD-20) |
| **B16** Routes Fallback Card *(corrected 2026-09-04, A7 item 3)* | now "Uploading a routing file needs a Staff Access Token from the site Owner or an Administrator, and this project doesn't have one", step 2 "In Ghost, find the routes upload for your version · Show me where ↗", "Add the token instead"; until 2026-09-04: "your integration key is missing the settings permission … Fix the key", with a hard-coded Settings → Labs path | FR-I4: automated upload uses the **Staff Access Token**. Integration keys never carry `setting: edit`; there is nothing to fix. The card fires when the token is **absent, revoked, or from a role below Administrator** (F-063). The Ghost menu path is **not hard-coded** — Ghost 6 has no Settings → Labs (`MEASUREMENTS.md` §33); describe what the customer is looking for and link to Ghost's own help for their version |
| **B13** Pro Exit Sheet *(corrected 2026-09-04, A7 item 4)* | now Swap · Remove it on every row, a "Chosen, not placed" row type with "Revert to the free one", and no pairing note; until 2026-09-04 two remedies — swap for a named Free design, or Go Pro | FR-L3: **four**. **Upgrade · swap to a Free design via Shuffle · remove it · revert to the Free design of that treatment.** "Remove it" is not decorative — some binding contexts have no Free design to swap to. The fourth covers the 22 non-placeable Pro treatments, which are *selected* not placed, and each reverts on its own surface. **Swap is via Shuffle — any Free design in the ring**, not an authored pairing table, so the "someone has to author a fallback per design" data dependency the frame notes does not exist |
| **B22** Redesign Proposals *(corrected 2026-09-04, A9 item 9)* | now three whole-site proposals — "STARTER LETTERPRESS · PACK WARM PRESS" and two more — each with one sentence from the user's data ("You have 4,100 members and no signup above the fold"), "Use this", "Start from my site as-is", and no tag-template card; until the A9 export four per-section swaps argued from the user's data | *Ruling R-78.* FR-C7: **2–3 whole-site starter × Style Pack combinations** on the user's real content, which must **differ in layout structure**. Keep the frame's card, its NOW / PROPOSED pairing and above all its **argued-from-your-own-data sentence** — one per combination instead of one per section. Re-runnable later from New Project Sheet. Also: "no tag template, so Ghost falls back to a bare list" is false on Inflozo — `tag.hbs` always compiles from the Synthesis Defaults |
| **B11** Device Preview *(corrected 2026-09-04, A7 item 6)* | now "There is one control here: device" and the chip "VIEWPORT 390 × 844 · SHOWN AT 55%"; until 2026-09-04 a user "Fit / 55%" zoom control. **B11a also carries the chip "VIEWPORT 1440 × 900 · SHOWN AT 46%", which contradicts S4a`:63`'s resting card filling the height — R-137 (owner, 2026-09-19) rules for B11a on the card's GEOMETRY and for S4a on everything else about it** **And the chip's own place is R-138's (owner, 2026-09-19), not B11a's drawn 9px/12px: measured on the deployed editor, a height-bound card rose under a chip pinned to the stage's corner — Tablet by 5px, folded Desktop to within 4px — so the chip sits at 4px/4px and the ground's top padding is 32px rather than S4a`:62`'s 24px. The invariant is that the chip never overlaps the page card on any device; the two offsets are how it is delivered. R-139 (owner, 2026-09-19) gives the ground the same 32px at the BOTTOM, so a height-bound card never stands on the window's edge.** | FR-D14: **no zoom in v1**; AD-21: fit-to-screen only, never user-driven. Keep the mono chip that states true size and scale; delete the control |
| **B24** Grace Banner *(corrected 2026-09-04, A7 item 5)* | now "After that you go back to Free. Your live sites are never touched — what's shipped stays shipped."; until 2026-09-04 "after that, Pro designs stop rendering and your sites fall back to their Free replacements" | FR-L3: **existing deployed themes are never touched.** Grace expiry moves the account to Free and blocks the **exits** — deploy, export, code surfaces — until the user resolves what is over. M5's own FAQ already says the right thing ("your deployed theme stays live") and B24 contradicted it |
| **S9** Routes Manager *(corrected 2026-09-04, A9 item 8)* | now the YAML opens with the index collection — `/: permalink: /{slug}/ template: index` — ahead of /articles/, /tutorials/ and /notes/, no custom route for `/` or `/subscribe/`, S9c "Posts per page is your theme setting — 12 right now", and the published-date condition offers "in the last 30 days" first; until the A9 export routes `/subscribe/ : members-signup` and `/ : home` | FR-I1/I5: a membership page emits **no route** — it is `custom-{name}.hbs`, bound from Ghost's page editor. And `home.hbs` resolves for the root by itself **only while the root is still a collection**: a `routes:` entry for `/` removes the index collection, so `/page/2/` breaks — and so does a routes.yaml with no `collections: /:` at all. Both rows go, and **Inflozo always emits the index collection first** — `/: {permalink: /{slug}/, template: index}` — ahead of any custom collection, because a post belongs to the first collection whose filter it matches ("Posts can only ever be in one collection", docs.ghost.org/themes/routing) and the drawn `/articles/ filter: type:post` would otherwise capture every post and leave the home feed empty (F-070; the YAML pane was assigned to **A7**, which never carried it — the first 2026-09-04 export still drew `/ : home` and `/subscribe/ : members-signup`, and A9 item 8 corrected it the same day; not executed — a routes.yaml round-trip on T3 is under the reset protocol). Also S9c's "posts per page follows the home feed's Count control" → **Theme Settings' `posts_per_page`**, which a collection's own `limit:` may override for that route (FR-Q1, FR-I2 — `limit` is in Ghost's code and not in its routing docs: 6.x `route-settings-parser.js:59,151` `limit: LimitField`, 5.x `CollectionRouter.js:39`; VERIFY-AT-BUILD item 60); and S9c's absolute-only published date offers FR-I2's **relative** form first (`now-30d`) |
| **B17** Theme Settings *(completed by D6, 2026-09-04)* | `D6 Theme Settings Completed.dc.html` D6a–D6c now draw all of the right-hand column — `posts_per_page` first, the logo padlocked, "This project · Light only / Light + Dark", Credits, "3 OF 17", the builder's group, condition, text-prop confirm and key-freeze notice; B17 itself is unchanged (no `posts_per_page`; a Logo **Replace** control; "Dark mode: follows the reader's system setting"; 3 of 20) and stays as the shape D6 inherited | `posts_per_page` is FR-Q1's **first** field and belongs here — and **every surface that mentions posts per page links here, never into Ghost Admin**, because Ghost Admin has no such setting (ruling R-10 #13). The logo is Ghost's and is **read, never written** (AD-10's P8 allowlist) — show it, link out, no Replace. The dark row is **FR-D7's project mode**: Light only / Light + Dark. The meter is **3 of 17**: three of Ghost's twenty slots are the dark built-ins on every project (FR-Q2). The builder also needs the Ghost Admin **group**, a **visibility condition**, FR-Q3's text-prop confirm, the post-deploy key-immutability notice and the pack-switch warning for a promoted accent |
| **B18** Translations *(corrected 2026-09-04, A9 item 14)* | now dotted keys — `member.signup_cta`, `post.read_more`, `post.reading_time`, `archive.empty_heading` — and a refused row, "Braces would break every page of your site"; until the A9 export flat keys — `subscribe`, `read_more`, `min_read` | FR-Q6: keys are **dotted `namespace.name`** — `member.signup_cta`, `post.reading_time`, `archive.empty_heading`. Add FR-Q8's brace-refusal error state (a malformed interpolation token is a whole-site 500). The RTL acknowledgement is right, and FR-Q6 additionally requires it **repeated as a pre-deploy warning** on Pre-flight Check |
| **S4d** Member State Preview *(corrected 2026-09-04, A7 item 18)* | now "Logged out user · Free member · Paid member", "2 not viewed" beside the toggle and "Gated content — shown with sample text" on the gated body; until 2026-09-04 tier-level previews — Orbit Supporter $5, Patron $12, Founding $120 | FR-D16: **three states** — Anonymous / Free member / Paid member. `comped` previews as Paid, differing in billing rather than access. **B9 already says "only" and agrees with the PRD**; S4d is the outlier and moves. Add the two things neither frame has: the **unviewed-states marker** beside the toggle, and the **"Gated content — shown with sample text"** indicator on a gated body |
| **B15** Preview-Only Notice *(corrected 2026-09-04, A9 item 10)* | now "Publisher or higher"; until the A9 export "Upgrade the site to Ghost(Pro) **Creator** or above" | FR-C2: **Publisher or higher**, in Ghost's 2026 Starter / Publisher / Business lineup |
| **S8a′ / S11a** Preview-Only Destination *(corrected 2026-09-04, A9 item 11)* | now "Download your theme — it installs on a self-hosted Ghost, or on a Ghost(Pro) plan that allows custom themes"; until the A9 export "download the theme and upload it in Ghost Admin" | Starter's `customThemes` limit forbids custom themes **in Ghost Admin too** — this is a plan limit, not an API limit. The zip still downloads (FR-J12, all plans); it can be installed on self-hosted Ghost or on a Ghost(Pro) plan that allows custom themes. B15 already got this right; these two now match it |
| **B8** Site Remix *(corrected 2026-09-04, A9 item 15)* | now "Re-roll what — Style Pack · Designs · Both" above "Re-roll where — This page only · Every page · Header and footer too"; until the A9 export scopes this page / every page / site-wide too / **Keep Free designs only** | *Ruling R-77:* **"Keep Free designs only" is dropped.** Remix always re-rolls from the whole library and the Pro Exit Sheet catches it at deploy. FR-D17's own axis is **what** is re-rolled — Style Pack, designs, or both — and the frame has no control for it; add it as a second radio-card group above the existing scope group, which is *where*. Both axes now exist, in the components the frame already draws |
| **B4** Inline Toolbar *(corrected 2026-09-04, A9 item 16)* | now the four marks and Remove link, no block-type menu, and B4b's link entry with "Open in new tab" and a rel row; until the A9 export four marks **plus a block-type menu ("Body")** | FR-D4 and `P0-1`: exactly the four marks and Remove link. No block types — Inflozo does not own the post body. **`P0-1` supersedes B4a**; B4b's link entry is kept and gains FR-D9's new-tab and `rel` options |
| **B23a** Starter Chooser *(corrected 2026-09-04, A7 item 19)* | now Appendix E's ten with their packs and "All Free" on Quiet and Ledger only; until 2026-09-04 ten starters, seven names invented, seven marked "All Free" | Appendix E is normative and names all ten with their pack and composition: **Aurora · Gazette · Signal · Foundry · Quiet · Pulse · Bloom · Chapter · Ledger · Studio**. FR-O4: **only Quiet and Ledger** are Free end-to-end. The frame's grid, category filter, free filter, "swap or upgrade" marks and "Start empty" escape are all kept; the roster and the Free marks are replaced. Also: no starter ships a membership template (FR-O1), so "Cohort — tiers and member pages" goes with the name |
| **B20 / S11d** Manage Keys *(corrected 2026-09-04, A9 item 17)* | now three credentials, each present or absent with one line on what it enables, the Staff Access Token "Not added · Add token", and the site URL as read-only text ("Fixed for this connection"); until the A9 export Admin + Content keys only, B20's grantable scopes, S11d's editable API URL | FR-C8: **three** credentials, each shown **present or absent with what it enables**, the Staff Access Token addable and removable at any time. Custom Integration scopes are fixed by Ghost and cannot be granted — the missing capability is the token, not a permission. **The site URL is immutable**; a domain move is disconnect + reconnect, and the affordance does not exist rather than being guarded |
| **B7** Layers *(corrected 2026-09-04, A9 item 13)* | now "on all 9 templates" and "Editing a site-wide section changes it on all 9 templates."; until the A9 export "on 26 pages" | The unit is **templates**, and a project has roughly seven to ten of them, not 26 (FR-D6) |
| **B6** Persistence Indicator *(corrected 2026-09-04, A9 item 18)* | now five states, the fifth "Syncing every change to the cloud"; until the A9 export four | Correct, and add FR-D10's **no-local-storage fallback** state — "syncing every change to the cloud" — because a false "Saved on this device" is the one thing this indicator must never say. The periodic-autosave toggle and its data-loss warning live in Account settings. **The panel's second control, "Download a copy" (`:1384`), is NOT built — R-140 (owner, 2026-09-19, Story 5.8's Q1): nothing in Inflozo reads such a file back in, so it is absent rather than greyed (UX-DR3, R-118 a sixth time) and the panel carries "Retry now" alone.** **Copy only (F-080):** the drawn label **"Saved on this device"** is the string and Appendix H now carries it; FR-D10's "Saved locally" is the state name and is never printed |

### Plan limits — Appendix F.1 is the sole definition, and several frames disagree with it

Until 2026-09-04 `S11c` said Pro connects up to **3**; `S12a` said **unlimited** projects and
**full** history; `S12b` and `M5` said **1 / 3** sites and **Last 2 / Full** history; **`S10b` said
uploads may be "up to 30 MB each"** where F.1 caps them at 10 MB on both plans; and Free's 100 MB
storage cap appeared nowhere. **Appendix F.1 governs every one of them**, and these are product
limits, so they are shown rather than implied — and since 2026-09-04 the frames print this table
(A7 item 20, A8 frame D8d): S11c "Free includes 1 site. Pro connects up to 10.", S12a "6 of 25 ·
2 of 10 · 312 MB of 5 GB · last 10 per project", S12b and M5 "1 / 25 · 1 / 10 · 10 MB / file ·
Last 3 / Last 10", S10b "up to 10 MB each". **One figure was missing until A9 item 7 landed the same day: Free's 100 MB appeared
only on M5's 390 frame**; S12b and M5 at 1440 now carry "Asset storage · 100 MB · 5 GB".

| | Free | Pro |
|---|---|---|
| Projects | 1 | 25 |
| Site connections | 1 | 10 |
| Section library | canvas: the whole library · deploy and export: the free set only | the whole library |
| Asset storage | 100 MB | 5 GB |
| Per-upload cap | 10 MB | 10 MB |
| Deploy history | last 3 | last 10 per project |
| Theme ZIP export | ✓ with credits, free designs only | ✓ |
| Credit removal | — | ✓ |

Everything not in that table is on both plans — dark-mode authoring, the Routes Manager, Style Pack
editing, Theme Settings, Translations, the Paywall editor, Post Content, card treatments, pagination
styles, Shuffle, Remix, member-state preview, preview subject, snapshot, restore, rollback and the
suggestions board. **During the 7-day grace, `pro_past_due` keeps every Pro capability**, with no
per-row exception.

**In the walk:** 5c patched the drawn plan-limit strings to this table at lift time, each patch
carrying the ruling (owner, 2026-09-03 — `reconcile-designs-decisions.md` §A12, decision 2). **The
frames caught up on 2026-09-04**, so those patches retire when the walkthrough next lifts the frames
— the 100 MB row included, since A9 item 7 landed the same day.

---

## Key Flows

The protagonists are **PRD §3's personas, used verbatim**. Each carries the one thing that decides
how a journey actually plays out — **its Ghost credential reach** — because FR-C1's Staff Access
Token is per user and carries that user's role: **every staff user has one** (docs.ghost.org/admin-api,
read 2026-09-03: "Each user can create and refresh their own token"), an **Administrator's** carries
everything Inflozo needs (`theme: all`, `setting: all` — Ghost's `fixtures.json` roles_permissions,
read 2026-09-03), an Editor's does not (`theme: browse, readActive`), and **the Owner is not
required** (F-063).

- **The solo publisher** — writer or newsletter operator, one Ghost site, zero code skills. *Is the
  site Owner, but is the persona least comfortable minting anything* — reads "Staff Access Token" as
  a warning sign. **Primary persona**, and the one FR-C1's deferral exists for.
- **The indie founder** — company blog plus a changelog; time is the scarce thing. *Credential
  reach: full.* Most likely to convert on the first exit block.
- **The creator with taste** — designer-adjacent, opinionated, opens the Style Pack editor on day
  one. *Credential reach: full.*
- **The multi-site operator** — agency hand or publisher running 3–10 Ghost properties. *Credential
  reach: variable* — works on clients' sites with delegated access; as an Administrator they can mint
  a token that suffices, as an Editor or Author they cannot, which is exactly the case FR-C1's
  graceful no-token path serves.

---

### J1 · Connect → first deploy

**Protagonist: the solo publisher.** One Ghost site, is its Owner, and reads "Staff Access Token" as
a warning sign.

**This journey has two endings, and both ship a site.** G1's under-ten-minutes target **excludes the
token step**, which is what makes it reachable.

| # | Surface | What happens |
|---|---|---|
| 1 | **Sign In** | Email → **Magic Link Sent**. No password exists to forget |
| 2 | **First Run** | Three doors. "Connect your Ghost site" is marked Recommended |
| 3 | **Connect · Integration** | Guided and screenshotted: Ghost Admin → Settings → Integrations → Add custom integration → name it Inflozo |
| 4 | **Connect · Keys** | API URL, Admin API key, Content API key. **Three fields. The Staff Access Token is not among them** |
| 5 | *validation* | Server-side `GET /admin/config/`. Ghost 5.x and 6.x accepted, 4.x and older refused with "please update Ghost". `hostSettings.limits.customThemes` decides **Preview-only** without asking. `http://` is warned. Code injection present → a one-time notice that the live page can legitimately differ from the canvas. Portal's floating-button state is read, or asked once, defaulting to on |
| 6 | **Auto-Branding** | "Nice site. Want to keep the vibe?" — accent, navigation, logo, read from the site. Use your brand, or Skip |
| 7 | **Redesign Proposals** | 2–3 whole-site combinations on her real posts, each argued from her own data. Or **Starter Chooser**, or straight to a blank canvas |
| 8 | **Editor** | She builds. Everything works: the whole library on the canvas, every control, every template |
| 9 | **Deploy Destination** | "Ship it". Step 1 of 6, because this is the first deploy to this site. The card names the site, offers **Deploy & activate** or **Deploy only**, and states the theme that will be created: `inflozo-orbit-weekly`, in mono, with one line saying the name is frozen for this site from now on (FR-J10) |
| 10 | **Staff Token Offer** | Step 2. **"One more step unlocks a safety net — a copy of your current theme before we replace it, plus a check that nothing else has changed it."** It states plainly that this is a full-Administrator credential — hers as the Owner, or any Administrator's on the site (FR-C3, F-063). **Two buttons, both plain** — paste a token, or decline |
| 11 | **Backup Gate** | Step 3. Flow **F7**. Blocks the deploy button until confirmed |
| 12 | **Pre-flight Check** | Step 4. gscan, templates, helpers, routes — and every warning the PRD names |
| 13 | **Snapshot Gate** → **Deploy Progress** | Step 5. Flow **F1**, then Uploading → Activating — the artefact step 4 compiled and checked (AD-20) |
| 14 | **Deploy Live** | Step 6. **"Live! Your site just got gorgeous."** The product's one confetti moment |

**Step 1 has two endings too, and only one of them is Live.** "Deploy & activate" and "Deploy only"
are distinct buttons (FR-J8), and a deploy-only never makes the site live — so it ends on **Deploy
Uploaded**, not on Deploy Live. **The confetti fires on the first deploy that makes the site live**,
which is what Appendix H's own string settles: "Live! Your site just got gorgeous" would be false on
a theme nobody is serving. A deploy-only that is later activated gets it then. *Routine judgement,
made here rather than carried to the owner: the canonical string decided it.*

**Deploy Uploaded and Partial Success are the same state reached two ways**, and the history row is
identical for both — `uploaded`, `activated` false, no active badge, **Re-activate** (D2e and D2f are drawn side by side to say exactly this, with the one row under both). Only the cause
differs, so only the sentence differs: *"Uploaded. You chose not to make it live yet."* against
*"Your theme is on your site but isn't live yet."* Neither is an error, and **neither sends a
deploy-failure email** (FR-P1 email 5).

**Ending A — the token was given.** The snapshot captured her live theme; it sits in **Deploy
History** as a restorable row that never prunes. Later deploys run the **Drift Report** first. Routes
upload automatically.

**Ending B — the token was declined, permanently.** The decline is acknowledged **once**, naming
exactly what it costs — **no snapshot, no drift check, manual routes upload** — and then never raised
again for that project. At step 5 the **Snapshot Gate** shows its designed degraded state rather than
an error: no snapshot could be captured, and **Ghost keeps the previous theme under Settings →
Design**, with how to reactivate it there. The deploy proceeds. The Admin API key uploads and
activates a theme on its own. **She ships.**

> **Nothing in this flow implies she has done something wrong** (Appendix H). Declining is a plain
> button, not a link in small type. The token can be added later at any time from **Manage Keys**,
> which enables the snapshot *from that point forward* — it cannot reconstruct a snapshot of a theme
> that has already been replaced, and the UI does not pretend otherwise.
>
> **The multi-site operator reaches the same screen and may not be able to comply.** Working on a
> client's site with delegated access, an **Administrator** can mint a token that suffices; an Editor
> or Author cannot mint one Inflozo can use (F-063). For the second case Ending B is not a
> degradation — it is the path, and a hard token requirement at connect would have locked them out
> of the product entirely.

---

### J2 · Blank-canvas build

**Protagonist: the creator with taste.** Full credential reach, opinionated, will find the ceiling of
a closed control vocabulary.

| # | Surface | What happens |
|---|---|---|
| 1 | **First Run** → **Editor** | "Blank canvas — an empty page and every design." The canvas is empty and says so with one affordance: **+ Add section** |
| 2 | **Section Picker** | `⌘K`. Full-screen, category rail on the left, live previews **already wearing the project's Style Pack and content source**. Pro designs carry ✦ and can be placed freely |
| 3 | **Editor** | The section lands where it was invoked. Hover gives the outline, the name tag and the design arrows |
| 4 | **Design Nav** / **Design Picker** | **The climax beat.** She presses `]`. The section becomes a different design — same words, same image, new arrangement — in a 180ms slide-fade. `]` again. And again. The counter reads 7 of 18. She presses `[` three times and is back **exactly** where she started, because a control that only the design she left had was **parked**, not discarded |
| 5 | **Control Sidebar** | Four to seven controls, and they are **this design's**. The image-backdrop design offers a scrim and an image focus; the big-type design offers three controls and no image controls at all, and says why: "This design has no image. Nothing to crop, position or scrim." |
| 6 | **Inline Toolbar** | She clicks the headline and types. Selecting raises four marks — bold, italic, underline, link — and nothing else |
| 7 | **Style Packs** | She opens the panel, hovers Tangerine, and the whole canvas crossfades over 300ms |
| 8 | **Template Switcher** | Home → Post → Page → Tag → Author. The six untouched synthesizable templates already render their default stacks, each carrying the **Auto-Generated Marker** until her first edit materialises it |
| 9 | **Layers** | `L`. The Site-wide group sits at the top with its template count; below a hairline, this page's sections. She drags one and the canvas follows |
| 10 | **Preview Mode** | `P`. Every chip, outline and handle vanishes; the countdown ticks and the rotator rotates. `Esc` returns |
| 11 | **Device Preview** | `3`. The canvas becomes 390 × 844 — a phone-shaped viewport that scrolls inside itself — so she can see where the fold lands |
| 12 | **Site Remix** | `⇧R`. One button re-rolls every design on the site, keeping every word she typed. One undo, always |
| 13 | **Deploy Wizard** | Four steps, because this project has shipped to this site before |

**What this journey proves:** the canvas never tells her she is wrong. Every refusal in it is a
*structural* one — a control that could never do anything here is absent with a reason, not greyed;
a second Post Content section is refused at placement with "this layout already prints the article";
a design binding a resource this template does not have is never offered in the picker at all.

---

### J3 · Free-plan ship

**Protagonist: the solo publisher**, on Free, one project, one site.

**"Open canvas, gated exits."** She may place, shuffle and edit any Pro design. Enforcement happens
only at the exits — deploy, ZIP export, and any surface exposing compiled theme code.

| # | Surface | What happens |
|---|---|---|
| 1 | **Dashboard** (Free) | One project. The ⋯ menu offers Rename, Duplicate, Delete. A second project opens the **Upgrade Sheet** with the limit stated: "Free includes 1 project. Pro gives you 25." |
| 2 | **Editor** | She builds with whatever looks best. Four of her sections are Pro. Each carries a **Pro Design Badge** on selection — marigold, in the corner, **and nothing happens when she clicks it** |
| 3 | **Deploy Wizard** → **Pro Exit Sheet** | **The climax beat.** "Ship it" opens a sheet over a dimmed editor: **"Four Pro designs are in this site."** Then, immediately: *"You can swap each one for a Free design and ship today, or go Pro and keep them exactly as they are. Nothing is deleted either way."* |
| 4 | **Pro Exit Sheet**, itemised | Four rows. Each names the Pro design, the section it occupies, and the remedy that actually exists for it: **swap** (via Shuffle — any free design in that category's ring), **remove it**, or — for a non-placeable treatment — **revert to the free design of that treatment**, on the surface where it was selected. Swapping one shows SWAPPED with an **Undo**. Two buttons: **Swap and ship free** (secondary, because a real second path presented as a link reads as a refusal) and **Go Pro and ship** (marigold) |
| 5a | *she swaps* | The sheet closes, the canvas has changed and her words have not. Back into the wizard |
| 5b | *she upgrades* | **Upgrade Sheet** → Dodo hosted checkout, yearly pre-selected with monthly one click away, both prices always shown. On return the server verifies the subscription directly and grants Pro without waiting for the webhook. **Pricing** (`M5`) is the public statement of the same terms |
| 6 | **Backup Gate** → **Pre-flight** → **Snapshot Gate** → **Deploy Live** | First deploy to this site, so the six-step wizard. Confetti |

**What she keeps on Free:** every design on the canvas · dark-mode authoring · the Routes Manager ·
Style Pack editing · Theme Settings · Translations · the Paywall editor · Shuffle · Remix ·
member-state preview · the snapshot, restore and rollback · the suggestions board · and the theme
ZIP export, with credits and free designs only.

---

### J4 · Downgrade recovery

**Protagonist: the multi-site operator.** Six projects, two connected sites, 312 MB of assets. A
client's card was cancelled and the renewal failed. Their churn is client attrition, not
dissatisfaction — which is exactly why this journey must not feel like a punishment.

| # | Surface | What happens |
|---|---|---|
| 1 | **Grace Banner** | Payment failed. The banner leads with what does **not** happen: *"Your sites stay live and nothing is deleted."* Then the fact: 7 days to update the card, with the next retry date. Serious voice, no coral, no wit |
| 2 | *during grace* | **Every Pro capability is kept.** 25 projects, 10 sites, 10 stored versions, the whole library at both exits. `pro_past_due` is internal and is never shown as a plan |
| 3 | **Billing** / **Pricing** | Update card, or let it lapse |
| 4 | *grace expires* | The account becomes `free`. **Nothing is deleted, on any path** |
| 5 | **Over-Limit Sheet** | **The climax beat.** An itemised sheet: **exactly what is over, and by how much.** Projects 6 of 1 · Sites 2 of 1 · Assets 312 MB of 100 MB · Stored versions 8 of 3. Each row names its own remedy, and none of them is Inflozo doing it for them |
| 6 | **Over-Limit Sheet** → choose | **"Which project stays editable?"** — a list, most-recently-updated pre-selected. The other five become **read-only**: viewable, still exportable, and editable again the moment the account is Pro |
| 7 | **Sites** | Deploys stay blocked while connections exceed the cap, until they disconnect down to one. **Each disconnected site keeps its pre-Inflozo snapshot** — snapshots are bound to the site record, not the URL, and survive disconnect, reconnect and project deletion |
| 8 | **Assets** | Over quota, the library goes read-only: existing files stay, uploads are blocked, until they delete below the cap |
| 9 | **Deploy History** | Retained artifacts above three are **kept**, not pruned; no new ones are retained until the count is back under the cap |
| 10 | *resolved* | Exits unblock. Nothing was lost |

**What stays available throughout — and this is the point of the journey:**

- **Existing deployed themes are never touched.** Their live Ghost sites keep serving what Inflozo
  shipped, indefinitely.
- **Rollback, snapshot restore and the FR-C5 compatibility redeploy remain available** on connected
  sites, on any plan, throughout. They redeploy a stored artifact rather than the working document,
  so they need neither the edit lock nor the Pro exit gate.
- **Export still works** from a read-only project (FR-J12). Read-only means not editable; it never
  means locked in.
- **Cancellation always completes in three clicks or fewer**, and there are no retention dark
  patterns.

**If the downgrade came from a dispute rather than a lapse**, the account moves to `free`
*immediately* — but the edge back exists: support restores it manually, with the reason and the
resolving event recorded, for **the remainder of the original paid term**, and every consequence
above lifts at once. No email is sent, because the user asked for it and is present when it happens.

---

## The eight flows

Each is **a designed surface, never a warning toast**.

---

### F1 · Pre-deploy snapshot gate — FR-J13

**Surface: Snapshot Gate** — `B Missing Surfaces.dc.html` B12a running, B12b degraded. Semantics
re-specified; visual treatment kept — and the frames have carried the re-specification since
2026-09-04 (A7 item 2).

**When it fires.** At Inflozo's **first theme upload to a site**, deploy-only included — manual
activation in Ghost Admin must not bypass the safety net. **Not on every deploy**, which is what the
frame says.

**What it is.** Inflozo downloads and archives the site's currently active theme as a restorable
artifact, **excluded from the asset quota and exempt from history-retention pruning**. The frame's
line "snapshots count towards your history — Free keeps 3, Pro keeps 10" is wrong and goes.

**Its four named steps** stay exactly as drawn: reading the live theme from Ghost (with the live
theme's name and version as a mono chip — `casper 5.9.4`), writing the snapshot with a real byte
count, uploading the new theme, checking it. Cancel is available while it runs.

**A theme carrying Inflozo's `package.json` marker is never captured as a snapshot.** The rule keys
on the marker, not the theme name — a user can export a theme and rename its package (FR-J12), so
keying on the name would let Inflozo capture its own theme as that site's "original" and turn
restore-to-original into restore-to-Inflozo.

**States**

| State | What the surface shows |
|---|---|
| **Running** | B12a as drawn, minus the two wrong sentences |
| **Captured** | The step list completes and the wizard moves on. No celebration — this is plumbing |
| **No Staff Access Token** *(the designed degraded path, not an error)* | **"We could not archive your current theme."** Then the honest reason: **reading a theme needs a Staff Access Token from the site Owner or an Administrator, and this project does not have one** — this is structural on every Ghost version and every host, and there is no permission to grant. Then what protects them anyway: **Ghost keeps the previous theme under Settings → Design**, with how to reactivate it there. Three actions: **Add the token** (opens Staff Token Offer) · **Deploy without a snapshot** · **Cancel** |
| **Capture failed for another reason** | The request and the status code, because a person can act on a specific failure and cannot act on "something went wrong". Same three actions |
| **Restore** | From **Deploy History**. One-click redeploy that skips *Inflozo's* gscan gate — but **Ghost validates every upload with its own gscan**, so an old theme can be rejected on the way back in. That case has its own designed fallback: the snapshot zip is offered as a download, and the user is pointed at Settings → Design, where Ghost still holds it |

> **B12b's copy was wrong in the way that matters most** (corrected 2026-09-04, A7 item 2). It said "your integration key may not have
> theme read permission … Check the key." Ghost's `tokenPermissionCheck` allowlists only
> `themes: ['POST','PUT']` for Custom Integration tokens, so **every** `GET /themes/*` made with an
> Admin API key returns 403 — on every version, every host. There is no key to fix. Telling a user
> to go and fix one sends them to spend an afternoon on something that cannot be done.

---

### F2 · The three-party edit-lock choreography — FR-D18, `addendum.md` §AD2

**Surfaces: Editor** (read-only banner) — B5a · **B5b** the request popover · **B5c** the takeover
modal. Semantics re-specified; the escalation is kept exactly as drawn.

**One editing context per project**, across tabs, browsers and devices. The three frames escalate
deliberately — **a bar, then a popover, then a modal with a danger fill** — and the interruption
grows only as the stakes do. That escalation is the design and it stands.

**The three parties**

| Party | Surface | What they see |
|---|---|---|
| **The reader** (opened it second) | **Editor**, read-only | B5a: a bar — "Rosa is editing this site — you are reading along" + **Request editing**. The canvas stays fully legible; the sidebar dims to 55% so controls are *visible* but nothing responds |
| **The holder** | **Editor** | B5b: a **popover, not a modal** — the holder is mid-sentence. It states the sync position *before* asking: "All your changes are synced · 0 pending". **Hand over** / **Keep editing**, with a countdown. **The countdown is a no-response timer and it restarts the instant the holder interacts with the popover at all, focus included** — so a present holder is never hurried into a decision that loses someone else's work. **It does not stop:** §AD2's nudge is answered only by **Hand over** or **Keep editing**, and a holder who focuses the popover and does nothing has not answered it, so §AD4's ~30 s runs again from their last interaction and then the requester's take-over is offered exactly as §AD2 says (F-079 — the smallest rule consistent with §AD2, taken here; the constant stays §AD4's). **B5b is announced assertively** (§ Accessibility Floor), because a request that arrives silently is a request a screen-reader user answers by not answering |
| **The requester, unanswered** | **Editor** | After ~30 seconds: "No response; that session has X unsaved edits", and **take over anyway** is offered |
| **The revived former holder** | **Editor**, read-only | "That session had 14 unsaved edits; they were not included." It flips to read-only and its local journal is cleared |

**The takeover — B5c, and three things about it are decided.**

1. **A takeover is allowed.** It is not a wall.
2. **The count is `unsynced_edits`, and it is edits, never operations** (AD-16, §AD2). A Variant
   Shuffle is several operations and **one edit**, because the number appears verbatim in the string
   that tells a person what they lost. **No operation count is ever surfaced, stored in the heartbeat
   or logged for display.**
3. **The message is honest rather than reassuring.** A takeover is not a graceful hand-off. Work that
   had not synced is genuinely gone — the losing device's journal is cleared unconditionally on its
   next hydrate, there is no merge path, and orphaned edits are never recovered.

> **One deviation from B5c, and it is not optional.** The frame itemised the loss per section —
> "Home hero — design and two controls · Footer — three link labels · Post template — measure" —
> until A9 item 4 corrected it on 2026-09-04. **That detail does not exist.** The heartbeat carries `unsynced_edits` and nothing else; the
> requester's browser has never seen the holder's journal. The modal keeps its shape, its danger
> fill and its "Or message Rosa" escape, and its body becomes: **"7 unsynced edits will be lost.
> They exist only in Rosa's browser. We cannot retrieve them from here."** The second sentence is
> the frame's own and it is exactly right.
>
> Also: **B5c says "changes"; §AD2 says edits is canonical, everywhere** — the field name, the
> heartbeat, the FR's prose and every user-visible string.

**Deploy and export require the lock.** From a read-only session, Ship it or Export first prompts a
take-over, **surfacing "X unsaved edits exist elsewhere"** — so a stale cloud snapshot can never
silently ship. This state is `D8 Editor Below 1440.dc.html` D8g — B5c's confirm reused at the entry
point that had none, "Take over to ship?", focus opening on Wait — and it joins B5's family.

**The security half is already enforced in the schema.** A holder change cannot happen without
advancing `lock_generation`, and that number is what the displaced device detects the takeover from
— independently of any revision comparison, which is why a takeover whose new holder has not yet
written anything still clears the loser's journal.

**Not a finding:** B5b's "Expires in 60s" against §AD4's ~30s default. Both are tunable defaults the
Architect owns.

---

### F3 · The guided routes-upload card — FR-I4

**Surface: Routes Fallback Card** — B16. Semantics re-specified; visual treatment kept.

**`routes.yaml` uploads automatically, and this card is the fallback.** The route is
`POST /settings/routes/yaml`, `multipart/form-data`, file under the field name `routes`, performed
with the **Staff Access Token** and immediately verified by reading the file back byte-for-byte.

**Why the frame was wrong** (corrected 2026-09-04, A7 item 3). B16 said "your integration key is missing the settings permission … Fix
the key." **Integration tokens never carry `setting: edit`** — Ghost's allowlist binds them and there
is nothing to grant. A **staff** token carries a `user_id`, skips the allowlist entirely, and an
Administrator or Owner holds `setting: all`.

**When the card appears** — exactly three cases, and each names itself:

| Cause | What the card says |
|---|---|
| No Staff Access Token was ever supplied | "We normally upload this for you. Uploading a routing file needs a Staff Access Token from the site Owner or an Administrator, and this project doesn't have one — so this once, you'll do it by hand." + **Add the token instead** |
| The token was revoked or rotated | "…your token has stopped working." + **Update the token** |
| The token's role is below Administrator | "…this token belongs to a staff account that can't write settings. Only an Owner's or an Administrator's token can (F-063)." |

**The three steps stay as drawn**, with one correction each:

1. **Download the file we generated** — `routes.yaml`, with its real size. Unchanged.
2. **In Ghost, upload it.** **The menu path is not hard-coded.** Ghost 5.130.6 carries
   `Advanced`, `Labs`, `Import/Export` and `Export`; **Ghost 6.58.0 carries none of them** — there is
   no `settings/advanced` and no `settings/labs` route, and Ghost 6's export UI sits behind a lab
   flag. So the card **describes what the customer is looking for and links to Ghost's own help for
   the version Inflozo detected at connect**, rather than naming clicks that are already wrong for
   some customers.
3. **Come back and press Verify.** Without the token, what Verify can actually do is unproven
   (`NE-S-1`), so the copy claims only what it can do: it re-reads the routing through the Content
   API where it can, and otherwise says it could not confirm.

**"Fix the key instead" becomes "Add the token instead"**, and the footnote under it —
"fixing the key makes this automatic again" — becomes **"adding the token makes this automatic from
now on."** *(Both are in the frame since 2026-09-04.)*

**States:** *needed* (as above) · *uploaded and verified* (the card resolves to a single confirming
line and does not return) · *could not verify* (the file was uploaded, the read-back failed — say so
and offer Verify again, never claim success).

**It is not a warning toast.** It is a first-class surface, reachable afterwards from the site card
and from the Routes Manager, and a project can sit in this state indefinitely without anything
degrading except the automation.

---

### F4 · The library-update confirm — FR-J14

**Surfaces: Library Update Notice** — B14a · **Library Update Confirm** — B14b. **Both are right**,
and this flow is the one §37.7 found correct. One stale sentence was corrected here first, and B14b caught up with A9 item 12 on 2026-09-04.

**Why a confirm exists at all.** Compiles always use the current library — a single live library,
no per-project pinning — so **any redeploy carries every library change since the project's last
deploy, and there is no way to redeploy without them.** Because the update is inseparable from the
redeploy, the deploy flow makes it consensual instead.

**The notice (B14a)** lives *inside* the project card rather than as a badge on it, because it needs
a sentence and a button: "Three designs in this site were improved since you shipped." Marigold is
right — it is a nudge, and it never blocks.

**The confirm (B14b)** is a **mandatory step before compile proceeds**, whenever the library has
advanced since this project's last deploy. Each row names the design, **what was actually fixed, in
the language of the problem it solved** — "Form no longer overflows at 390 when the button label is
long" — and the version pair. **"Nothing changes until you ship."** Two actions: **Update and ship**
· **Not now**.

**This is a fact, not a guess:** every deploy records its library version and the variant manifest it
shipped, which is what makes "advanced beyond" checkable.

> **The one stale line.** B14b says "We snapshot before redeploying, so this is reversible from
> history." The snapshot is **first upload only** (FR-J13). What *is* true and is what the line
> should say: **the version you are on now stays in history and rolls back in one click** — every
> successful compile is stored as an artifact.

**What makes this safe rather than merely consensual** — the backward-compatibility contract:
designs are never deleted, only **superseded** (hidden from the picker, placed instances keep
rendering); schema changes are append-only or ship a migration map; catalog keys are append-only and
never reworded in place. So a placed section can fail to resolve **only** when a schema migration
fails, and that case — and only that case — degrades to the nearest current design, **with a visible
notice**. Never a silent re-render, never a failed load, and no deletion path to build.

**One exemption, and it is narrow.** FR-C5's compatibility redeploy re-ships a design that already
ran and skips this confirm — and it carries **only** the compatibility fix. It never picks up a
pending library advance, a Style Pack change or an unconfirmed design update that happens to be
waiting. That narrowness is what keeps "nothing changes without your say-so" true.

---

### F5 · The Preview-only explanation, and its clearing conditions — FR-C2

**Surfaces: Preview-Only Notice** — B15 · **Preview-Only Destination** — S8a′ · the Sites card —
S11a. **B15 is right**; the other two are not, and they move to match it — here and in the prototype; all three frames agree since A9 items 10 and 11 landed on 2026-09-04, and the walkthrough no longer patches them.

**Preview-only is probed, never asked.** At connect, `hostSettings.limits.customThemes` is read from
`GET /admin/config/`. **Its shape is a theme-name allowlist, not a yes/no flag** — Ghost's
`@tryghost/limit-service` declares `customThemes` as an allowlist limit and the upload endpoint runs
`errorIfWouldGoOverLimit('customThemes', {value: themeName})` (read in source, Ghost 6.54.1
`api/endpoints/themes.js:53-54`, `services/themes/installer.js:25`, limit-service `config.js:49`) — so
the probe tests **Inflozo's frozen theme name** (FR-J10) against the list, and "present" does not mean
"blocked". Its absence means self-hosted and unlimited (**executed**, `MEASUREMENTS.md` §15h). **The
Ghost(Pro) half is unexecuted** — VERIFY-AT-BUILD item 2 is ⛔ until a Starter trial captures the
payload — so everything below about Starter is read from Ghost's pricing page (item 1), not observed
(F-065). **There is no user-declared-plan step in the happy path and no plan field in Manage Keys.**

**The notice (B15)** is **sky, not danger** — this is information, not a failure, and the site works
perfectly for everything except deploying. It states the cause in Ghost's terms: Ghost restricts
theme uploads on Ghost(Pro) Starter, so Inflozo cannot deploy to this site; the user can design,
preview and export everything.

**The two clearing conditions, as drawn** — and both clear **automatically**:

1. **Upgrade the Ghost site to Publisher or higher** *(not "Creator" — that is the frame's one
   error; Ghost's 2026 lineup is Starter / Publisher / Business)*, then it clears on its own.
2. **Move the site to self-hosted Ghost**, where theme upload is always available.

**Clearing is not the user's job.** FR-C5's **daily health check re-runs the probe**, so the flag
sets and clears without any user action. The drawn **Re-check plan** button stays, because a user who
has just upgraded should not have to wait a day. And **a successful deploy clears it** — the deploy
error is authoritative over the probe, in both directions.

**The fallback when the probe cannot read.** The `hostSettings` shape is undocumented and
host-controlled, so where it is present but unreadable, **the flow asks** — one question, which plan
this site is on. That question exists only on that path.

**States:** *set at connect* · *set by a rejected deploy* (a friendly explanation, a "check or
upgrade your Ghost(Pro) plan (Publisher or higher)" prompt and a docs link) · *cleared by the daily
probe* · *cleared by a successful deploy* · *asked* (the unreadable-`hostSettings` path).

> **S8a′ and S11a say the wrong thing, and it is the kind of wrong that wastes an afternoon.**
> Both say "download the theme and upload it in Ghost Admin". Starter's `customThemes` limit forbids
> custom themes **in Ghost Admin too** — this is a plan limit, not an API limit, so the manual route
> does not exist either. The zip still downloads on every plan (FR-J12); what the copy must say is
> where it can be installed: **a self-hosted Ghost, or a Ghost(Pro) plan that allows custom themes.**

---

### F6 · The post-deploy template-binding checklist — FR-I6

**Surface: Template Binding Checklist** — B19. **Was drawn on a mechanism FR-I1 forbids; corrected
on 2026-09-04 (A7 item 1).** The frame's components — the numbered steps, and especially the small
honest facsimile of Ghost's own page settings on the right — are kept. Everything they said changed,
and the frame now says it.

**Why it exists.** A designed membership page or custom template compiles to `custom-{name}.hbs` and
emits **no route**, which removes a Ghost Admin step and leaves exactly one: someone must open the
Ghost page editor and pick the template from the **Template** dropdown. Until FR-I6, the product
specified the mechanism and shipped no flow for it, so the last step of a designed membership page
was a thing the user had to already know.

**What the frame gets wrong**

| B19 said, until 2026-09-04 | The truth — and what B19 now draws |
|---|---|
| `page-membership.hbs` | **`custom-membership.hbs`.** Inflozo **never** emits `page-{slug}.hbs`: that form is matched against the live slug at render time, **detaches silently the moment the user retitles the page**, and outranks the user's explicit dropdown choice — Ghost Admin disables the dropdown outright when a slug template matches |
| "Set its URL slug to `membership`" | **Pick the template from Ghost's page-editor Template dropdown.** Ghost stores the chosen filename on the page's own row, so the binding survives a retitle, a slug change and a theme swap |
| "Ghost picks the template up automatically — there is no setting to toggle" | There is exactly one setting to toggle, and this is it |
| A **MATCHED** badge | **Deleted.** It implies a verification that does not exist: the assignment lives on Ghost's page row and the Content API does not expose which template a page selected |
| One template | **Every** emitted template, one row each |

**What it is instead.** A **checklist, not a notification**, and it fires **from the deploy success
state**, because it is a post-deploy step and nothing earlier can complete it.

- One row per emitted `custom-*.hbs`, each naming **the exact filename** and **the exact dropdown
  label Ghost will derive from it** — §7.4's transform is fixed, so the label is shown rather than
  guessed.
- A **done-state the user marks themselves**.
- **"We can't see whether you did this"**, said plainly. That is the honest version, and the flow
  says it rather than implying verification it does not have.
- The click-path in Ghost Admin, and a **deep link into the connected site's page editor**.
- The right-hand **Ghost facsimile panel stays** — it is what makes the guidance usable — redrawn to
  show the Template dropdown rather than the URL field, with no badge.

**Where it appears.** On **Deploy Live**, as a "one step left" card — **not a modal that must be
dismissed to reach the confetti. The deploy succeeded.** Afterwards it is reachable from the
Template Switcher and from the site card. **A project whose deploy emitted no custom template never
sees it** — which is every starter's first deploy, so the confetti stays clean.

**One nudge, once.** If the flow is still unopened a day after such a deploy, Notifications raises it
**once, and never again**.

**And the warning that belongs beside it.** Removing every section from a designed custom template
returns it to untouched and its file stops being emitted; a Ghost page still pointing at that
filename **falls back to `page.hbs` rather than erroring**. That fallback is silent on Ghost's side,
so Inflozo is not silent on its own — **Empty Template Warning** fires before it takes effect,
naming the consequence: *the page still loads, wearing a different design.*

---

### F7 · The pre-deploy backup gate — `BACKUP-GATE.md`

**Surface: Backup Gate** — `D1 First-Deploy Gates.dc.html` **D1d** (self-hosted, token given),
**D1d′** (the shortcut ticked) and **D1e** (Ghost(Pro), token declined), drawn on 2026-09-04 from
Appendix A prompt A1. Extrapolated from the **Deploy Wizard**'s step card (S8b's checked-row list)
and the **Pro Exit Sheet**'s itemised rows (B13a), reusing both verbatim — and the frames do.

**Owner decision, 2026-08-21: Inflozo is not a backup tool and does not undertake to be one.** It
does not copy, keep or restore the customer's Ghost data. Instead, before Inflozo changes anything on
a connected site, the customer is **blocked** until they confirm they hold their own backup — and is
shown exactly how to take one.

**Where it fires: at first deploy to a site, not at connect.** Connecting changes nothing — it only
reads. The first deploy is the first moment anything is overwritten, so it is the first moment
consent is meaningful. Putting it at connect would also cost G1's under-ten-minutes target for no
safety gained. **Once per site**, re-shown if the site is disconnected and reconnected.

**It blocks the deploy button until confirmed.** It is step 3 of the six-step first-deploy wizard.

**What it offers as a download, and when** *(owner, 2026-09-03, F-077 — FR-J13 amended to match)*.
**With the Staff Access Token present** — given at step 2 — the Theme and `routes.yaml` rows each
offer the current file as a download served by Inflozo, because that token lifts `GET /themes/`
(VERIFY-AT-BUILD item 9). **Without it, no download is offered**: the rows name what to look for in
Ghost Admin and link to Ghost's help for the connected version, exactly as `BACKUP-GATE.md`
specifies. The gate never promises a file it cannot fetch. *(Recorded, not ruled:
`GET /admin/settings/routes/yaml/` answered 200 to the integration key alone on both majors —
`MEASUREMENTS.md` §37 — so `routes.yaml` could be offered on both paths; that loosening is the
owner's to take.)*

**It opens with the honest part, and the honest part comes first.**

> **Inflozo writes exactly two things to your Ghost site: your theme, and `routes.yaml`.**
> It never writes posts, pages, members, tags, settings or redirects.

Then the recommendation, with its reason given rather than implied: **a full backup is still the
right thing**, because a theme change is reversible only if you can put the old theme back, and the
cheapest insurance against every other surprise is the backup you already have.

**A warning that overstates gets clicked through, and a gate everyone clicks through is not a gate.**
That is why the modest truth is stated before the broader advice.

**The checklist — one checkbox per item, because a single "I have a backup" invites a single reflex.**
The two Inflozo actually touches are marked; the rest are recommended.

**Self-hosted — the shortcut is offered as the shortcut it is:**

> ☐ **I have run `ghost backup` and saved the archive somewhere off the server.**

One command produces one archive containing the content JSON, a full member CSV, **all installed
themes including the active one**, images, files, media, and copies of `routes.yaml` and the
redirects file. Ticking it **checks every box below**, because the archive genuinely contains all of
it — **and the individual list stays visible**, so the customer can see what they now hold.

**Every item, individually:**

| | Item | ⚠️ |
|---|---|---|
| ☐ | **Theme** — *Inflozo replaces this* | **The one thing that makes rollback possible** |
| ☐ | **`routes.yaml`** — *Inflozo may overwrite this* | Inflozo's routes manager replaces the whole file |
| ☐ | **Content** — posts, pages, tags, settings, staff | **Does NOT include your images.** See the images row |
| ☐ | **Members** | Includes `stripe_customer_id`, so it round-trips to another Ghost |
| ☐ | **Redirects** | Inflozo never touches this. Listed because losing redirects breaks existing links |
| ☐ | **Images, files and media** | **The gap most people miss.** The content export does not carry them |
| ☐ | **Database** | Ghost's own docs: for disaster recovery, back up the database and content folder directly — the JSON export is for moving content, not for restoring a site |

☐ **I confirm I have a complete backup of my site and understand Inflozo will replace my theme.**
Disabled until every item above is ticked or covered by the `ghost backup` checkbox. **The deploy
button stays disabled until this is ticked.**

**Three things the design must not soften — and one of them is the reason this flow exists:**

1. **Ghost's JSON content export does not include images**, and the gate says so on the row where a
   customer would otherwise assume it did.
2. **`ghost backup` covers everything in one command** for self-hosted customers, offered as the
   shortcut it is rather than buried under seven manual steps.
3. **Ghost(Pro) customers have no shell access, and there is no bulk image download in Ghost Admin.**

**How the Ghost(Pro) block is worded, and why it is worded that way.** This claim is **cited, not
executed** — `BACKUP-GATE.md` records that Ghost's own documentation offers no route and says to
contact your host, and there is no Ghost(Pro) test server yet (T2 is owed, T4 is deferred by owner
decision and its gate is launch-blocking). Under this project's standing rule that is a hypothesis.
So the copy says **what Ghost Admin does and does not offer, and points the customer at Ghost** —
rather than asserting a platform-wide impossibility in Inflozo's own voice:

> **On Ghost(Pro), themes, content, members, routes and redirects all download from Ghost Admin.
> Images and media do not** — Ghost Admin has no bulk export for them, and there is no server to
> copy them from. Ghost's own documentation points you at your host's support for this. Ghost(Pro)
> also takes its own platform backups; that is a Ghost service, not an Inflozo one, and it is worth
> confirming with Ghost what it covers and how to request a restore.
>
> **This is not something Inflozo can fix, and we are not going to pretend otherwise.**

**No menu path is hard-coded** (`MEASUREMENTS.md` §33, executed 2026-08-31): Ghost 5.130.6 carries
Advanced, Labs, Import/Export and Export; **Ghost 6.58.0 carries none of them**, and Ghost 6's export
UI sits behind a lab flag. Each row **describes what the customer is looking for** and links to
Ghost's own help for **the version Inflozo detected at connect**.

**What this is, and what it is not.** It is a **consent gate, not a technical control**. It moves
responsibility; it does not reduce risk. A customer who ticks the box without having backed up still
loses their theme — they simply had a fair chance not to. That is a deliberate trade, recorded as a
decision rather than left to be discovered as a side effect.

**States:** *self-hosted* (with the `ghost backup` shortcut) · *Ghost(Pro)* (the shortcut replaced by
the block above) · *unknown host* (both paths offered, neither assumed) · *partially ticked* (master
confirm disabled, and it says which rows remain) · *confirmed* (the gate collapses to one line for
the rest of the wizard, and never fires again for this site).

---

### F8 · Deploy history with pinning — FR-J7/J9, `BACKUP-GATE.md` § Rollback retention

**Surface: Deploy History** — S8e, **completed by `D2 Deploy History Completed.dc.html`** (Appendix
A prompt A2, drawn 2026-09-04). The drawer, its rows, the gscan chips, the active badge and the
roll-back confirm are all drawn and all kept; D2a adds pinning and the original-theme row, D2b the
refusal with its reason, D2c the Free drawer, D2d the partial-success row.

**The limit: at most 10 stored versions per project on Pro and 3 on Free. Pinned versions count
against that total.**

**Three rules the surface has to carry.**

**1. The limit is stated, not implied.** S8e already prints "Pro keeps the last 10 versions. Free
keeps the last 3." — and it is right to. **A list that silently drops its oldest entry reads as
complete when it is not.** The line stays, and on Free it stays too rather than being hidden as an
upsell.

**2. The history must never show a version it cannot restore.** A dead Restore button is worse than a
shorter list. So:
- A pruned artifact does not appear as a greyed row. It is **gone from the list**, and the stated
  limit is what explains where it went.
- **These artifacts are not regenerable** (AD-29, decision D10): rebuilding an old design against
  today's section library produces a *different* theme, which is why rollback replays a **stored
  file** rather than recompiling. **The retention limit is therefore the true bound on how far back a
  customer can go, and the surface says so** in one line beside the limit.

**3. At least one version must stay unpinned**, enforced in the database. Reserving one slot for the
newest build means deploying can never be blocked by pinning.

**Pinning, drawn on rows that already exist.**

| | Behaviour |
|---|---|
| **Pin** | A pin control on every row — "keep this one, it was good". A pinned version survives pruning |
| **The cap** | At most **N−1** pinned: 9 of 10 on Pro, 2 of 3 on Free |
| **The refusal** | Pinning the last unpinned version **refuses, visibly, with the reason** — *"One version has to stay unpinned so your next deploy has somewhere to go. Unpin another first."* Never a silent failure |
| **Unpinning** | **Always allowed, by design**, so nobody can trap themselves |

**Two rows S8e does not have, and both are required.**

- **The pre-Inflozo snapshot** — the site's original theme, archived at first upload. It sits
  **above** the version list as its own row, marked as the site's original rather than an Inflozo
  build, and it is **outside the 3-or-10 count entirely**: FR-J13 exempts it from pruning. Its action
  is **Restore original**, and it carries the honest caveat that **Ghost validates every upload with
  its own gscan**, so an old theme can be rejected on the way back in — in which case the zip is
  offered as a download and the user is pointed at Settings → Design.
- **A partial-success row** — status `uploaded`, `activated` false. It appears **without an active
  badge**, so a retry is a one-click **re-activate** rather than a recompile. See below.

**Rollback is exempt from FR-L3's Pro exit gating** — restoring an artifact that already ran is
always allowed, on any plan. Rollback and snapshot restore redeploy stored artifacts rather than the
working document, so **they never require the edit lock**.

**The roll-back confirm stays exactly as drawn** (S8e): "Your live site switches to v4 instantly. v5
stays in history — nothing is lost."

> **A defect in the PRD, closed by this pass.** Pinning was decided by the owner on 2026-08-21 and
> lived only in `BACKUP-GATE.md`; `prd.md` carried no requirement for it, so a story written from the
> PRD alone would have built a history with no pin control. **FR-J7 now carries all three rules.**
> This is propagation of an existing decision, not a new one (`reconcile-designs-decisions.md` §A11).

**Partial success — FR-J8, a state nobody had drawn until D2e and D2d.** Surface: **Partial
Success**, in the Deploy Wizard (D2e) and as a history row (D2d). Upload succeeded, activation failed. **This is a partial success,
not a failure**, and six things follow:

1. **The artifact is retained** like any successful compile and appears in history without an active
   badge.
2. **The theme name freezes**, because the name is claimed on the site the moment a theme lands
   there.
3. **The drift baseline does not move** — FR-J16 compares against what Inflozo last put **live**.
4. **"Never leaves a partially active theme" is unaffected** — the site's active theme is still the
   previous one, untouched.
5. **The user is told plainly: "Your theme is on your site but isn't live yet."** With a re-activate
   action, because "failed" would be wrong and silence would be worse.
6. **It sends no deploy-failure email.** The theme uploaded, the user is in the product looking at
   the result, and the state is recoverable in one click.

---

## Appendix A — Claude Design prompts

**A1–A6 drew surfaces that did not exist** · **A7 corrected existing frames** — the ones whose
mechanism changed, whose copy states a Ghost fact wrongly, or whose accessibility defect lives in the
frame's own markup or tokens; its numbered items are the list · **A8 drew the editor below 1440 and
the affordances the accessibility floor needs** · **A9 corrected what the first 2026-09-04 export got
wrong — run and landed the same day.** The `### A` headings are the count.
Each is self-contained, names the frame it inherits from, and carries the warning below because a
session that hand-edits a frame hits it every time.

> **Run, and landed.** Both sessions ran on 2026-09-04 — A7 with A8, then A1 to A6 — and one export
> of the whole project replaced the repository's copy the same day
> (`design/claude-design-export/Inflozo/`; the previous export is kept beside it as `InflozoOld/`).
> Seven canvases are new — **D1 First-Deploy Gates · D2 Deploy History Completed · D3 The Drift
> Report · D4 Dashboard Sheets and Blocks · D5 Canvas Markers and Template Switcher · D6 Theme
> Settings Completed · D8 Editor Below 1440** (no D7: A7 corrected frames that exist) — and
> twenty-seven frames changed. What landed, item by item with the strings, is
> `reconcile-designs-decisions.md` §A15; what did not became **A9** below, which ran the same day and landed (§A15, "A9 landed"). **A1–A8 stay exactly as they
> were run: they are the record of what was asked.**

> **A8 exists because this pass asserted something the export does not draw**, and found it in its
> own stress test rather than downstream. R-76 says the editor is a **desktop and tablet** surface —
> and **no frame draws it at 834**, only at 1440. The accessibility floor then widened the gap: an
> editor that must hold at 200% browser zoom has to work at roughly 720 CSS px on a desktop display.
> Both are layouts described in prose that nobody has drawn, which is exactly the failure R-74
> exists to prevent, so they went back to Claude Design like every other undrawn surface — and came back as D8a and D8b.

**Running any of these produces a new export, which replaces the repository's copy.** Two edits
live in the repo rather than in Claude Design — the count-agnostic marketing copy and P0's per-prop
mark allowlist — and a re-export loses them by construction. **Follow the export runbook on the
build board afterwards:** `tools/reapply-export-edits.py`, then `tools/verify-design-pass.py`, then
the derivations, then `tools/doc-audit.py --check` twice.

**They can be run as two Claude Design sessions** — and were, on 2026-09-04 — **A7 together with A8** (both correct or extend
the editor's existing frames and share the focus-ring token), then **A1 to A6** — and the export
runbook above runs **once, after the last session** — one export of the whole project, dropped into the export directory, is enough; nothing in the repository needs the export between the two sessions, and the runbook is the same work however many prompts preceded it.

Every prompt in this appendix ends with, and every session must observe:

> **A literal Ghost Handlebars expression must be written with zero-width entities. A bare
> `{{ … }}` is a Claude Design value hole and renders EMPTY.**

---

### A1 · The first-deploy gates

```
Add one canvas to the Inflozo design project: D1 · THE FIRST-DEPLOY GATES.
Three surfaces the deploy wizard shows only on the FIRST deploy to a given site.

INHERIT FROM: `S8 Deploy.dc.html` — the ship wizard. Use its numbered step rail, its step
card, its checked-row list (S8b) and its Back / primary button pair verbatim. Use the itemised
rows of `B Missing Surfaces.dc.html` B13a for the checklist. Tokens and components come from
`Calibration Set.dc.html` and `Editor Sidebar Kit.dc.html`. Do not invent a component.

THE RAIL GROWS. An ordinary deploy is 4 steps: Destination, Check, Ship, Live. The FIRST deploy
to a site is 6: Destination, Safety net, Backup, Check, Ship, Live. Draw the 6-step rail.

FRAME 1 — D1a · DESTINATION, FIRST DEPLOY (step 1 of 6), 1440.
S8a exactly as drawn, plus one row under the destination card: the theme that will be created,
in JetBrains Mono — `inflozo-orbit-weekly` — with one line of 11px helper text: "This name is
permanent for orbitweekly.com. Renaming the project later changes its name in Inflozo only."

FRAME 2 — D1b · SAFETY NET · THE OFFER (step 2 of 6), 1440.
Heading: "One more step unlocks a safety net". Body, verbatim: "A copy of your current theme
before we replace it, plus a check that nothing else has changed it."
Then, quieter, in ink-soft: this is a Staff Access Token from the site Owner or an Administrator —
every staff user has one on their own profile, and an Administrator's is enough — and it is a
full-Administrator credential — say so plainly, do not soften it. A mono input for the token, a screenshotted Ghost Admin step beside it in the S2b·1 style.
TWO PLAIN BUTTONS, side by side, the same weight: "Add the token" (primary ink) and "Not now"
(secondary surface + hairline). "Not now" is NOT a small link.

FRAME 3 — D1c · SAFETY NET · DECLINED (step 2 of 6), 1440.
The same card, after "Not now". It acknowledges ONCE and names exactly three costs as three
rows with icons: no copy of your current theme before we replace it · no check that the live
theme changed since we last shipped · routes.yaml uploads by hand, with a guided card.
One closing line: "You can add it any time from Manage keys." One button: "Continue".
Nothing here implies the user has done something wrong. It is never raised again.

FRAME 4 — D1d · BACKUP GATE · SELF-HOSTED (step 3 of 6), 1440.
This BLOCKS the deploy button. Reading order matters and is the design:
  (a) FIRST, the modest truth, in a bordered panel: "Inflozo writes exactly two things to your
      Ghost site: your theme, and routes.yaml. It never writes posts, pages, members, tags,
      settings or redirects."
  (b) THEN the recommendation with its reason: a full backup is still right, because a theme
      change is reversible only if you can put the old theme back.
  (c) THEN the shortcut, as a highlighted single checkbox row with a mono command:
      `ghost backup` — "one archive: content, members, every installed theme, images, files,
      media, routes and redirects." Checkbox label: "I have run ghost backup and saved the
      archive somewhere off the server." Ticking it checks every row below AND THE ROWS STAY
      VISIBLE, ticked, so the customer sees what they now hold.
  (d) THEN seven individual checkbox rows: Theme (marked "Inflozo replaces this", warning
      "the one thing that makes rollback possible") · routes.yaml (marked "Inflozo may
      overwrite this") · Content (warning "does NOT include your images") · Members ·
      Redirects · Images, files and media (warning "the gap most people miss") · Database.
      Each row DESCRIBES what to look for in Ghost Admin and links to Ghost's own help.
      DO NOT PRINT A GHOST ADMIN MENU PATH — Ghost 6 does not have the menus Ghost 5 has.
      DOWNLOADS (FR-J13): when the token was given at step 2, the Theme and routes.yaml rows each
      carry a secondary "Download" button — the file Inflozo fetched. When it was declined, NO
      download button anywhere on the gate; those two rows describe what to look for in Ghost
      Admin like the others. Draw D1d with the token given; D1e below with it declined.
  (e) LAST, separated by a rule, the master confirm, DISABLED: "I confirm I have a complete
      backup of my site and understand Inflozo will replace my theme." Under it, greyed, the
      deploy button, with a reason line naming how many rows remain.

FRAME 5 — D1e · BACKUP GATE · GHOST(PRO), detail at 940.
The same gate, with the `ghost backup` shortcut REPLACED by an honest block, in the sky
information style, NOT danger:
"On Ghost(Pro), themes, content, members, routes and redirects all download from Ghost Admin.
Images and media do not — Ghost Admin has no bulk export for them, and there is no server to
copy them from. Ghost's own documentation points you at your host's support for this.
Ghost(Pro) also takes its own platform backups; that is a Ghost service, not an Inflozo one,
and it is worth confirming with Ghost what it covers and how to request a restore."
Then, in ink, its own line: "This is not something Inflozo can fix, and we are not going to
pretend otherwise."

VOICE: short, warm, confident — but this canvas is a safety surface, so no wit anywhere on it.
COUNTS: never print a total of designs, categories or free designs.

A literal Ghost Handlebars expression must be written with zero-width entities. A bare
{{ … }} is a Claude Design value hole and renders EMPTY.
```

---

### A2 · Deploy history with pinning, and the partial success

```
Add one canvas to the Inflozo design project: D2 · DEPLOY HISTORY, COMPLETED.

INHERIT FROM: `S8 Deploy.dc.html` region S8e — the history drawer. Keep its drawer shape, its
version rows, its mono version chips, its Live badge, its "0 · 2" gscan chips, its by-line, its
Roll back buttons and its roll-back confirm modal EXACTLY. Tokens and components from
`Calibration Set.dc.html` and `Editor Sidebar Kit.dc.html`. Do not invent a component.

FRAME 1 — D2a · HISTORY WITH PINNING · PRO, 1440.
S8e's drawer, plus:
  - A PIN control on every row: a small outline pin icon button, 28px, in the row's right
    cluster beside Roll back. Pinned rows show it filled, in marigold, and the row takes a
    faint marigold-tint wash. Two of the ten rows are pinned.
  - ABOVE the version list, its own row, visually separated by a rule and NOT numbered as a
    version: THE ORIGINAL THEME. Label "Your original theme", the live theme's name and
    version in mono (`casper 5.9.4`), the date it was archived, and a "Restore original"
    button. A quiet line: "Kept outside your version limit. Ghost checks every theme on the
    way in, so a very old theme can be refused — we'll offer the zip if that happens."
  - The footer line stays and gains one sentence: "Pro keeps the last 10 versions. Free keeps
    the last 3. Older versions are removed, not hidden — an Inflozo theme can't be rebuilt
    later, so this is how far back you can go."

FRAME 2 — D2b · THE PIN REFUSAL, detail at 520.
The user clicks pin on the last unpinned row. A small popover anchored to that pin, in the
notice (marigold) banner style: "One version has to stay unpinned so your next deploy has
somewhere to go. Unpin another first." One button: "Got it". The pin stays UNfilled.
This is a refusal with a reason, never a greyed control and never a silent failure.

FRAME 3 — D2c · FREE PLAN, 1440.
The same drawer at three versions, one pinned, the original-theme row present. The limit line
is shown on Free too — never hidden as an upsell. There is no upgrade prompt in this drawer.

FRAME 4 — D2d · PARTIAL SUCCESS · THE ROW, detail at 620.
A version row with NO Live badge, carrying instead a sky-tinted chip reading "Uploaded, not
live" and a primary "Re-activate" button in place of Roll back. One helper line: "Your theme is
on your site but isn't live yet."

FRAME 5 — D2e · PARTIAL SUCCESS · IN THE WIZARD, 1440.
The final step after an upload that succeeded and an activation that FAILED. NOT the S8d′ failure
treatment — sky, not danger. Heading: "Your theme is on your site but isn't live yet." Body:
"v5 uploaded cleanly. Ghost didn't switch to it, so orbitweekly.com is still serving v4 — nothing
on your site changed." The step rail shows Ship complete and Live incomplete. Buttons:
"Re-activate v5" (primary) and "Leave it for now" (secondary). NO CONFETTI.

FRAME 6 — D2f · DEPLOY ONLY · THE OTHER ENDING, 1440.
The SAME card, reached deliberately: the user picked "Deploy only" at step 1. Same sky treatment,
same rail state, same two buttons — only the sentence changes, because only the cause changed.
Heading: "Uploaded. Not live yet." Body: "v5 is on orbitweekly.com and v4 is still what readers
see. Make it live whenever you are ready." NO CONFETTI HERE EITHER: the one confetti moment is the
first deploy that makes the site LIVE, and this one deliberately did not.
Draw these two side by side, because they are ONE state with two causes — a reader of the frames
should see at once that the history row for both is identical.

COUNTS: 10 and 3 stored versions ARE product limits and MUST be printed. Never print a total of
designs, categories or free designs.

A literal Ghost Handlebars expression must be written with zero-width entities. A bare
{{ … }} is a Claude Design value hole and renders EMPTY.
```

---

### A3 · The drift report

```
Add one canvas to the Inflozo design project: D3 · THE DRIFT REPORT.

INHERIT FROM: `S8 Deploy.dc.html` region S8b — the pre-flight check. Keep its step card, its
checked-row list, its expandable warning row and its Back / primary button pair. For the file
list, reuse the LAYERS ROW pattern from `B Missing Surfaces.dc.html` B7 — grip removed, name
and mini-thumb kept. Tokens from `Calibration Set.dc.html` and `Editor Sidebar Kit.dc.html`.

WHAT THIS IS. Before every deploy AFTER the first to a given site, Inflozo reads the live theme
and compares what it finds against what it last deployed there. If anything differs, THE DEPLOY
STOPS and shows exactly what changed. It is skipped on the first deploy, and it FAILS OPEN.

FRAME 1 — D3a · DRIFT FOUND · THE DEPLOY STOPS, 1440.
Heading: "Something changed on your site since we last shipped." Body: "We compare what's live
against what we put there. These files are different — someone edited the theme in Ghost, or
another tool did."
A list, one row per file, grouped as Changed / Added / Removed. CRITICAL: each row is named by
THE USER'S OWN LAYER NAME wherever the file is a section partial — "Home hero", "Latest issues",
"Three Column footer" — with the raw filename only as small mono text beneath it. Never a raw
path as the primary label.
Two actions: "Download the live theme first" (secondary, and it is offered before the
destructive one) and "Overwrite and ship anyway" (primary ink, NOT danger — this is a deliberate
choice, not an accident). Plus "Cancel".

FRAME 2 — D3b · COULD NOT VERIFY · IT PROCEEDS, detail at 720.
A single sky-tinted information row inside the pre-flight list, NOT a blocking state:
"Couldn't check whether your live theme changed." Body: "We need a Staff Access Token from the site Owner or an Administrator
to read the live theme, and this project doesn't have one. Shipping anyway." A quiet
"Add the token" link. THE DEPLOY CONTINUES — this row sits among the passing checks and does not
stop anything. Drift is never asserted without two manifests in hand.

FRAME 3 — D3c · NO DRIFT, detail at 620.
One passing row in the S8b list, identical in weight to "Ghost 6.x compatible": "Nothing changed
on your site since v4 — pass".

NOTE FOR THE SESSION: a layer RENAME produces no drift at all, so the list never shows one.
Nothing on the live site changed, only a filename Inflozo chose.

COUNTS: never print a total of designs, categories or free designs.

A literal Ghost Handlebars expression must be written with zero-width entities. A bare
{{ … }} is a Claude Design value hole and renders EMPTY.
```

---

### A4 · Dashboard sheets and blocks

```
Add one canvas to the Inflozo design project: D4 · DASHBOARD SHEETS AND BLOCKS.

INHERIT FROM: `S3 Dashboard.dc.html` (the shell, the project cards, the ⋯ menus),
`S2 Onboarding.dc.html` S2a (the three-door card layout) and `B Missing Surfaces.dc.html` B23a
(the starter grid) and B13a (the itemised-rows sheet over a dimmed surface). Tokens and
components from `Calibration Set.dc.html` and `Editor Sidebar Kit.dc.html`.

FRAME 1 — D4a · NEW PROJECT SHEET, 1440.
Opens from the Dashboard's "New project" button, over a dimmed dashboard. FOUR doors, drawn as
S2a's radio-card rows, each with one line of consequence:
  - "Start from a starter" — "Ten full sites, ready to wear your brand." (opens the starter
    chooser, B23a)
  - "Blank canvas" — "An empty page and every design."
  - "Duplicate an existing project" — with a select showing the user's projects
  - "Redesign one of my sites" — "We look at your posts and suggest whole-site designs."
    GREYED, with the reason shown, when no site is connected: "Connect a Ghost site first."
Below: a Style Pack row — the pack cell component from the Editor Sidebar Kit — with a line
saying it can be changed any time. Buttons: "Cancel" and "Create project".

FRAME 2 — D4b · NEW PROJECT · FREE, AT THE CAP, detail at 720.
The same sheet on a Free account that already has one project. The four doors are still drawn
and are GREYED WITH THE REASON, not hidden. Under them, the upgrade row: "Free includes 1
project. Pro gives you 25." with "Go Pro — $15/mo". Nothing is deleted and nothing is hidden.

FRAME 3 — D4c · OVER-LIMIT SHEET, 1440.
Fires when a Pro account has become Free and is over its limits. Over a dimmed dashboard.
Heading: "Let's get you back under the Free limits." First line, before anything else:
"Nothing has been deleted, and nothing will be. Your live sites are untouched."
Then FOUR itemised rows in B13a's row style — each naming what is over, by how much, and the
one action that fixes it:
  - Projects · 6 of 1 · "Choose which one stays editable"
  - Connected sites · 2 of 1 · "Disconnect one"
  - Assets · 312 MB of 100 MB · "Delete some files"
  - Stored versions · 8 of 3 · "Nothing to do — we keep these, we just won't add more"
    (this row is informational and has no action)
Footer, quiet: "Rollback, restore and export keep working the whole time."
Buttons: "Go Pro — $15/mo" (marigold) and "Sort it out myself" (secondary).

FRAME 4 — D4d · WHICH PROJECT STAYS EDITABLE, detail at 720.
A radio list of the six projects, each with its site badge and last-updated date, the most
recently updated PRE-SELECTED. One line: "The other five stay viewable and exportable — you
just can't edit them until you're on Pro." Button: "Keep this one editable".

FRAME 5 — D4e · A READ-ONLY PROJECT, 1440.
The S4 editor shell with the read-only treatment from B5a: canvas fully legible, sidebar dimmed
to 55%, controls visible but inert. The bar reads: "Read-only — this project is over your Free
plan's limit." Two buttons in the bar: "Make this the editable one" and "Export theme zip".
Export is NOT disabled. Read-only means not editable; it never means locked in.

FRAME 6 — D4f · SMALL SCREEN NOTICE, 390.
What a user sees when they open a project on a phone. NOT an error page.
IT FIRES ON A COARSE POINTER AT A SMALL VIEWPORT, NOT ON WIDTH ALONE — a desktop user at 200%
browser zoom sees a ~720px viewport and must get the EDITOR, not this card (prompt A8 draws that).
Caption the frame with that condition so nobody builds it as a width test. A calm centred card:
"The editor needs a bigger screen." Body: "Dragging sections and a 300-pixel control panel don't
fit on a phone yet. Open this project on a laptop or tablet." Then, as a list of real
affordances that DO work here: the project's deploy history with a one-tap "Roll back to v4",
"Your sites" and "Billing". Ink line drawing with one coral accent shape, per the empty-state
illustration rule.

COUNTS: 1 project, 25 projects, 1 site, 10 sites, 100 MB, 5 GB, 10 MB per file, 3 and 10 stored
versions ARE product limits and MUST be printed. Never print a total of designs, categories or
free designs.

A literal Ghost Handlebars expression must be written with zero-width entities. A bare
{{ … }} is a Claude Design value hole and renders EMPTY.
```

---

### A5 · Editor canvas markers and the template switcher

```
Add one canvas to the Inflozo design project: D5 · CANVAS MARKERS AND THE TEMPLATE SWITCHER.
Six small things the editor shows constantly and that were never drawn.

INHERIT FROM: `S4 Editor.dc.html` (the top bar, the template dropdown, the canvas),
`B Missing Surfaces.dc.html` B7 (Layers), B9 (the content-source pill) and B10 (the Pro mark),
and `P0-0 Greyed Control Pattern.dc.html`. Tokens and components from `Calibration Set.dc.html`
and `Editor Sidebar Kit.dc.html`.

THE PILL SPEC IS SHARED AND ALREADY SET (B9/B10's note): ink pill floating over the canvas,
10px radius, 4px padding, lg shadow, 30px targets, no coral.

FRAME 1 — D5a · AUTO-GENERATED MARKER, 1440.
An untouched Tag archive canvas rendering its default stack. TWO markers, and they are the same
sentence in two places: a chip in the top bar beside the template name, and a row at the head of
the Layers panel. Both read: "Auto-generated — edit anything to make it yours". Informational,
never apologetic — the canvas is telling the user what they are looking at, not excusing it.
Both vanish on the first edit.

FRAME 2 — D5b · TEMPLATE SWITCHER, COMPLETE, detail at 520.
S4a's template dropdown, redrawn with the full set: Home · Post · Page · Tag · Author ·
Membership (as a GROUP with three children: Signup, Signin, Member home) · 404 · Private (shown
ONLY when a Private Site Gate section has been designed) · then a rule · then custom templates
created in the Routes Manager · then "+ New template". Templates that have never been designed
show a small hollow dot LABELLED "Auto-generated"; designed ones show a filled one with no label.
The current one takes the check. THE WORD IS NOT OPTIONAL: a shape alone is the same failure as a
colour alone, and this menu is where a user decides which template to open.

FRAME 3 — D5c · MAIN FEED MARKER AND REASSIGN, 1440.
An Author archive with two feed sections. The designated main feed carries a small mono chip on
its canvas outline reading "MAIN FEED", and its Layers row carries the same chip. The section's
control sidebar shows, where a Count control would be on any other feed: a GREYED count with the
reason — "This feed is sized by your theme's Posts per page. Change it in Theme settings." —
plus a working link to Theme Settings. Below it, the Pagination control, which ONLY the main
feed has. On the second feed's row, a "Make this the main feed" item in its ⋯ menu.

FRAME 4 — D5d · PAGE 2 PREVIEW, 1440.
The same archive previewed on page 2. An ink pill at the top of the canvas reading "Page 2" with
a "Back to page 1" action beside it. The pagination treatment at the foot shows its full range —
a previous link, numbers, and a next link — which is the only state in which a numbered treatment
shows what it is. Reached from the Pagination control, not from a keyboard shortcut.

FRAME 5 — D5e · PREVIEW SUBJECT PICKER, detail at 520.
B9's content-source pill, opened. It has three parts: the SOURCE ("Orbit Weekly" / "Sample
content"), then a rule, then THE SUBJECT — a searchable list of the connected site's posts for
a Post canvas, showing title, date and — for those with a feature image — a small marker WITH THE
WORDS "has image" beside it, never the marker alone. The current one is checked. At the top of that list, always: "Style-guide article — the one every post
design is designed against", checked by default. One helper line: "This canvas renders one post.
Which one changes what you see, because a post with a feature image and one without are
different shapes."

FRAME 6 — D5f · EMPTY TEMPLATE WARNING, detail at 620.
Fires when the user removes the LAST section from a designed custom template. A notice-style
(marigold) confirm, not danger: "Remove the last section from Membership?" Body: "This template
stops shipping. Any Ghost page still pointing at custom-membership.hbs will still load — it will
just wear your ordinary page design instead. Ghost won't warn anyone, which is why we are."
Buttons: "Remove it" and "Keep it".

COUNTS: never print a total of designs, categories or free designs.

A literal Ghost Handlebars expression must be written with zero-width entities. A bare
{{ … }} is a Claude Design value hole and renders EMPTY.
```

---

### A6 · Theme Settings, completed

```
Add one canvas to the Inflozo design project: D6 · THEME SETTINGS, COMPLETED.

INHERIT FROM: `B Missing Surfaces.dc.html` B17 — theme settings with the custom-settings
builder. Keep its two-column shape, its left settings rail, its padlocked "Ghost owns this"
rows, its "from Ghost" marks and its right-hand builder EXACTLY. Tokens and components from
`Calibration Set.dc.html` and `Editor Sidebar Kit.dc.html`.

FOUR CHANGES TO THE LEFT COLUMN, and one of them is the surface's own primary value.

1. POSTS PER PAGE, and it goes FIRST, above Site basics. A stepper (tabular numerals), default
   12, with helper text: "How many posts your archives show before paginating. Your theme owns
   this — Ghost has no setting for it." This is the control every other surface in the product
   links TO. Never link a user into Ghost Admin looking for it; it does not exist there.

2. THE LOGO ROW LOSES ITS "REPLACE" BUTTON. Inflozo reads Ghost's logo and never writes it.
   Draw it padlocked like the site title, showing the file and its size, with a link out:
   "Change this in Ghost". Same treatment as the accent row already has.

3. THE DARK MODE ROW IS REPLACED. What is drawn ("Follows the reader's system setting") is the
   VISITOR's moon toggle, a different thing entirely. Draw instead a two-option segmented
   control labelled "This project": "Light only" | "Light + Dark", with "Light + Dark" selected
   and helper text: "Every Style Pack ships a hand-paired dark palette, so dark is already paid
   for." Beneath it, a secondary row: "Clear dark overrides" with a count — "3 sections carry a
   dark override" — and a small moon badge, which is the same 12px badge that marks an
   overridden control in the sidebar. WHEREVER THAT BADGE APPEARS IT CARRIES AN ACCESSIBLE
   LABEL READING "Dark override" — a 12px shape is not a signal on its own. On a Light-only project the row greys with the reason.

4. A NEW "CREDITS" GROUP. One toggle: "Show 'Built with Inflozo'" — on, with helper text
   naming both places it appears: the theme footer and the README. On PRO it is a working
   toggle. On FREE draw the SAME row GREYED WITH THE REASON — "Credits stay on with the Free
   plan" — plus a "Go Pro" link. Greyed, never hidden: this exists here and is unavailable now.

ONE CHANGE TO THE METER: it reads "3 OF 17", not "3 OF 20". Ghost allows twenty custom settings
per theme and three of them are the dark-mode built-ins that every Inflozo project declares.
Helper text says so in one line.

FOUR ADDITIONS TO THE BUILDER (right column), each a row in the promote form:
  - "Group in Ghost" — a named select: Site wide / Homepage / Post.
  - "Only show when" — an optional visibility condition, using the condition row component
    from the Editor Sidebar Kit (field · operator · value).
  - A confirm state for promoting a TEXT prop: "Ghost's own settings are plain text, so bold,
    italic, underline and links will be removed from this field while it stays promoted."
  - A quiet permanent notice under the meter: "Keys freeze once you deploy or export — pick
    them like you mean it." And, on a promoted accent, a warning that switching Style Packs
    changes what that setting is pointing at.

FRAME 1 — D6a · THEME SETTINGS, PRO, 1440 — all of the above.
FRAME 2 — D6b · THEME SETTINGS, FREE, detail at 720 — the credits row greyed with its reason.
FRAME 3 — D6c · THE TEXT-PROP PROMOTE CONFIRM, detail at 520.

COUNTS: 17 and 20 here are Ghost's custom-setting limits and MUST be printed. Never print a
total of designs, categories or free designs.

A literal Ghost Handlebars expression must be written with zero-width entities. A bare
{{ … }} is a Claude Design value hole and renders EMPTY.
```

---

### A7 · The existing frames that need correcting

```
Correct the existing frames listed below in the Inflozo design project. THE VISUAL TREATMENT OF
EACH IS RIGHT AND STAYS — same components, same layout, same colour, same density. Only what they
SAY, what they DO, and what assistive technology is TOLD changes. Do not redesign any of them.
Items 1–6 are mechanism corrections. The items after them correct copy that states a Ghost fact
wrongly, fixture drift, or an accessibility defect that lives in the frame's own markup or tokens
(owner, 2026-09-03: an accessibility fix must not change the design, so these are attribute and
token corrections, never a redraw).

1. `B Missing Surfaces.dc.html` B19 · MEMBERSHIP PAGE BINDING.
   The mechanism drawn is one the product forbids. The file is `custom-membership.hbs`, NOT
   `page-membership.hbs` — a slug-matched template detaches the moment the user retitles the
   page and overrides their explicit choice, so Inflozo never emits one.
   The three steps become: (1) "Ship this template. It arrives in Ghost as a page template."
   with `custom-membership.hbs` in mono AND the label Ghost will show for it: "Membership".
   (2) "In Ghost, open a page and pick Membership from the Template dropdown." (3) "That's it —
   Ghost remembers your choice on that page, even if you rename or re-slug it later."
   DELETE THE "MATCHED" BADGE. Inflozo cannot see which template a Ghost page chose. Replace the
   "If the slug does not match" block with, verbatim: "We can't see whether you did this.
   Ghost doesn't tell us which template a page picked, so tick it off yourself when it's done."
   Add a TICKABLE DONE STATE to the row, and draw the surface as a CHECKLIST with THREE rows
   (three emitted templates: Membership, Signin, Member home), not one.
   KEEP the right-hand Ghost facsimile panel — it is what makes this usable — redrawn to show
   Ghost's TEMPLATE DROPDOWN open with "Membership" in it, rather than the URL field.

2. B12a/B12b · SNAPSHOT GATE.
   B12a: delete "and happens on every deploy" — it happens at the FIRST upload to a site only.
   Delete "Snapshots count towards your history — Free keeps 3, Pro keeps 10." The snapshot is
   exempt from the history limit; replace with "Kept outside your version limit."
   B12b: the reason drawn is wrong and sends people to fix something that cannot be fixed.
   Replace the body with: "Reading your live theme needs a Staff Access Token from the site Owner or an Administrator,
   and this project doesn't have one. That's how Ghost works on every version and every host —
   there's no permission to switch on." Then the reassurance: "Ghost keeps your previous theme
   under Settings → Design, so you can put it back yourself if you need to." Buttons become
   "Add the token", "Deploy without a snapshot", "Cancel". Delete "Check the key".

3. B16 · ROUTES FALLBACK CARD.
   Replace "Your integration key is missing the settings permission" with "Uploading a routing
   file needs a Staff Access Token from the site Owner or an Administrator, and this project doesn't have one."
   Delete "Fix the key instead" → "Add the token instead"; its footnote becomes "Adding the
   token makes this automatic from now on."
   DELETE THE HARD-CODED "Settings → Labs" PATH. Ghost 6 has no Labs page. Replace step 2 with
   a description of what to look for plus a link out: "In Ghost, find the routes upload for
   your version" + "Show me where ↗".

4. B13a · PRO BLOCKING SHEET.
   Two remedies are drawn; four exist. Add "Remove it" as a third action on every row — some
   sections have no free design to swap to. Add a fourth row TYPE for non-placeable treatments
   (the paywall design, a card treatment, a pagination style): these are chosen, not placed, so
   their action is "Revert to the free one", and the row names where it reverts.
   DELETE the note reading "The swap for suggestions are per-design pairings someone has to
   author — every Pro design needs a named Free fallback". No pairing table exists or is needed:
   swapping goes through Shuffle, which offers any free design in that category's ring.

5. B24 · PAST-DUE GRACE BANNER.
   The consequence drawn is wrong and it is the frightening half. Replace "after that, Pro
   designs stop rendering and your sites fall back to their Free replacements" with: "After
   that you go back to Free. Your live sites are never touched — what's shipped stays shipped.
   You'd just need to sort out anything over the Free limits before you ship again."

6. B11a/B11b · DEVICE PREVIEW.
   Delete the user-operated Zoom control ("Fit / 55%"). There is no user zoom in this product;
   the only scale is fit-to-screen and it is automatic. KEEP the mono chip that states both
   facts — "VIEWPORT 390 × 844 · SHOWN AT 55%" — and keep the Desktop / Tablet / Mobile
   segmented control, which is the only thing the user operates here.

7. `Calibration Set.dc.html` · THE FOCUS-RING TOKEN.
   The keyboard focus indicator is a 2px coral ring at 40% — rgba(255,89,65,.4) — which composites
   to 1.55:1 on paper #F7F5F2 and 1.59:1 on white; WCAG 2.1 1.4.11 needs 3:1, and even solid
   coral #FF5941 reaches only 2.86:1 on paper. Replace the token with ONE ring that meets 3:1 on
   paper AND on white — 2px solid coral-text #C2381F (7.9:1 on paper) or 2px ink #1C1B1A — and
   use it for every keyboard-focus state in every frame (the routes-manager inputs' solid-coral
   style-focus border included). Keep the 40% coral wash for hover and selection only. A8
   inherits this token.

8. `S4 Editor` · `S6 Variant Shuffle` · `S7 Style Packs` · ACCESSIBLE NAMES.
   Every icon-only button gets an aria-label: the ▾ half of the "Ship it" split button
   ("Deploy options"), the ⋯ menus, the eye toggles, every close ×. Attributes only — nothing
   visible changes.

9. `S4` · `S7` · `S9 Routes` · `S12 Billing` · `S1` · `S2` · `S11` · `S13` · LABELS.
   Every input carries a <label for> or an sr-only label: the hero title input (S4c, S6), the
   pack-name and hex fields in S7c ("Tangerine", "#C24E1E"), the route paths in S9a
   ("/travel/", "/reading-list/"), the typed confirm in S12c ("delete my acc"), the assets
   search ("Search assets…"). The <label> elements drawn as captions with no control — in S1, S2b,
   S7, S9, S11d, S12 and S13 — each get a `for` or become plain text. Every scrolling list (the
   Section Picker's grid in S5a/S5c, the assets grid) gets tabindex="0". Attributes only.

10. `Calibration Set.dc.html` · PLACEHOLDER AND HINT COLOUR.
    Placeholder and hint text is set in --ink-faint #A8A29A: 2.53:1 on white ("Search assets…",
    "Choose…") and 2.32:1 on paper ("ALL DESIGNS"). Make it a Calibration Set rule that placeholder
    and hint text use --ink-soft-aa #6B6459 (5.85:1), and re-tint the mono line numbers in S9's
    YAML pane from #C9C2B8 (1.76:1) to the same AA value. This is the one visible token change
    in this prompt, and it is a text-colour token, not a layout.

11. `S8 Deploy` S8d′ · `S11 Sites` S11a · A FAILURE GHOST NEVER PRODUCES.
    "Ghost said no — your Admin key expired." and the chip "Admin key expired Aug 15": Admin API
    keys never expire (Ghost's api_keys table has no expiry column; docs.ghost.org/admin-api: "You
    can regenerate the Admin API key any time"). What Ghost returns for a regenerated or deleted
    key is 401 "Unknown Admin API Key" — executed on Ghost 5.130.6 and 6.58.0, 2026-09-03,
    MEASUREMENTS §37. S8d′'s sentence becomes: "Ghost said no — this Admin API key no longer works.
    It was regenerated or removed in Ghost Admin. Paste the new key." with the Reconnect action.
    S11a's chip becomes "Key regenerated Aug 15". Same voice, a cause that exists.
    AMENDED 2026-09-09 (ruling R-100, Story 3.6's review): that 401 has a THIRD cause — a key issued
    by a different Ghost install — because `api_keys` carries no domain or install column, so Ghost
    answers the same 401 to all three (executed T3→T1 and T1→T3, with T1→T1 200 as the control;
    MEASUREMENTS §37). A sentence that names ONE of the three as the cause is the same mistake as
    "expired", one step smaller. The shipped copy therefore says "this Admin API key doesn't match
    your site" and lets the customer's own next step be the same for every cause.

12. `C Post Body` C3b · THE PAYWALL EMPTY STATE.
    Delete "Ghost has no paid tiers … so this block never renders — a members-only post shows the
    sign-in prompt instead" and "with no paid tier, Ghost's paywall never renders at all". Ghost's
    paywall renders on EVERY gated post — members-only, paid or tier-gated — whether or not a paid
    tier exists: its content-cta.hbs carries its own visibility="members" branch (VERIFY-AT-BUILD
    item 11, executed). The empty state's condition becomes "members are disabled on this site"
    and its copy names that setting and the Ghost Admin toggle to look for. The shape stays.

13. `S8 Deploy` S8c · CANCEL DURING UPLOAD.
    Delete the Cancel action from the "Uploading to Ghost" card, or grey it with its reason in the
    disabled-control pattern. FR-J8: once uploading starts the deploy runs to completion. Keep
    the card, its progress bar and the Activating row.

14. `S7 Style Packs` S7c · THE THIRD SWATCH ROW.
    The Edit pack dialog stacks a third row labelled "Dark" with four swatches
    (Base/Surface/Accent/Contrast) under the two correct seven-swatch rows, against its own
    "Seven roles per mode" copy. Delete the third row. (S7d's four-swatch block is different: it
    anchors the colour-picker popover and stays.)

15. `S14 Editor Cards` S14a · GHOST'S OWN CARD ORDER.
    The dropdown claims Ghost's order and is not it. Reorder to the editor's own menu, read from
    the koenig-lexical bundle on 5.130.6 and 6.58.0 (identical): Image, Markdown, HTML, Gallery,
    Divider, Bookmark, Email content, Email call to action, Public preview, Button, Callout, GIF,
    Toggle, Video, Audio, File, Product, Header, Embed. Slot 8 is "Email call to action" — an
    email-only card that renders nothing on the web (MEASUREMENTS §35b), so it has no panel and
    that is where the NO COLOUR CTLS mark belongs. Keep a separate "Call to action" entry for the
    web card, which does get its panel. Video before Audio.

16. EVERY APP FRAME · ONE FIXTURE IDENTITY.
    The session belongs to one person: Maya Chen · maya@orbitweekly.com · orbitweekly.com. Replace
    you@example.com in the account chip (S4c, S6, S7, C4); replace you@yoursite.com in S1a's
    placeholder — yoursite.com is a registered, parked domain — with you@example.com; and replace
    the real third-party sites with fixtures: kickscondor.com in C4's style-guide citation, and
    fieldnotes.ghost.io / sam@fieldnotes.blog on S3a and S11a (both resolve to live sites). Only
    orbitweekly.com, inflozo.app and RFC 2606 example.* domains may appear anywhere.

17. `S5 Section Picker` S5a · S5c · THE HEROES COUNT.
    S5a's rail reads "Heroes 28 designs", S5c reads "18 designs", and B1a's counter is "Design 7
    of 18". Make S5a agree with the other two. A per-category count is a runtime figure and is
    allowed; a library total still is not.

18. `S4 Editor` S4d · THREE MEMBER STATES.
    Replace the tier rows (Orbit Supporter $5/mo · Orbit Patron $12/mo · Founding $120/yr) with
    FR-D16's three: Logged out · Free member · Paid member. Keep the toggle and the panel. Add the
    unviewed-states marker beside the toggle and the "Gated content — shown with sample text"
    indicator on a gated body — neither frame draws them.

19. `B Missing Surfaces` B23a · THE STARTER ROSTER.
    Replace the invented names with Appendix E's ten, each with its pack: Aurora · Gazette ·
    Signal · Foundry · Quiet · Pulse · Bloom · Chapter · Ledger · Studio. Only Quiet and Ledger
    carry the Free mark. Delete "Cohort — tiers and member pages". The grid, the category filter,
    the free filter, the "swap or upgrade" marks and the "Start empty" escape all stay.

20. `S11 Sites` S11c · `S12 Billing` S12a, S12b · `M5 Pricing` · THE PLAN LIMITS.
    Appendix F.1 is the only definition. Free: 1 project · 1 site · 100 MB storage · history
    last 3. Pro: 25 projects · 10 sites · 5 GB · history last 10 per project. 10 MB per upload on
    both. Replace the drawn figures ("up to 3", "unlimited", "full", "1 / 3", "Last 2 / Full")
    with these. S10b's "up to 30 MB each" is A8 FRAME 4's.

21. `S4 Editor` S4c · `S6 Variant Shuffle` · "Try a variant" → "Try a design".
    Appendix H: the unit is a design; only the feature name "Variant Shuffle" keeps the old word.

DO NOT TOUCH THE FRAME CAPTIONS. Each frame carries a settings snapshot in its caption —
"drawn at padding Comfortable 96, ground Background, actions Both". Those are RETIRED control
names and they stay exactly as they are: a caption records how a frame was drawn on the day it was
drawn, and correcting one value inside it produces a caption that reads as current and is not
(ruling R-73). Change the surfaces' own copy and behaviour, nothing else.

VOICE: PRD Appendix H. Errors are human and name the fix. Billing stays serious.
COUNTS: never print a total of designs, categories or free designs.

A literal Ghost Handlebars expression must be written with zero-width entities. A bare
{{ … }} is a Claude Design value hole and renders EMPTY.
```

---

---

### A8 · The editor below 1440, and the affordances the floor needs

```
Add one canvas to the Inflozo design project: D8 · THE EDITOR BELOW 1440, AND THE AFFORDANCES
THE ACCESSIBILITY FLOOR NEEDS. Run with A7: the focus ring drawn here is A7 item 7's token.

INHERIT FROM: `S4 Editor.dc.html` (the whole editor shell — top bar, Layers, canvas, Controls
sidebar), `B Missing Surfaces.dc.html` B7 (Layers rows and their three states), B13a (a confirm
over a dimmed surface) and `S10 Assets.dc.html` (the drop zone). Tokens and components from
`Calibration Set.dc.html` and `Editor Sidebar Kit.dc.html`. DO NOT INVENT A COMPONENT — every
frame here is the existing editor rearranged or an existing control gaining a state.

WHY THIS CANVAS EXISTS. The editor is drawn at 1440 and at no other width. Two things need it
narrower and neither is a phone: TABLET (834, touch) is in scope by the owner's ruling, and a
DESKTOP USER AT 200% BROWSER ZOOM sees roughly a 720 CSS px viewport — throwing them out would
fail WCAG 1.4.4, so the editor has to hold. Below that the product shows a designed notice
instead, which is drawn separately (prompt A4, frame D4f).

FRAME 1 — D8a · THE EDITOR AT 834 · TABLET, TOUCH, 834 × 1112.
The same four parts, rearranged rather than redesigned:
  - The Layers panel COLLAPSES TO AN ICON RAIL at the left edge — the layer mini-thumbnails
    only, no names — and expands as an overlay over the canvas when tapped. `L` still toggles it.
  - The Controls sidebar becomes an OVERLAY PANEL anchored to the right edge, over the canvas,
    at its usual 280–320px, with a scrim behind it. It opens on selection and has a close
    affordance. The canvas does not resize under it.
  - The top bar keeps the template switcher, View as and Ship it; anything that does not fit
    moves into a single overflow menu rather than shrinking.
  - EVERY TARGET IS AT LEAST 44px. That is the one thing this width changes about the controls
    themselves, and it is why the frame is needed rather than assumed.

FRAME 2 — D8b · THE EDITOR AT 720 · A DESKTOP AT 200% ZOOM, 720 × 900.
The SAME collapse as D8a — icon rail, overlay sidebar — but with a fine pointer, so targets stay
at their desktop sizes and hover affordances still work. Caption it explicitly as "1440 display
at 200% browser zoom", because a reader will otherwise assume it is a small device and apply the
touch rules. This frame is what proves the notice does not fire here.

FRAME 3 — D8c · THE SKIP LINK, detail at 620.
Two states of ONE element: hidden at rest, and visible on keyboard focus. It is the FIRST
focusable thing in the editor shell, sitting over the top bar's left edge — a surface pill,
12 radius, sm shadow, the focus ring as A7 item 7 corrects it (3:1, never the 40% wash) —
reading "Skip the canvas". Draw the focused state with
the ring, and a second, dimmed copy showing where it sits when nobody has focused it.
WHY: the canvas renders the USER'S OWN SITE, so tabbing through it means tabbing through every
link that site emits — dozens of stops before the sidebar.

FRAME 4 — D8d · THE ASSETS DROP ZONE, WITH A KEYBOARD PATH, detail at 720.
`S10 Assets`'s drop zone as drawn, plus a secondary button inside it reading "Choose files",
below the existing "Drop images — we'll optimize them ✨" line and above "JPG, PNG, SVG or WebP".
A drop zone with no button cannot be reached by keyboard at all. Keep the sparkle and the tone.
NOTE FOR THE SESSION: the size line on that frame currently reads "up to 30 MB each" and the
product limit is 10 MB per file on BOTH plans — correct it to "up to 10 MB each" while you are
in there.

FRAME 5 — D8e · A LAYERS ROW, FOCUSED, detail at 520.
B7's layers rows currently have three states: rest, hover (a wash), selected (coral tint). Draw
the FOURTH: keyboard focus — the focus-ring token AS A7 ITEM 7 CORRECTS IT (a 2px ring at 3:1 or
better, NOT the 40% coral wash, which stays the hover/selection wash), drawn OVER the row's
existing state so focused-and-selected is legible as both. Show three rows: rest+focused, hover, selected+focused.
Beside them, a small caption naming the keys, in the kbd-chip style: ↑ ↓ move focus, ⌥↑ ⌥↓ move
the section itself.

FRAME 6 — D8f · A DESTRUCTIVE CONFIRM, OPENED, detail at 620.
Any of the product's irreversible confirms — use "Take over from Rosa?" (B5c) as the subject.
Draw it AS IT OPENS: the focus ring is on the CANCELLING action ("Wait"), not on the danger-fill
button. This is a rule rather than a list — the same treatment governs Delete account, Roll back,
project delete, delete-in-use assets and "Overwrite and ship anyway" — so caption it as the rule.

FRAME 7 — D8g · SHIP IT FROM A READ-ONLY SESSION, detail at 620.
The fourth edit-lock state (F2), drawn on no frame today: a reader — someone else holds the lock —
presses Ship it or Export. Reuse B5c's shape exactly (a confirm over the dimmed editor, danger
fill, "Or message Rosa" escape). Heading: "Take over to ship?". Body, from the heartbeat count:
"7 unsynced edits exist in Rosa's browser and will be lost. We cannot retrieve them from here."
Two actions: "Take over and ship" (danger) · "Wait" — and focus opens on "Wait", per FRAME 6.

COUNTS: 10 MB per file is a PRODUCT LIMIT and must be printed. Never print a total of designs,
categories or free designs.

A literal Ghost Handlebars expression must be written with zero-width entities. A bare
{{ … }} is a Claude Design value hole and renders EMPTY.
```

### A9 · What the 2026-09-04 export got wrong

> **Ran and landed 2026-09-04, both halves (R-86).** Verified item by item in
> `reconcile-designs-decisions.md` §A15, "A9 landed": nineteen items in full; item 3 in part — three
> sibling hints on P0-3 ("+ 3 more from the feed", "+ Add message", "+ 4 more, kept but not shown")
> kept `#A8A29A`, which the built control never inherits because it takes `input.placeholderColor` from
> `DESIGN.md`. Nothing is owed to Claude Design. The prompt stays as it was run.

Written on 2026-09-04 from `reconcile-designs-decisions.md` §A15 — the frame-by-frame verification
of the export A1–A8 produced. **Items 1–9 are misses in that export.** The **second half**
(items 10–18) is the ten frames this document re-specified on 2026-09-03 and deferred to "whenever
a library pass next touches them"; this prompt is that pass — **the owner ruled on 2026-09-04 that both
halves run in one session (R-86)**, so paste the whole prompt, closing rules included.

```
Correct the frames listed below in the Inflozo design project. THE VISUAL TREATMENT OF EACH IS
RIGHT AND STAYS — same components, same layout, same colour, same density. Only what they SAY
changes, plus two captions and one text colour. Do not redesign any of them.

1. `S5 Section Picker` S5a and S5c · THE RAIL HEAD. It reads "ALL CATEGORIES 485". DELETE THE
   NUMBER — "ALL CATEGORIES" with nothing beside it. A library total is never printed: the library
   grows monthly (FR-J14) and Appendix H forbids the figure. The per-category counts in the rail
   ("Heroes 18") are runtime figures and stay.

2. `Editor Sidebar Kit` · THE INPUTS CAPTION. It reads "inputs — radius 8 · coral caret · focus
   ring 2px @40%". The focused input drawn under it already carries the corrected ring; the caption
   did not follow. It becomes "inputs — radius 8 · coral caret · focus ring 2px solid coral-text
   #C2381F".

3. `P0-2 Icon Slot and Picker` · `P0-3 Item List Controls` · `P0-5 Populate From Panel` ·
   PLACEHOLDER AND HINT COLOUR. These three were not in A7 and still set placeholder and hint text
   in #A8A29A — "Search 420 icons", "Search icons", "+ 3 more rows", "+ Add post", "Search posts
   to add", "+ 25 more rows". Apply the Calibration Set's rule: #6B6459. Colour only; nothing moves.

4. `B Missing Surfaces` B5c and `D8 Editor Below 1440` D8f · EDITS, NOT CHANGES. The unit is an
   EDIT (addendum §AD2): "7 unsynced edits will be lost" and "She has edits that never reached the
   server". DELETE B5c's itemised list ("Home hero — design and two controls · Footer — three link
   labels · Post template — measure") — the heartbeat carries a count and nothing else, so the
   product cannot know it. Keep "They exist only in Rosa's browser. We cannot retrieve them from
   here." D8g beside it already says "edits" and is the model.

5. `D8 Editor Below 1440` D8b · THE CAPTION. It says a reader of the frame would apply "the 44px
   rules and the below-720 notice". There is no below-720 notice: the Small Screen Notice fires on
   a COARSE POINTER at a small viewport (D4f), and the width in the ruling is 834 on a coarse pointer (R-87), not 720. The
   caption becomes "the 44px rules and the small-screen notice".

6. `D5 Canvas Markers and Template Switcher` D5b · ONE FILE, TWO TEMPLATES. The routes-manager
   example "Membership landing · custom-membership.hbs" takes the filename the Membership group's
   own Signup template ships as (B19, D5f). Rename the example: "Landing · custom-landing.hbs".

7. `S12 Billing` S12a, S12b · `M5 Pricing` at 1440 · THE STORAGE ROW. Free's 100 MB storage cap
   appears only on M5's 390 frame. Add "Asset storage · 100 MB · 5 GB" to S12b's and M5's
   comparison tables, and print it wherever S12a prints the Free plan's limits. Appendix F.1 is the
   only definition: Free 1 project · 1 site · 100 MB · last 3 versions; Pro 25 · 10 · 5 GB · last
   10; 10 MB per upload on both.

8. `S9 Routes` S9a · THE YAML PANE AND THE CUSTOM ROUTES. Delete the rows "/ : home" and
   "/subscribe/ : members-signup" from the Custom routes list AND from the YAML. A membership page
   emits NO route — it is custom-{name}.hbs, bound from Ghost's page editor (B19) — and a routes:
   entry for / removes the index collection and breaks /page/2/. The YAML opens with the index
   collection, ALWAYS first, ahead of any custom collection:
     collections:
       /:
         permalink: /{slug}/
         template: index
   then /articles/, /tutorials/, /notes/ as drawn. S9c: "Posts per page follows the home feed's
   Count control — 10 right now" becomes "Posts per page is your theme setting — 12 right now. A
   collection can set its own limit here." and the Published date condition offers a relative form
   first — "in the last 30 days" (now-30d) — with the absolute date second.

9. `B Missing Surfaces` B22 · REDESIGN PROPOSALS (ruling R-78, FR-C7). Held out of the walk until
   A7 ran, but never in A7. Keep the card, the NOW / PROPOSED pairing and the sentence argued from
   the user's own data. What changes: not four per-section swaps but 2–3 WHOLE-SITE proposals, each
   a starter × Style Pack combination rendered on the user's real content and differing from the
   others in layout structure, with ONE sentence per proposal arguing from the data ("You have
   4,100 members and no signup above the fold"). Delete "no tag template, so Ghost falls back to a
   bare list" — tag.hbs always compiles. It is re-runnable later from the New Project Sheet's
   fourth door (D4a).

SECOND HALF — THE FRAMES THE UX PASS DEFERRED. IT RUNS IN THIS SAME SESSION (ruled 2026-09-04, R-86).

10. `B Missing Surfaces` B15 · "Creator" → "Publisher or higher". Ghost's 2026 lineup is Starter /
    Publisher / Business.

11. `S8 Deploy` S8a′ · `S11 Sites` S11a · "download the theme and upload it in Ghost Admin" is
    wrong: Starter forbids custom themes in Ghost Admin too. The zip still downloads; say where it
    can go: "Download your theme — it installs on a self-hosted Ghost, or on a Ghost(Pro) plan that
    allows custom themes."

12. `B Missing Surfaces` B14b · delete "We snapshot before redeploying, so this is reversible from
    history." → "The version you're on now stays in history and rolls back in one click."

13. `B Missing Surfaces` B7 · "on 26 pages" → the unit is templates, and the count is the
    project's own from the switcher (D5b): "on all 9 templates", and the notice line "Editing a
    site-wide section changes it on all 9 templates."

14. `B Missing Surfaces` B18 · keys become dotted namespace.name — member.signup_cta,
    post.reading_time, archive.empty_heading — and add one error row: a translation containing a
    brace pair is refused with the reason "Braces would break every page of your site" (FR-Q8: a
    malformed interpolation token is a whole-site 500). Keep the RTL note.

15. `B Missing Surfaces` B8 · delete the "Keep Free designs only" scope (ruling R-77). Add a second
    radio-card group ABOVE the existing scope group, titled "Re-roll what": Style Pack · Designs ·
    Both (FR-D17). The existing group is "where"; this one is "what".

16. `B Missing Surfaces` B4a · delete the "Body" block-type menu: the toolbar is bold · italic ·
    underline · link, and Remove link when a link is selected (P0-1 supersedes B4a). B4b's link
    entry gains "Open in new tab" and a rel row (FR-D9).

17. `B Missing Surfaces` B20 · `S11 Sites` S11d · THREE credentials — Admin API key, Content API
    key, Staff Access Token — each present or absent with one line saying what it enables; the
    token addable and removable at any time. Delete B20's grantable scopes: Ghost fixes an
    integration's permissions and nothing can be granted. The site URL is read-only text, never a
    field — a domain move is disconnect and reconnect.

18. `B Missing Surfaces` B6 · add the fifth state, no local storage, with the label "Syncing every
    change to the cloud" — because a false "Saved on this device" is the one thing this indicator
    must never say (FR-D10).

DO NOT TOUCH THE FRAME CAPTIONS that record settings snapshots ("drawn at padding …"): ruling R-73.
VOICE: PRD Appendix H. Errors are human and name the fix. Billing stays serious.
COUNTS: never print a total of designs, categories or free designs.

A literal Ghost Handlebars expression must be written with zero-width entities. A bare
{{ … }} is a Claude Design value hole and renders EMPTY.

19. `D1 First-Deploy Gates` D1b · WHAT THE TOKEN IS FOR. The offer says the token is for "reading your current theme, and reading routes.yaml". Reading routes.yaml needs no token — the integration key already reads it (MEASUREMENTS §37) — and what the token unlocks is UPLOADING routes.yaml (FR-I4) and READING the live theme for the snapshot and the drift report (FR-J13, FR-J16). Say those two, in those words; D1c's decline copy already has it right.
20. `D8 Editor Below 1440` D8c · THE SKIP LINK'S TARGET. The drawn link points at `#d8-canvas` and nothing in the file carries that id, so the frame's own link is dead. Give the canvas container the id the link names; the product's skip link is implemented by the story, but the frame should not contradict itself.
```

## Finalize notes

**The key-screen mock step was skipped, deliberately.** bmad-ux's Finalize renders HTML mocks of
key screens into `.working/` and then asks which un-mocked surfaces need a visual reference. **Every
key screen in this product is already mocked, at higher fidelity than that tool produces, in the
Claude Design export.** Rendering a second, lesser mock beside a finished frame creates two answers
to one question. For a surface that genuinely has no frame the substitute is not a mock — it is a
Claude Design prompt (Appendix A), so the drawing happens in the same project and inherits the same
system.

Step 5b's static prototype is **not** that second answer: each of its pages names the frame it
derives from and is checked against it — one answer, restated in walkable form (ruling R-75).

**The colour-theme, design-direction and wireframe tools were not invoked**, for the same reason.
The visual system is decided, drawn and paid for.

**`mockups/` and `wireframes/` were not created** — there is nothing to promote into them. `imports/`
is empty because the design export is not an import: it is the authority (R-74).
