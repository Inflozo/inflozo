---
title: Adversarial Review — Inflozo PRD v1.0
date: 2026-08-17
reviewed: prd.md (1,062 lines) + addendum.md, cross-checked against .memlog.md change history
stance: hostile — assume wrong, prove it
---

# Adversarial Review

**Verdict: NOT buildable as written.** The PRD absorbed today's ~30 changes unevenly: the FR bodies were updated but normative appendices, principles, epics, and the DoD still carry pre-change text that directly contradicts them. Three defects are critical (a normative appendix contradicting a headline v1 feature; a flagship template set that is unreachable on a default deploy; an incoherent feed/pagination data model). 45 findings total.

Clean checks, for the record: Appendix A sums to exactly 487 (68 Free) — the counts are honest; no "2 s debounce" or "last-write-wins" remnants survive in the PRD proper; the five→four upgrade-moment change landed cleanly (FR-L5 lists exactly four, nothing else claims five); FR-J2 correctly sources `posts_per_page` from FR-Q1. The rot is elsewhere.

---

## CRITICAL

### C1. Appendix B still says `@custom` = `color_scheme` only — contradicting P3, FR-J2, and the entire FR-Q custom-settings builder

- **Location:** Appendix B (line 982) vs §2 P3 (line 60), FR-J2 (line 193), FR-Q2/Q3 (lines 255–256).
- **Conflict:** Appendix B — which the header declares "normative" — states:
  > "**`@custom` in generated themes:** `color_scheme` (Auto/Light/Dark) only — Ghost allows 5 setting types and caps themes at 20 settings; Inflozo deliberately uses one (P3)."
  Meanwhile revised P3 says "the color-scheme toggle **plus any user-defined custom settings**", FR-J2 says "`custom` = `color_scheme` … **plus any user-defined custom settings from FR-Q2**", and FR-Q2 is an entire builder for user-defined `@custom` settings. Appendix B even cites P3 for the *old* rule.
- **Failure scenario:** The helper shim's mandate is "The helper shim (FR-H5) must cover **exactly this surface**" (Appendix B preamble). A dev implementing the shim to Appendix B builds `{{@custom.color_scheme}}` support only; every FR-Q3 binding (`{{@custom.*}}` reads for promoted controls, colors, text) renders blank on canvas. QA testing against the normative appendix passes; the feature is broken. Two "normative" documents give opposite answers to "how many custom settings can a theme have."

### C2. Members templates are always compiled but unreachable without routes.yaml — and the default is no routes.yaml

- **Location:** FR-I1 (line 184) vs FR-I5 (line 188), FR-D6 (line 132), A30 (lines 903–918), §1.4 differentiator 6.
- **Conflict:** FR-I1: "Standard template set **always compiled**: … `members/signup.hbs`, `members/signin.hbs`, `members/account.hbs`." FR-I5: "Projects that never open the Routes Manager compile with **Ghost's default routing (no routes.yaml surprises)**." Ghost has no built-in routes for `members/*` templates — signup/signin/account are Portal modal states; custom members *pages* only render if routes.yaml maps paths to those templates (or a Ghost page is manually assigned). Nothing in the PRD generates those route entries.
- **Failure scenario:** A user designs all three A30 members pages (15 variants, "tier-bound; portal-wired", sold as Ghost-native depth in §1.4), hits "Ship it", never having opened the Routes Manager. The theme deploys 0/0 gscan. `/signup/` 404s; the designed pages are dead files in the zip. The flagship "deep Ghost nativity" differentiator silently doesn't exist for the default path, and FR-I4's "Deploys never silently skip routes" is technically honored while the outcome is exactly a silent skip. Either compiling members templates must auto-emit routes.yaml (contradicting FR-I5) or the template switcher is offering canvases that can never render. The PRD specifies neither.

### C3. The feed data model is incoherent: FR-Q1 vs FR-H2 vs FR-I2 vs A34 fight over who controls how many posts render

- **Location:** FR-Q1 (line 254) vs FR-H2 (line 176), FR-I2 (line 185), A34 (line 956).
- **Conflict:** Three owners of page size, one undefined mechanism:
  1. FR-Q1: "`posts_per_page` (default 12) … This replaces per-section derivation — feed sections' Count controls govern **only their own `{{#get}}` queries**."
  2. FR-I2: collections defined with "(URL prefix, filter, assigned template, **posts-per-page**)" — a per-collection page size. Ghost's routes.yaml collections have **no per-collection posts-per-page key**; page size is the single theme-level `posts_per_page`. This control is unbuildable *and* contradicts FR-Q1's "global config" framing.
  3. FR-H2 gives feed sections a **Count** control *and* "Feed sections on `index.hbs` additionally expose **Pagination style: Numbered (`/page/2/`)**…"; A34: "Numbered variants compile to `/page/2/` links **via native pagination context**." Native pagination context only exists for the **collection-bound** `{{#foreach posts}}` loop sized by `posts_per_page`. A `{{#get}}`-driven section (which is what Source/Count define per FR-Q1) renders the **same posts on every page** — `/page/2/` would repeat page 1.
- **Failure scenario:** `posts_per_page`=12, primary feed section Count=6, Pagination=Numbered. What does page 1 show — 6 or 12? What does `/page/2/` show? If the feed is `{{#get}}`: identical posts forever. If it's collection-bound: Count is a dead control, contradicting FR-H2. Nothing says which section on `index.hbs` is "the" collection feed when two grid sections are placed, or what happens on a custom collection template. A compiler cannot be written from this spec; QA cannot write the acceptance test. Also FR-H2 scopes the Pagination control to "`index.hbs`" only — but FR-I2 collections assign their own templates with their own paginated feeds and RSS, which per FR-H2's letter can't choose a pagination style.

---

## HIGH

### H1. "Both live Ghost targets" — the test matrix grew to three deploy targets; the DoD, three epics, and NFR-6 still say two

- **Location:** §4 (line 86–87), E3/E7/E11 (lines 351, 359, 367), NFR-6(d) (line 268), §7.6 (line 335).
- **Conflict:** §4 now lists deploy targets "(a) a self-hosted Ghost 6.x … droplet, (b) a Ghost(Pro) **Publisher** site, and (c) a self-hosted Ghost **5.x** droplet" plus a Starter site. Same section's DoD: "10 starter templates deployable end-to-end to **both live Ghost targets**". E3: "**both** live Ghost targets connected"; E7: "deployed + rolled back on **both** live targets"; E11: "every starter deploys 0/0 gscan to **both** targets"; NFR-6(d): "deploy to **both** live Ghost targets."
- **Failure scenario:** QA satisfies the DoD by deploying to the 6.x droplet and Publisher, never exercising 5.x — the exact compatibility the 5.x droplet was added (memlog: today) to verify. Launch gate passes; 5.x deploys were never end-to-end tested. "Both" of three is not a testable criterion.

### H2. Footer sections carry a per-section "credit toggle" that contradicts FR-J15's credit rules

- **Location:** Appendix A A3 content list (line 425) vs FR-J15 (line 206), Appendix F (line 1049).
- **Conflict:** A3 Footers content: "…legal line, **credit toggle**." FR-J15: "generated themes include a 'Built with Inflozo' credit … by default. **Pro accounts can disable both per project; Free deploys and exports always retain credits.**"
- **Failure scenario:** (a) A Free user flips the footer's credit toggle off — a plain content control with no stated plan gate — and exports a credit-free theme, violating the Appendix F "Credit removal (white-label) — Pro only" row. (b) Two owners of one behavior: the Pro per-*project* disable vs the per-*section-instance* toggle; which wins when they disagree is unspecified. (c) Independent hole: FR-J15's "always retain credits" is unenforceable for any Free design whose footer section is deleted or hidden — nothing says the compiler injects a credit into a footerless theme.

### H3. Countdown variants require a date input that the control vocabulary explicitly bans

- **Location:** A2 #6 (line 413: "**Countdown** — message + live countdown **to a set date**"), A6 #11 (line 497: "**Countdown CTA** — deadline timer beside the action") vs FR-F1 (line 156: "Exactly **ten control types** exist … A section needing anything else gets redesigned; the vocabulary never grows") and Appendix C (line 1000: "The design kit's additional controls (slider with named ticks, **date picker**, color popover…) are sanctioned for **app surfaces only** … **never in a section's Controls sidebar**").
- **Failure scenario:** Dev must let the user set the target date. Options: a date picker (explicitly forbidden in section sidebars), a free-text field parsed as a date (violates P2's "no raw values", unvalidatable, timezone-undefined), or redesigning the section per FR-F1 — but the variants are normative launch deliverables per FR-G1 ("every listed variant is a launch deliverable"). Two shipped variants cannot be built without breaking a binding rule.

### H4. FR-Q3 color-token promotion breaks the token compilation model and the hand-paired-dark/AA guarantee

- **Location:** FR-Q3 (line 256) vs FR-E4 (line 151), Appendix D (line 1021), §1.4 #4, NFR-2.
- **Conflict:** FR-E4: "Tokens compile to CSS custom properties (`:root` and `[data-mode="dark"]`) in the generated theme" — i.e., static `screen.css` (§7.4). FR-Q3: "Style Pack color tokens (**accent etc. → color**) … The compiled theme reads `{{@custom.*}}` at render time instead of the baked value." Handlebars does not execute inside `assets/css/screen.css`; a runtime `@custom` color forces the token block inline into `default.hbs` — an architecture change no FR describes. Worse: an accent token is a *pair* (hand-paired light + dark per Appendix D: "Dark palettes are hand-paired (not algorithmic inversions)… Packs must pass AA on every token pairing"). One Ghost color setting yields one hex.
- **Failure scenario:** User promotes accent to `@custom`. Which mode does the single hex override? If both, the hand-paired dark accent is destroyed and the site owner can pick a color failing AA against `on-accent` — falsifying "impossible to make ugly" (§1.4) and the Appendix D AA guarantee, with no re-validation possible at Ghost-Admin-edit time (the whole point of FR-Q2 is "without redeploying"). The PRD promises simultaneously that every output passes AA and that owners can set arbitrary colors post-deploy.

### H5. All ten starter templates are built from Pro variants — the Free starter path dead-ends at every exit

- **Location:** Appendix E (lines 1027–1036) vs FR-G2 (line 167), FR-L1 (line 219: "the open canvas … is the trial"), G2/G8 (lines 30, 36).
- **Conflict:** Every starter names Pro variants: Aurora — "Signup Hero" (A4 #7), "Issue Preview" (A22 #7), "big-ask paywall" (A32 #9); Quiet — "Big Type Manifesto" (A4 #8), "Minimal Index" (A18 #4), "Minimal end rules" (A26 #8); Gazette — "Magazine Cover" (A4 #9), "Topic Tabs" (A20 #4); etc. Only variants 1–2 per category are Free. No starter is Free-deployable; no Free-only starter exists.
- **Failure scenario:** The canonical G2 journey — "Blank project → first successful deploy < 15 minutes for a first-time user" — for a Free user starting from any starter (the promoted path, FR-B2 lists it first) ends at the FR-L3 block sheet listing 3–6 Pro sections to hand-swap across multiple templates. G8 (≥30% of signups reach first deploy in 7 days) is undermined by the product's own template set. Either ship at least one all-Free starter or accept that "starter" and "Free deploy" are disjoint — the PRD claims both work.

### H6. FR-H5's helper-shim list omits helpers the library demonstrably requires, while Appendix B demands exact coverage

- **Location:** FR-H5 (line 179) vs A25 (line 830: "Wraps `{{content}}`"), A28 (line 875: "Wrappers for `{{comments}}`"), A34/Appendix B pagination context (lines 956, 980), A24 (title/excerpt/tags/authors rendering).
- **Conflict:** FR-H5 enumerates the shim: "`{{#foreach}}`, `{{#get}}`, `{{img_url}}`, `{{date}}`, `{{reading_time}}`, `{{#match}}`, `{{#if @member}}`, `{{navigation}}`, `{{asset}}`, truthy helpers." Missing: `{{content}}` (12 A25 variants), `{{comments}}` (10 A28 variants — Ghost's comments UI is an injected members script that **cannot** be emulated in a sandboxed canvas iframe; preview behavior unspecified), pagination helpers/context (10 A34 variants + Appendix B "Pagination context: page, pages, total, next, prev → drives A34"), `{{tags}}`/`{{authors}}`/`{{excerpt}}`/`{{title}}`/`{{url}}`. Appendix B: "The helper shim (FR-H5) must cover **exactly this surface**."
- **Failure scenario:** Shim built to FR-H5's list; A25/A28/A34 sections — 32 normative variants — render broken on canvas, violating the single-source WYSIWYG differentiator (§1.4 #1). Or the shim silently grows beyond its spec and the golden tests (§6.6) chase an undocumented surface. Either way the "exactly this surface" contract is false today.

### H7. Deploy/export from anywhere but the lock-holding session ships stale state; the addendum's own guarantee contradicts its takeover path

- **Location:** FR-D10 (line 136), FR-D18 (line 144), addendum A1 (line 17), A2 (line 25).
- **Conflict:** FR-D10: cloud sync fires "before any deploy or export" — but that flush can only originate from the session holding the local op-log. FR-D18 explicitly designs for a holder with unsynced edits ("heartbeat … includes the holder's unsynced-edit count"). Nothing restricts deploy/export to the lock holder: a read-only session or (unspecified) dashboard action can trigger them. Addendum A1 asserts: "Data … **never crosses a deploy/export/lock boundary unsynced**" — while A2's takeover path is precisely data crossing a lock boundary unsynced ("its unsynced journal was not included").
- **Failure scenario:** Laptop (holder, autosave off, 45 unsynced edits) is asleep at home. User at work opens read-only, hits "Ship it". Compile uses the stale cloud snapshot; the live site regresses 45 edits with no warning — the exact "an Inflozo theme never breaks your site" promise inverted. The spec must either gate deploy/export on holding the lock (unstated) or surface "X unsaved edits exist elsewhere" at the deploy button (unstated).

### H8. The unit economics exclude costs the PRD itself mandates — "break-even at 4 Pro subscribers" is false by the document's own requirements

- **Location:** Appendix F (line 1052), G7 (line 35) vs §4 (line 86), FR-P (Resend), NFR-9 (Sentry), FR-B7.
- **Conflict:** "fixed ≈ $45/mo (Supabase Pro $25 + Vercel Pro $20) … break-even ≈ 4 Pro subscribers." But §4 makes permanent-through-launch requirements of: a Ghost(Pro) **Publisher** site (~$29–31/mo), a Ghost(Pro) **Starter** site (~$9–11/mo), two DO droplets (owner-provided, still real dollars), real Resend sends (paid tier at any volume beyond hobby), and NFR-9 mandates Sentry. Realistic fixed cost is $100–130/mo → break-even ~8–9 Pro subscribers, more than double the claim baked into goal G7. Nitpick in the same paragraph: "~$13.70 net on $15" only holds if the +1.5% international fee applies to *every* transaction (domestic is ~$13.93) — the model quietly assumes 100% international. New features absorbed today (notifications feed writes/retention, quota-exempt snapshot + artifact storage: up to 200 Pro × 25 projects × 10 artifacts) are unmodeled; individually small, but the appendix was never re-run after the scope grew.
- **Failure scenario:** Owner plans runway on "4 Pro subscribers = break-even" from an appendix that its own §4 falsifies.

### H9. §4's "all testing runs on the real production infrastructure" is unimplementable for NFR-6, and the CI it mandates is uncosted and self-colliding

- **Location:** §4 (line 86) vs NFR-6 (line 268), §7.6 (lines 335, 338).
- **Conflict:** §4: "**all testing** runs on the real production infrastructure." NFR-6 requires: (a) a render matrix of 487 × 3 packs × 2 modes × 3 viewports = **8,766 Playwright screenshots** per run with diff gates; (b) *nightly* compile CI of 100% of variants; (c) golden tests "against live Ghost 5.x and 6.x in CI". None of that runs *on* Vercel/Supabase — it needs CI runners that are, by definition, not the production stack; the mandate as phrased forbids the PRD's own quality gates. Worse: golden and E2E tests upload/activate themes on **single shared live Ghost droplets** — theme activation is globally stateful per site, so two concurrent CI runs (or a CI run during an owner's manual test) corrupt each other nondeterministically. No isolation strategy, no runner, and no line item in Appendix F for ~9K nightly screenshot renders.
- **Failure scenario:** E15's exit criterion ("Full E2E suite, visual-regression sign-off") is either run in violation of §4, or flakes forever on shared-droplet collisions, and either way costs money the economics say doesn't exist.

---

## MEDIUM

### M1. A25's "measure" control is a per-section width control after per-section width was removed
- **Location:** A25 (line 830) vs FR-F2 (line 157), Appendix A universal-controls note (line 383).
- **Conflict:** FR-F2: "sections span the site width by default — **width is not a per-section control**." Appendix A: "(Content width is governed by the Style Pack's site-width token … not per section.)" A25: "controls: **measure (Narrow/Comfort/Wide)**", variants defined by widths ("~680px measure", "~760px").
- **Failure scenario:** Dev A deletes the measure control citing FR-F2; Dev B ships it citing A25; both cite normative text. If measure is a sanctioned exception (reading-column width ≠ site width), the carve-out must be written; today the width-token change and A25 flatly disagree.

### M2. P8's exhaustive Admin API list omits routes upload
- **Location:** P8 (line 65) vs FR-I4 (line 187), §7.2 (line 289).
- **Conflict:** P8: "The Admin API is used **solely** for connection validation, theme upload/activate, and the pre-activation snapshot (FR-J13)." FR-I4/§7.2 add a fourth use: the automated routes.yaml upload attempt via "the community-known internal routes endpoint." Also unexamined: routes upload *modifies site configuration*, sitting awkwardly next to P8's read-only framing.
- **Failure scenario:** Security review scopes the Admin proxy to P8's three verbs; FR-I4's route upload 403s in production, or the proxy quietly grows past its stated contract.

### M3. The pre-activation snapshot is a per-site artifact stored in a per-project world — deletion semantics undefined
- **Location:** FR-J13 (line 204) vs §7.1 buckets (line 280: `deploy-artifacts/{projectId}/…`), FR-B3, FR-A5, FR-C6.
- **Failure scenario:** Snapshot captured "before Inflozo's first Activate **on a site**" — but the only artifact bucket is keyed by projectId. User deletes that first project (FR-B3 cascades? unspecified) or the account (FR-A5 cascades "deploy artifacts") → the user's original pre-Inflozo theme — the "safe installs" escape hatch — is destroyed while their site still runs an Inflozo theme. Disconnecting and reconnecting a site (new site row?) orphans it. No FR specifies snapshot ownership, retention on project/site/account deletion, or surfacing after reconnect.

### M4. Snapshot restore vs the gscan gate — the safety net may be blocked by the safety gate
- **Location:** FR-J13 ("Restoring it is a one-click redeploy") vs FR-J6 ("every compile runs gscan; **errors block deploy**"), FR-J8 pipeline.
- **Failure scenario:** User's original theme is an old Casper fork with gscan *errors* (common). They activate Inflozo, regret it, click restore — does the restore pipeline run the gscan gate? If yes, Inflozo refuses to give back the user's own theme. If no, "every compile/deploy runs gscan" is false. Unspecified either way; this is the exact scenario the brand promise exists for.

### M5. Custom-setting key lifecycle: collisions and resurrection unhandled
- **Location:** FR-Q2 (line 255).
- **Conflict:** Keys are "generat[ed] lowercase snake_case" from names and "immutable once deployed" — but only *rename* is addressed. Unspecified: two settings whose names normalize to the same key ("Show Header" / "show-header"); a user naming a setting "Color Scheme" → key `color_scheme`, colliding with the reserved setting; deleting a deployed setting and later creating a new one with the same key — Ghost's stored per-key value resurrects onto a setting of possibly different type, producing undefined Ghost Admin behavior.
- **Failure scenario:** Delete boolean `show_banner`, later add select `show_banner` — the site owner's stored `true` collides with a select whose options don't include it. No validation rule in the PRD prevents any of these.

### M6. FR-Q promotion semantics break three sibling rules
- **Location:** FR-Q3/Q4 (lines 256–257) vs FR-Q2, FR-J3, FR-D4, P3.
- **Conflicts:** (a) FR-Q4: "canvas previews custom settings **at their defaults**" — but FR-Q2 "disallows defaults on image settings (Ghost rule)": an image-bound prop has no default to preview; behavior undefined. (b) "Layout Picker → select": a runtime-switchable layout means the compiled `.hbs` must ship *every* layout branch and its CSS — contradicting FR-J3 ("Section CSS is emitted only for placed sections") and the bake-by-default compile model; nothing specifies multi-branch compilation. (c) "text prop → text": FR-D4 text props carry inline `<strong>/<em>/<u>/<a>` marks; Ghost text settings are plain and `{{@custom.x}}` HTML-escapes — promoted text either loses formatting or prints escaped tags. All three are dev-blocking unknowns in a headline new feature.

### M7. A33/A34 "variants" are selected by controls, not placement — FR-L3's remediation mechanics don't apply to them
- **Location:** A33 (line 948), A34 (line 956), FR-H2 vs FR-L3 (line 221), FR-J12.
- **Conflict:** Free tier = first two variants per category, so Infinite scroll (A34 #9–10) and four Koenig treatments are Pro. But pagination style is a Named Select in a Data group and the Koenig treatment is "Style group of Post Content Layout" — neither is a placed section. FR-L3's block sheet offers "upgrade or **swap each to a Free variant via Shuffle**"; you cannot Shuffle a select value, and the sheet lists "Pro **sections**".
- **Failure scenario:** Free user picks Infinite scroll; export blocks with a sheet whose remediation instruction is impossible to follow. Or the gate doesn't check control-selected variants and Free users ship Pro pagination/Koenig styles free. Gating for control-selected variants is simply unspecified.

### M8. Site Remix and Variant Shuffle on site-wide singletons: one template's action silently rewrites every template
- **Location:** FR-D17 (line 143), FR-D2, FR-D13 vs FR-D5 (line 131).
- **Failure scenario:** Site-wide sections (header/announcement/footer) are single shared instances compiled into `default.hbs`. Site Remix "re-rolls … every placed section's variant" while the user is looking at the Home template — does it re-roll the header, changing Post/Tag/Author/Members pages sight-unseen? Same for hover-arrow Shuffle on a header. FR-D17's "single-step undo" — does one undo on Home revert the global header across templates? No FR answers any of it; the blast radius of the product's two signature play features on singletons is unspecified.

### M9. Persistent undo + always-latest library = replaying ops against a schema that no longer exists
- **Location:** FR-D9 (line 135), addendum A1 vs FR-J14 (line 205).
- **Conflict:** The op-log/undo stack "persists locally … across reloads and sessions" and restores deleted sections "with all customizations." FR-J14: "a single live library, no per-project pinning … the canvas always renders the current library." Library updates can rename controls, drop variants, change content schemas.
- **Failure scenario:** User deletes a section Friday; library update Saturday removes that variant or renames a control key; Monday the user hits undo — the inverse op reinstates an instance referencing a nonexistent variant/schema. Crash, silent corruption, or migration? Unspecified. Secondary contradiction: FR-J14 promises updates apply "never automatically," yet the canvas updating to the current library *is* automatic — only the deployed site lags. The user's design changes under them without consent; only the redeploy is opt-in.

### M10. Cross-device/takeover undo and the Style Pack's missing sync path
- **Location:** FR-D9, FR-D18, addendum A1/A2 vs §7.5 (lines 319–320).
- **Conflicts:** (a) The journal is per-browser; after a takeover, the former holder's journal tail predates the server snapshot the requester has since advanced. When the former holder later regains the lock, is its stale journal (= its undo stack) discarded, replayed, or merged? A2 says only that its edits "were not included." Undo after reacquisition is undefined and can revert the other device's synced work. (b) A1's sync is "the current doc jsonb snapshot upserts to **`project_templates`**" — but the Style Pack lives in `projects.style_pack` (§7.5), and FR-D9 makes pack changes undoable ops. No specified mechanism syncs pack changes to the cloud at all.
- **Failure scenario:** User customizes the pack, autosave interval elapses, `project_templates` upserts, browser dies — pack edits were never in the synced surface as specified; or they are, via an undocumented extra write the architect must invent.

### M11. Downgrade edges: "the first" project, connections, storage, and mid-session expiry all unspecified
- **Location:** FR-L3 (line 221), FR-L2, FR-C5, FR-K3.
- **Failure scenario:** Pro with 25 projects, 10 connections, 4 GB assets lapses to Free. (a) "projects beyond **the first** become read-only" — first by creation date? Last edited? User-chosen? A three-year-old test project stays editable while the active one locks. (b) Connections: Free is 1 — do 9 sites disconnect, which one survives, do their projects fall to sample content? Silent on connections entirely. (c) Assets: 4 GB on a 100 MB quota — FR-K3 enforces at *upload time* only; can existing over-quota assets still compile/deploy? (d) The entitlement flips (webhook) *while the user is mid-edit in project #7* with unsynced local edits — does the session lock instantly, at next open, at next sync? Every one of these will occur in month one of real billing.

### M12. Hidden Pro sections vs the exit gate — "containing" is ambiguous
- **Location:** FR-D5 (line 131: hidden sections "excluded from compilation but retained") vs FR-L3 ("a project **containing** Pro sections" blocks).
- **Failure scenario:** Free user hides (not deletes) a Pro section. It won't compile into the theme — but the project "contains" it. Is deploy blocked? If yes: user is blocked over code that won't ship, and the block sheet's "swap via Shuffle" for a hidden section is bizarre. If no: hiding is a documented gate-dodge that contradicts the sheet's itemization ("Pro sections in this design"). One sentence would fix it; it isn't there.

### M13. A31 utility variants have no compile target — `private.hbs` doesn't exist in the theme structure
- **Location:** A31 (lines 920–930) vs FR-I1 (line 184), §7.4 (lines 298–312).
- **Conflict:** A31 #10 "Private Site Gate — styled password-access page" requires Ghost's `private.hbs`, absent from FR-I1's "always compiled" list and §7.4's tree. "Coming Soon", "Maintenance", "Subscribe Success", "Empty Tag State" have no stated template mapping at all (custom route? page template? error state?).
- **Failure scenario:** Five normative launch-deliverable variants (FR-G1) with nowhere to compile to; dev discovers mid-E11 and either grows FR-I1 ad hoc or cuts normative scope.

### M14. FR-J5's `{{img_url}}` + srcset claim doesn't hold for theme-bundled assets
- **Location:** FR-J5 (line 196) vs FR-J3 (line 194), FR-K2, NFR-2.
- **Conflict:** FR-J5: "`{{img_url}}` with `srcset` + WebP + lazy loading" — Ghost's `img_url` resizing applies to Ghost-hosted content/site images. Section imagery per FR-J3 is bundled into `assets/images/` and served via `{{asset}}` as static files: no resizing, no srcset. FR-K2 stores one rendition at "max long edge 2400 px".
- **Failure scenario:** A Free user's image-heavy homepage ships 2400 px WebPs to 390 px phones; NFR-2's "Lighthouse mobile Performance ≥ 90" fails on properly-sized-images and the blanket FR-J5 claim was never true for half the images in a theme. Needs either multi-rendition bundling at compile (unspecified) or an honest scope note on FR-J5.

### M15. Custom Overlay search bakes a Content API key into a distributable zip; key rotation breaks deployed sites
- **Location:** A23 #9–10 (lines 802–803), §7.6 ("fully custom overlay variant uses client-side Content API search") vs FR-C8 (line 123), FR-J12.
- **Failure scenario:** The shipped theme's client-side search must call the Content API — the key gets compiled into theme JS. (a) FR-C8 key rotation instantly breaks search on every deployed theme using it, with no warning surface specified. (b) FR-J12 exports the zip; the key travels with it to anyone the user shares the theme with, and to the wrong site if installed elsewhere. Content keys are "browser-safe" on the owner's site, but baking them into portable artifacts is a lifecycle problem no FR addresses.

### M16. FR-D6's synthesis rule is stale against global singleton chrome
- **Location:** FR-D6 (line 132: untouched templates' "defaults derive **header/footer**/style from the Home canvas") vs FR-D5 (header/footer are site-wide singletons compiled into `default.hbs`, not per-canvas).
- **Failure scenario:** Header/footer cannot be "derived from the Home canvas" — they aren't Home's to give; they're global and reach every template via `default.hbs` automatically. A dev implementing synthesis-from-Home for chrome builds a second, conflicting mechanism. Pre-singleton remnant text.

### M17. Half the library is `items[]`-based; the ten-control vocabulary has no list-management affordance
- **Location:** FR-F1/Appendix C vs A5, A8, A9, A10, A11, A12, A13, A14 (all `items[]`/`logos[]`/`team[]`/`steps[]` content).
- **Failure scenario:** Adding, removing, and reordering testimonial/FAQ/logo items is a core editing loop, and no control type covers it (Stepper sets *count*, not content; FR-D13 only defines overflow display). Dev must invent a repeater UI that FR-F1 arguably forbids ("the vocabulary never grows") or the PRD must classify item management as content-editing outside the control vocabulary. Unstated either way.

### M18. "Color pickers live here and only here" vs Appendix C sanctioning color popovers on two other surfaces
- **Location:** FR-E3 (line 150: "color pickers and font pairing list live here **and only here** — P2") vs Appendix C (line 1000: "color popover with hex paste … sanctioned for app surfaces … Routes Manager, **Theme Settings**, Style Pack editor").
- **Failure scenario:** FR-Q2 color-type custom settings need a default color input in Theme Settings — Appendix C permits it, FR-E3 prohibits it. Trivial to fix, but as written two normative statements conflict.

### M19. Theme identity under rename/duplicate is unspecified — orphaned themes and version resets
- **Location:** FR-J10 (line 201: "`inflozo-{project-slug}`, auto-incremented semver per deploy") vs FR-B3 (rename/duplicate).
- **Failure scenario:** Rename a deployed project — does the slug change? If yes, the next deploy uploads a *new* theme name to Ghost: version restarts, the previously active theme is orphaned in Ghost Admin, and FR-J9's history/rollback mapping to the old name is severed. If slugs are frozen at first deploy, say so. Also: two projects deploying to the same site with colliding slugs (duplicate then edit) overwrite each other's theme. Nothing specifies slug stability or uniqueness scope.

---

## LOW

### L1. FR-J1 calls the output "a complete Ghost 6.x theme" while NFR-7 requires 5.x support
Line 192 vs line 269. The engine declaration covers both; the phrasing invites a dev to use 6.x-only features. Say "Ghost 5.x/6.x-compatible theme."

### L2. §7.4's package.json comment is stale: "custom.color_scheme?"
Line 300 vs FR-J2/FR-Q2 (user-defined settings also compile in). Same remnant family as C1.

### L3. G6 vs FR-F4 disagree on the control-change budget
"visible < 100 ms" (line 34) vs "renders within one frame" (line 159) — 16.7 ms at 60 fps. Six-fold difference in the acceptance bar; QA needs one number.

### L4. G1 "< 60 seconds" is unmeasurable against its own flow
Line 29 vs FR-C1: the connect flow includes the user manually creating a Custom Integration in Ghost Admin and pasting two keys — realistically minutes. Neither the start point ("URL entered"? "keys pasted"?) nor the clock's scope is defined.

### L5. FR-D14's unbounded-page performance requirement has no reference size
"No hard cap on sections … must hold NFR-1 performance on long pages" (line 140). 60 fps on unbounded N is unfalsifiable; specify a reference (e.g., 60 fps at 75 sections).

### L6. "Exactly five transactional emails" vs FR-P3's two more
Line 248 vs 250. Contact-form relay and docs suggest-an-edit are also Resend sends; "exactly five" is only true under an unstated category distinction. Seven templates will exist.

### L7. FR-N1 "All statically generated" vs the live suggestions board on the marketing site
Line 234 vs FR-M3 (line 229): a board with live votes/status/sort is not SSG. ISR/client-fetch resolves it, but the absolute claim is false as written.

### L8. G5 says "480+", everything else says 487
Line 33 vs FR-G1, Appendix A, Appendix F, E14, and Appendix H's canonical empty-state copy which hardcodes "487 gorgeous sections" — a string that goes stale the day the library changes size.

### L9. Auto-branding targets "the active project" during a flow where none may exist
FR-C4 (line 119): connect during onboarding precedes project creation; "seeds the active project's Style Pack" has no referent. FR-C7 covers the create-from-proposal path; plain connect-first does not say what "Use your brand" seeds.

### L10. Dashboard thumbnails vs local-first: capture source unspecified
FR-B1 + §7.1 server-side "thumbnail capture" can only see the cloud snapshot — up to a sync interval (or a whole autosave-off session) stale. Client capture would fix it; neither is specified.

### L11. FR-D16 previews Anonymous/Free/Paid; Appendix B lists a `comped` member status
Lines 142 vs 979. Comped members are unpreviewable; presumably rendered as paid — unstated.

### L12. Light-only projects and the reserved custom-settings slot
FR-Q2 reserves 1 of 20 for `color_scheme`; FR-J2 emits `color_scheme` only for Light+Dark projects. Do Light-only projects get 19 or 20 user settings? The meter's max is ambiguous.

### L13. FR-D18's takeover has no normative timeouts
The nudge/heartbeat thresholds exist only as "~30 s / ~60 s" in the addendum, whose front-matter says "Not normative for scope." QA cannot test "if a nudge goes unanswered" without a number in the PRD proper.

### L14. FR-A5's 14-day soft-delete implies restorability; no restore flow exists
Line 101. Is the Dodo subscription cancelled at request time (user loses paid days if they restore) or at purge? Can the user un-delete, and how? Unspecified.

---

## Summary table

| Severity | Count |
|---|---|
| Critical | 3 |
| High | 9 |
| Medium | 19 |
| Low | 14 |
| **Total** | **45** |

The pattern behind most Critical/High findings: today's changes were applied to the FR bodies but not propagated into Appendix B, Appendix A's control lists, the epics/DoD, P8, §7.4, or Appendix F — exactly the stale-cross-reference class this review was told to expect, and it is where the document fails.
