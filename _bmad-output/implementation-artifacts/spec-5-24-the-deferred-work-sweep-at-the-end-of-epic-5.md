---
title: 'Story 5.24 — The deferred-work sweep at the end of Epic 5'
type: 'chore'
created: '2026-09-28'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

Every item set aside during the build so far — in every epic, not only this one — is fixed, shown to be already
fixed, or written into the later story that will really build it, so the list that stays open is only what has to wait.
On screen you will see small fixes: a **Clear search** link when a search finds nothing, a Sites search that survives
closing a window, bold and italic kept when you paste from a Google Doc, a different small picture for each kind of
section in Layers, the sample article's players playing, Ghost's floating Subscribe button wearing your site's own
icon, and editing passing to your other window a few seconds after you close the tab that had it. Behind the scenes,
flaky or missing checks are fixed or added, and the plan for the later epics is corrected — including which designs are
free, where it still disagrees with your ruling of 28 August (Question 2).

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** the deferred-work ledger is the one list of real findings that were not their story's to fix, and it has
only ever grown. Derived at this Create from `deferred-work.md` at `6bf7c4e0` (the command is under Verification), it
holds entries from every epic; many name a story that is already done, or no one ("whoever next touches…",
"unowned"); several are already fixed while the ledger lags; and some carry an owner that is a later story whose own
text never mentions them — so nothing guarantees they will ever be built. R-207 (owner, 2026-09-27): *"Do a complete
sweep across all deferred items and close whatever we can now."*

**Approach:** triage every open entry, in every epic, to exactly one of four outcomes, and act on it:

1. **Already fixed** → closed with its evidence, re-executed at Dev.
2. **Closable now** — nothing a later epic builds is needed → closed by the change its entry names, with a control that
   fails when the change is reverted (standing rule 2).
3. **Genuinely later** → one concrete later story is named, and that story's text in `epics.md` gains the requirement
   word for word with its DW id, so it will really build it.
4. **The owner's** → asked under *Questions for the owner* (R-83), and built or closed as he rules.

The closures are grouped by area, not by entry number, because several entries close on one change. And one new check
makes the rule structural: **the gate refuses an open entry whose only owners are finished stories**, so the ledger
cannot drift back to where it is today.

## Boundaries & Constraints

**Always:**

- **The ledger is the source.** The triage below was derived at Create and is re-derived at Dev from the ledger at
  HEAD; an entry added since is triaged the same way, and a verdict that no longer holds is re-made, never forced.
- **An entry closes only on evidence** — a change whose control was seen to fail with the change reverted, a fixed
  claim re-executed, or the owner's signed ruling. A `resolution:` line says which, and the comment beside the code
  it governs is updated with it (standing rule 3).
- **A later owner is one named story that is not done**, and its text in `epics.md` carries the requirement with the
  DW id (R-195's lesson: a moved requirement is pasted into the receiving story, never only referenced).
- **Counts are derived, never written** (standing rule 4) — in code, in copy and in these documents.
- **The export is never edited** (R-74); every surface a fix touches names its frame, and any departure is recorded
  beside the code.
- **Every pressed control says so and every route keeps its own skeleton** (R-98); zero axe violations on every
  touched surface at 1440, 834 and 390.
- **Real infrastructure for every closure that concerns it** (R-82): Supabase, Vercel, T1 `ghost6.inflozo.com`, T3
  `ghost5.inflozo.com`; a write to T1 or T3 follows `tools/probe/RESET-PROTOCOL.md` (inventory → the owner looks →
  he confirms → act).
- **Every vocabulary change ends with a grep for the old name** (standing rule 7).

**Ask First:**

- **Every question below is open until the owner rules it, and Dev stops at each one** it reaches unruled.
- **A closure that turns out bigger than its triage says** stops, and the entry is re-homed to a named story instead of
  growing this one.
- **Any render-matrix re-baseline** (R-116 — the owner approves a re-baseline; DW-171 swaps baselines).
- **Any T1 or T3 change beyond a probe's own restored fixture** (Question 14).

**Never:**

- **No entry is deleted and no id is renumbered** (the ledger's own format).
- **No design file is edited** (AD-35): a pilot's defect goes to its category story.
- **No migration and no Schema phase**: the one entry that wants one (DW-267) stays with Story 7.13, which already
  carries it.
- **No new runtime dependency**; no BMAD update (R-91); no refactor an entry does not name.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| An orphaned entry | an open entry whose only owners are done stories | the gate refuses the commit and names the entry and what to do | exit 2, like `dup_dw_ids` |
| A later owner whose text is silent | an open entry naming Story N, whose card in `epics.md` never names its DW id | refused the same way, unless N's spec names it | exit 2 |
| Two `site_settings` writers race | a daily check lands between the editor's re-read and its write | both keys survive | the loser re-reads and re-patches, three tries |
| A search finds nothing | Projects or Sites, `?q=zzzz` | the sentence ends with **Clear search**, back to the unfiltered page | none |
| A window closes over a searched list | Sites `?q=ghost5`, Manage keys opened then closed | still `?q=ghost5`, still filtered | none |
| Paste from a Google Doc | a bold and an italic word into a rich field | both marks kept; Docs' `<b style="font-weight:normal">` wrapper adds none | marks outside the field's allowed set dropped |
| A tab holding editing closes | two windows, A editing, A closed | B can edit a few seconds later; a reload of A keeps A editing | a late release matches nothing |
| A misplaced doc is saved | `a24/1` posted under `home` | 422 before the RPC; nothing stored | the editor opens as before |
| A connect to a private address | `https://127.0.0.1.nip.io` | refused with the existing unreachable sentence and a `blocked` audit row | T1 still connects |
| Ghost busy at connect | a 429 or a 5xx | "…just now. Try again in a moment." (not "check the keys") | a 404 stays an address problem |
| A hand-picked list past 100 | `LIST_LIMIT + 1` picks | every pick, in picked order | one read per 100 |

</frozen-after-approval>

## The triage

Derived at Create from the ledger at `6bf7c4e0`, each entry read in full and checked in the code at that commit.
**Re-derive it at Dev** (Verification's first command) and re-triage anything new.

### Already fixed — closed with their evidence

| Entry | The evidence to re-execute at Dev |
|---|---|
| DW-101 | `orbit-weekly.test.ts:254-258` asserts neither Ghost major has a Lexical NFT renderer; `:323-331` holds the article to C4 minus NFT; R-67 keeps NFT unstyled |
| DW-166 | the rule is `docs/section-authoring.md:406-419`; `tools/check-snapshots.mjs:331-347` detects a repeated title with a planted control, `:426-436` fails a built panel |
| DW-173 | every `matrix.yml` run after 2026-09-17 green, every nightly included (GitHub Actions API); a failure uploads `test-results/` (`matrix.yml:77-83`) |
| DW-175 | the entry's own two probes re-run at Create: fresh-connection and keep-alive requests to `app.inflozo.com` all answered; its own rule says close with the runs; signed-in stalls remain DW-204's |
| DW-197 | `settings/actions.ts:95,131-135` sends one `sync_project_doc` with `p_base`; the migration's function refuses a stale revision; walk step 53 (b) |
| DW-206 | `section-picker.tsx:280` (R-203); `floor.spec.mjs:447`, `journey.spec.mjs:3260`, walk step 98 |
| DW-263 | `epics.md` Story 10.107 ("chosen, never placed") and 10.109; `placement.ts:33` `NON_PLACEABLE` |

### Closed by this story — by group

| Group | Entries |
|---|---|
| **A — the ledger and the plan** | DW-111, 118, 132, 140, 143, 148, 164, 172, 177, 179, 217, 227 · the new orphan check · Questions 2, 5, 11, 12, 13 |
| **B — accounts, sites and connections** | DW-14, 25, 27, 29, 32, 41, 47, 50, 52, 57, 58, 59, 65, 67, 71, 74, 77, 81, 82, 83, 84, 85, 86, 90, 91, 92, 271, 272 · Questions 10, 15 |
| **C — the section runtime, the library and the recordings** | DW-4, 96, 99, 103, 104, 113, 125, 127, 129, 147, 159, 161, 168, 171, 186, 196, 213, 224, 228, 237, 288 · Question 14 |
| **D — the checks and the walks** | DW-117, 162, 174, 182, 183, 201, 204, 208, 211, 216, 219, 220, 222, 236, 245, 246, 251, 257, 269, 279, 284, 285, 287, 291 |
| **E — the editor** | DW-102, 181, 187, 189, 198, 199, 205, 207, 223, 225, 226, 229, 235, 240, 241, 242, 243, 244, 248, 250, 256, 258, 259, 270, 273, 275, 278, 280, 281, 282, 283, 290 · Questions 3, 4, 6, 7, 8, 9 |

### Left open, and by whom

Each entry's `owner:` line becomes the story named here. **"add"** means that story's acceptance criteria in `epics.md`
gain the sentence, with its DW id; **"carried"** means its text already says it (quoted at Dev in the resolution note).

- **DW-11** → 6.2 · add: "And each preset's palette is authored into Appendix D and read from there alone: the export's
  kit PACKS and the Calibration Set's S7a swatches are calibration only and disagree on Tangerine's and Ink's accents,
  and Appendix D's Ink ('B/W + one red') is neither — 'matches S7a' means the roster's names, order and layout, and
  where a drawing and Appendix D disagree on an accent the owner rules before the preset ships (R-83, DW-11)."
- **DW-15** → 6.2 · add: "And `apps/web/lib/style-pack.ts`'s `PRESETS` (Paper alone, read off D4a's pack cell) is
  regenerated from the authored Appendix D palettes, so the dashboard card's placeholder and D4a's pack cells paint
  from the values the canvas does (DW-15)."
- **DW-23** → 12.2 · carried ("`pro_past_due → free` on grace expiry").
- **DW-39** → 12.7 · add: "And FR-P1's notice to the previous address leaves Supabase's plain default: a branded
  template beside `supabase/auth/email-change.html`, pushed through `mailer_subjects_email_changed_notification` and
  `mailer_templates_email_changed_notification_content`, whose 'contact support' names a channel that exists — the
  owner is asked which (R-83, DW-39)."
- **DW-42** → 12.5 · carried ("FR-A5's two Dodo calls land here with the adapter").
- **DW-46** → 15.5 · add: "And a failed scheduled job reaches a person: the account purge (which answers 500 when an
  account failed) and the site-health cron report each failure to Sentry as an error with an alert the owner receives,
  never only a red line in Vercel's log (DW-46)."
- **DW-49** → 15.8 · add: "And Live's key-store connection is born narrow: `SUPABASE_DB_POOLER_URL` connects as a
  login role holding only the `vault` and `private` grants DW-49 lists, with a migration, a SCHEMA.sql block and an
  RLS-TEST assertion that it holds nothing else (DW-49)." — and **DW-50** joins it here if Question 15 is ruled
  option 2.
- **DW-51** → 7.18 · add: "And the upload goes through the Admin chokepoint, which sends JSON only today: a `FormData`
  body passes untouched with no `Content-Type` set by Inflozo, proved by the first real upload to T1 and T3; Story
  7.17's `routes_upload` uses the same shape (DW-51)."
- **DW-54** → 7.18 · add: "And once the first allowed Ghost write exists, the chokepoint's refusal is driven live: the
  harness asks the deploy path for a write outside `ADMIN_WRITES` and reads a `denied` audit row with no request
  reaching T1, beside the real upload's `admin_write` row (DW-54)."
- **DW-60** → 7.26 · add: "And B15's Preview-only card gains the frame's **Export theme zip** beside **Re-check plan**
  and a greyed **Ship it** with its reason, `PREVIEW_COPY.body` regains its export sentence, and `probe-rule.test.ts`'s
  absence assertion flips in the same change (DW-60)." · and 15.7 · add: "And the captured payload decides whether B15
  may name the tier ('Ghost(Pro) Starter') or keeps 'this plan' (DW-60)."
- **DW-66** → 9.5 · add: "And FR-C4's deferred half lands here: S2c offers the site's stored announcement bar as a seed
  — its text into a placed A2 design's message, its visibility onto Show to, its colour onto the Background role — and
  once that bar is deployed, a consented one-click 'turn Ghost's own bar off' makes `announcement_clear`'s first call;
  declining leaves both bars (DW-66)."
- **DW-68** → 15.1 · add: "And before the suite is trusted, DW-68's stall is diagnosed: the suite signs in against any
  deployment URL and each 30–60 s stall is matched to its Vercel runtime-log invocation, so a red run names the
  deployment, the platform or the runner (DW-68)."
- **DW-70** → 6.6 · add: "And S2c's project chooser is drawn in the Claude Design project from S2c before this story
  builds on it (R-74), and its fieldset takes the scroll bound that frame draws (DW-70)."
- **DW-75** → 7.20 · carried ("FR-C6's 90-day orphan purge is built here").
- **DW-79** → 7.20 · add: "And the purge's 90 days and the Sites card's 'kept for 90 days' have one home: the job takes
  `ORPHAN_SNAPSHOT_DAYS` rather than a second literal in SQL, and `connect-rule.test.ts`'s agreement test follows it
  (DW-79)."
- **DW-87** → 9.1 · carried ("FR-C5's compatibility watch is built here").
- **DW-88** → 11.2 · add: "and `STARTER_DOOR.reason` is deleted and the door's 'Ten' is derived from the roster the
  chooser draws (DW-88)."
- **DW-105** → 10.95 · add: "And #10 Slim's Background role is R-103's no-value lock — `universals.bg` `values: []` with
  its sentence and no `data-bg` on its root — never the frame's 'None' and never locked at Base (DW-105)."
- **DW-106** → 9.1 · add: "And #3 Stacked Masthead's date prints written out in the site's language as its frame draws
  it ('Thursday, 19 August'), by one rule both emitters share with the site's locale and timezone handed in (AD-1),
  never the stored YYYY-MM-DD (DW-106)."
- **DW-107** → 9.8 · add: "And #12 Takeover's picture carries P0·9's Image focus in the Image Picker popover, and this
  story first writes into AD-3 how a per-image focus reaches the page on both emitters — a compiler hint, never an
  inline style (R-51, DW-107)."
- **DW-108** → 7.4 · add: "And a theme that draws any Tabler icon ships Tabler's MIT notice verbatim
  (`packages/library/icons/LICENSE-tabler.txt`) as a file, and the inline icons' bytes count in the theme-size budget
  (R-26, DW-108)."
- **DW-109** → 7.13 · add: "And the callout panel does not ship S14's 'Background role (Base · Surface · Tint · Accent)'
  under the section universal's name with other values (R-53, R-170): the owner is asked (R-83) whether the row is
  renamed as a card treatment or offers the section's roles, and his answer is built (DW-109)."
- **DW-110** → 9.1 · add: "And #4 Overlay asks whether the section BELOW it carries a loadable image through a
  below-facing `ADJACENCY_NEEDS` value this story adds, answered by AD-37's compiler from the placement list (R-8,
  DW-110)."
- **DW-115** → 9.1 · carried (R-121's icon-slot criterion).
- **DW-123** → 9.2 · add: "And #6 Drawer-First's and #8 Utility + Nav's social rows read the site's social `@site` keys,
  which Ghost ships from 6.36.0 (MEASUREMENTS §41e; `matrix.json`), not the 6.38.0 of A1's spec §0·8, which is the
  `{{#social_accounts}}` helper's (DW-123)."
- **DW-124** → 9.10 · add: "And #8 Sitemap's author group, ranked by post count, declares `count.posts` — a `{{#get}}`
  include and a `count.posts desc` order that `DataBinding`, `validate.ts`, `getExprs` and the offline resolver learn
  here, executed on T1 and T3 (DW-124)."
- **DW-126** → 7.16 · add: "And a custom template reached through a route this flow authors is offered only what that
  route supplies — appendix B.1 §3's route form, a flat root carrying exactly its `data:` keys — derived from the route,
  not the matrix's Admin-entry row for `custom-{name}.hbs` (DW-126)."
- **DW-134, DW-135** → 7.5 · add: "And every emitted template is inspected too: no `<script>` but the one `defer` tag for
  `main.js`, `cards.js`'s where designed, and an inline script only when its bytes are a named repo-authored source
  compared byte for byte (DW-134); and `cards.js` is no exception: `checkThemeJs` takes the vendored chunks as its
  source and refuses a `cards.js` that is not their concatenation (DW-135)."
- **DW-137, DW-139** → 7.8 · add: "And every emitted element and attribute is held to the FR-G8 pin — one below Widely
  that `baseline.json` does not name is refused, a named `html` entry held to its Tier-2 condition (DW-137) — and its
  CSS check refuses a Tier-3 at-rule form, selector or function by name, one probe per web-features family diffed at the
  pin (DW-139)." *(Placed by the owner's 4.8 Q2 ruling.)*
- **DW-141, DW-142** → 7.12 · replace the parser line with: "validation parses each override with the
  `intl-messageformat` 5.4.3 both Ghost majors bundle, plus appendix-h1 S3's placeholder rule — never
  `@formatjs/icu-messageformat-parser`, which accepts `'{'` — and the whole-page 500 is observed on T1 and T3 before the
  surface promises it (DW-142)" · and qualify "`{{t}}` escapes" with: "except through `{{plural}}`, whose `(t …)` prints
  unescaped (MEASUREMENTS §44): an override for a key passed to `{{plural}}` is refused if it holds `<` or `&` (DW-141)."
- **DW-144** → 9.6 · add: "And before `countdown` ships, the owner rules (R-83) how one day and one hour read — the
  catalog says '1 days' and '1 hours', A2-6's frame draws 'hrs' — and the catalog, appendix-h1 §3.3a and the module's
  `strings` carry his answer (DW-144)."
- **DW-145** → 7.12 · add: "And before this surface is built — and before Epic 9 authors a content model — the owner
  rules (R-83) what a non-English site shows for a section's untouched English starting words (DW-145)."
- **DW-146** → 7.5 · carried ("no module contains a visitor-facing literal").
- **DW-149** → 10.112 · add: "And #1 Numbers is built in R-109's indicator form — 'Newer posts · 5 / 11 · Older posts' —
  from a frame redrawn in the Claude Design project before this story opens (DW-149)."
- **DW-150** → 9.1 · carried (R-111's navigation partial) · 9.2 · add: "And #6's takeover and #7's panel are designed in
  the editor's resting no-JS state, or the owner is asked to pin them open while their contents are selected (DW-150)."
  · 7.3 · add: "`default.hbs` carries the `<main>` target the header's skip link lands on (DW-150)."
- **DW-151, DW-156** → 10.54 · add: "And a value another control switches off is greyed on its own with its reason —
  Three Up's 'Three lines' at Four per row — a per-value dependency the whole-control `disabledBy` cannot express
  (DW-151); and reading time prints as Ghost's own `{{reading_time}}` does — '1 min read' at 0 and 1 minute — through a
  translatable catalog form recorded on T1 and T3 first (DW-156)."
- **DW-152** → 10.75 · add: "And `{members}` compiles to `{{total_members}}` on the theme and to the site's rounded
  member count on the canvas, with an agreement row (DW-152)."
- **DW-153** → 10.79 · carried ("each design matches its frame") and 7.3 · carried (the `show_title_and_feature_image`
  gate).
- **DW-154** → 10.4 · carried ("#13 Latest Post … matches its frame"); record that 5.4's half is done
  (`carriesMemberVisibility`, `memberVisibility`).
- **DW-155** → 6.1 · add: "And the reference set takes the frames' page geometry as Normal — content 1,296 px, side
  margins 72 · 40 · 20 px at 1440 · 834 · 390 — with the margin its own Appendix D row beside the 24 px gutter, and the
  pilots re-baselined (DW-155)."
- **DW-157** → 11.2 · add: "And before the chooser is built, every starter's composition in Appendix E is re-read
  against `tools/export-roster.py`, and each design the 2026-09-04 merge renamed gets the owner's pick of successor —
  Ledger's among [Free] designs (FR-O4) (DW-157)."
- **DW-160** → 10.4 · add: "And #13 Latest Post ships no sample-site link as a default — its secondary action renders
  nothing until the customer picks a destination (FR-F8) — and the validator refuses a design default on
  `orbit-weekly.example` (DW-160)."
- **DW-165** → 9.2 · carried (naming two queries) · 9.1 · add: "And A1's Nav children is declared on the design's
  `dataBindings` and drawn as a Data-group row — the first category query setting `dataRows` draws (DW-165)." Record
  the settled halves (the Count and Order titles; R-36's absent "When nothing matches").
- **DW-169** → 6.2 · add: "And three of the twelve, picked by the owner (R-83), become the render matrix's reference
  packs — the only pack files `tools/matrix/cases.mjs` reads — re-baselined as NFR-6(a)'s mass rebaseline (DW-169)."
  `docs/render-matrix.md:36` names 6.2.
- **DW-170** → 10.83 · add: "And the render matrix's accessibility scan stops at the post body's edge: each case
  excludes the element bound to `{{content}}`, derived from the binding, and a case carrying the binding with nothing
  excluded fails (DW-170)."
- **DW-178** → 9.1 · add: "And before A1's social rows are built, the owner rules (R-83) whether social icons follow the
  platform Ghost names — the 29 August ruling for footers, library-wide — or are picked per row, and Story 10.50 builds
  the same answer (DW-178)."
- **DW-180, DW-247** → 10.1 · add: "And a field whose spec advises a length rather than capping it (the headline: 'the
  editor advises at 90 characters') carries an advisory counter declared beside `maxChars` that turns muted past the
  advice and never refuses a character (DW-180); and #2's Value source Member count prints `{{total_members}}` on a
  linked site from member counts the site snapshot stores, executed on T1 and T3 (DW-247)."
- **DW-185** → 9.5 · add: "And before A2 is built, the owner rules (R-83) which categories carry Member visibility —
  `prd.md:909` and `:954` name four, `control-groups.json` gives it to ten — and both are corrected to his answer
  (DW-185)."
- **DW-191** → 10.79 · add: "And #1 Centred, re-authored from its pilot, compiles to `page.hbs` as well as `post.hbs`
  under A24's page rule, so `page.hbs`'s default stack keeps its header row (DW-191)."
- **DW-192** → 10.104 · add: "And the Private canvas becomes reachable: the Admin settings snapshot records Ghost's
  `is_private` (read in source or on T1/T3 first), the switcher offers Private only for a linked site that reports it,
  and a refused `/private` still answers the app's 404 synchronously (DW-192)."
- **DW-195** → 6.5 · add: "And a section's own dark override reaches a visitor as a per-instance custom property
  emitted into the token block, AD-30 amended to name that expression before Epic 9 authors stylesheets against it
  (DW-195)."
- **DW-200** → 9.6 · add: "And the editor stops receiving every placeable design on load: it asks the server for a
  design a doc names that it has not got, with undo's vanished-design guard and the ring's first paint unchanged, and
  the payload measured before and after (DW-200)."
- **DW-214, DW-231, DW-286** → 9.1 · add: "And the owner's test includes a design change on A1's ring in his own editor,
  where he sees the 180 ms settle and approves it (DW-214); the navigation partial's classes are recorded on an
  archive's page 2 as well, where Ghost adds `nav-current-parent`, and `navigationItems` draws exactly the partial's
  classes (DW-231); and a dark override a design only remembers (R-205) is counted by the row, the moon and D6a, or
  named where they say 'Nothing to clear' — asked of the owner first (R-83, DW-286)."
- **DW-232, DW-233** → 10.112 · carried (the two choices the owner rules before it is built).
- **DW-234** → 7.3 · add: "And a page 2 of its own with no visible main feed compiles as designed with FR-H2's SEO guard
  on its `/page/N/`, as a feed-less `tag.hbs` does (DW-234)."
- **DW-238** → 7.18 · add: "And pressing Ship it in a session reading along first opens D8g's take-over
  (`lock-takeover.tsx` with D8g's strings), and the wizard never starts without the lock (DW-238)."
- **DW-249** → 15.7 · add: "And on the same Starter site the editor's Content API reads answer VERIFY-AT-BUILD's three
  questions — whether an edge 429 carries `access-control-allow-origin`, the edge's limits against `REQUEST_CEILING` and
  the 60 s cache, and whether the `*.ghost.io` admin origin serves the Content API like the public domain (AD-23,
  DW-249)."
- **DW-252** → 7.16 · carried · **DW-253** → 7.18 and 7.3 · carried · **DW-254** → 7.9 · carried · **DW-260** → 7.18 ·
  carried · **DW-262, DW-265** → 10.107 · carried · **DW-264** → 10.14 · carried · **DW-266** → 10.83 · carried ·
  **DW-267** → 7.13 · carried (its Schema phase drops the column).
- **DW-261** → 7.3 and 7.6 · replace "AD-5's second stated exception" with: "AD-5's second exception, which the owner
  rules before it is built — AD-5 states only `PAGE_NUMBER_HBS` (R-83, DW-261)."
- **DW-268** → 11.11 · add: "And its paywall is one of A32's [Free] pair as the finished roster marks it — 'Hard Stop
  Card' is no A32 design (DW-268)."
- **DW-276** → 9.7 and 10.78 · add: "And the corner design's default corner (#11 Toast; #14 Slide-in Card) is decided
  against Ghost's floating Subscribe button, which the canvas draws bottom-right, or the spec records why it stays —
  asked in R-83's shape (DW-276)."

### The owner's

Questions 2–15 below. Each closes, is built, or moves to the story it names as he rules.

## Code Map

**The ledger and its readers.**

- `_bmad-output/implementation-artifacts/deferred-work.md` — the source; `### DW-<n>:` blocks; one-line fields.
- `tools/story-board.py` — `load_deferred` / `dw_closed` (:594-660) are the parse; `main()` (:2389) holds the gate's
  refusals (`dup_dw_ids`, `unclassifiable_questions`) — the orphan check joins them; `demo()` is the self-check the gate
  runs, where its controls go.
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — which stories are done; `epics.md` `### Story N.M:` blocks.

**Group A — the ledger and the plan.** `_bmad-output/planning-artifacts/epics.md` (E9 preamble :3977-4000, each
category's first story "(#1 and #2)" lines e.g. :4043, every later story's "all of them are **Pro**" line, the library
stories' module lines :4046 :5825 :7169, Stories 9.4 :4107, 9.8 :4218, 10.5 :4490, 10.25 :5023) ·
`prds/prd-Inflozo-2026-08-17/prd.md` (FR-G2 :281, the tiering note :858, NFR-2 :474, Appendix G) ·
`prds/…/sections-inventory.md` (:12 "positional", §3–§4 default stacks :817 :820 :842, Invariant 1 :865) ·
`packages/section-runtime/src/synthesize.ts:68-89` (`SYNTHESIS_DEFAULTS`) · the export's `**[Free] designs:**` lines
(read-only, R-74) · `tools/export-roster.py`, `tools/inventory-gen.py` · `tools/doc-audit.py` (the date stamp :1589) ·
`tools/build-board.py:329` · `tools/category-prompts.py:382` · `tools/story-board.py:1667` · `tools/hooks/commit-msg:85-125`
· `tools/check-baseline.mjs:248,414` · `tools/check-catalog.mjs:13-18,53,74,153-157` ·
`prds/…/appendix-h1-string-catalog.md` §2 · `docs/section-authoring.md` (:257, prop types :485 :530, :822) ·
`prds/…/reconcile-designs-decisions.md` (R-175) · `tools/design-patch-prompts.py:522` ·
`architecture/…/VERIFY-AT-BUILD.md` (row 27) · `docs/project-context.md` (Question 5).

**Group B — accounts, sites and connections.** `apps/web/server/site-probe.ts` (`probeSite` :71-146, `readSettings`
:216-231) · `apps/web/app/(app)/app/(authed)/sites/actions.ts` (`answerPortal` :563-582, `answerPlan` :590-615,
`connectSite`'s store catch :379-404 and site write :346-367, `disconnectSite` :1069-1071, `saveKeys` :1260-, the Content
save :1398) · `apps/web/server/ghost-admin/index.ts` (`remove` :214-259, `fetchWithKey` :375-386,
`findSiteByAdminKeyId` :470) · `apps/web/lib/admin-rule.ts:230` · `apps/web/lib/connect-rule.ts` (`normaliseSiteUrl`
:55, `SITES_EMPTY.noMatch` :184, `KEYS.staff.ask` :318, `rollHint` :326, `connect_failed` :516) ·
`apps/web/lib/probe-rule.ts` (`brandOf` :209-232, `brandPath` :358, `brandPopupPath` :364) · `sites/brand-screen.tsx:76`
and `sites/brand/loading.tsx` · `sites/panel-modal.tsx:91` · `sites/brand-panel.tsx:147` · `sites/keys-panel.tsx:288` ·
`sites/(list)/page.tsx` (:61-101, :152-221, :310) · `(dashboard)/page.tsx:165` and `(dashboard)/loading.tsx` ·
`components/controls/icon-picker.tsx:307-313` (the Clear search idiom) · `components/kit/submit.tsx:136` ·
`apps/web/lib/entitlement.ts:38-47` · `apps/web/lib/plan.ts` · `app/api/cron/purge-accounts/route.ts:67-73` ·
`apps/web/lib/purge-rule.ts:25` · `apps/web/server/db.ts:64` · `app/(app)/app/sign-in/actions.ts:103-104` ·
`(authed)/account/actions.ts:406-426` · `app/(app)/app/error.tsx:56` · `sign-in/sign-in-form.tsx:156-157` ·
`apps/web/server-wiring.test.ts:353` · `tools/probe/run-verify-ghost-admin.py` (argparse :4386-4395, the child
:4348-4349, `notFoundInMain` :3281-3311, `BRAND_KEYS` :4483) · `tools/probe/run-verify-passkeys.py` ·
`tools/probe/run-verify-dashboard.py` · `tools/probe/check-access.py` · `tools/probe/configure-supabase-auth.py`
(:23-24, :137-141, :243-251, :294-299) · `eslint.config.js:88,148-151`.

**Group C — the runtime, the library and the recordings.** `packages/section-runtime/src/core.ts` (`RenderInput` :125,
`bindingRefusals` :717, `BARE_HELPERS` handling :930-972, `stampControls` :1312, `data-i18n-*` :1507-1524, `renderTree`
used :1832 :1852, tidy :1824 :1853) · `src/marks.ts:266-268` · `src/tokens.ts:184-188` (`LINK_RULES`) ·
`src/doc-schema.ts:68` · `src/agreement.test.ts` · `packages/library/src/vocabulary.ts` (:401 `BARE_HELPERS`, :450
`GHOST_SLUG_RE`) · `src/validate.ts` (:84-120 `memberAsks`, :170-171, :442, :583, :712) · `src/registry.ts:155,203,255` ·
`packages/library/contexts/matrix.json` · `packages/library/icons/` and `src/icons.ts:16` · `tsconfig.base.json` ·
`tools/stress/sections.js:37,115` and `compile.js:29-35` · `tools/matrix/cases.mjs:63` · `apps/web/lib/pilots.ts:73` ·
`(authed)/pilots/review.tsx:63` · `tools/check-snapshots.mjs:136` · `tools/probe/record-cards.py:271-281` ·
`record-contexts.py:342` · `record-page-number.py:260` · `record-shim.py:585-596` · `run-verify-core.py:295-306` ·
`tools/probe/RESET-PROTOCOL.md` § Ghost.

**Group D — the checks and the walks.** `tools/probe/run-verify-editor.cjs` (`steady` :373, decoders :731 :977 :1049,
step 36 :1926-1981, 66b :3187, die pips :3986-4009, step 89 :4069-4354 with the reload :4291-4297, step 90 :4603-4612,
the signed-out loop :5998-6002, step 79 :5856, step 9 :6661-6678) · `run-verify-controls.cjs` (:79 :82 :472 :513,
:700-720) · `run-verify-pilots.cjs:89,92` · `run-verify-live-content.cjs:550` · `run-verify-lock.cjs` ·
`record-edit-lock.py:450-463,571,599-603` · `tools/keyboard/journey.spec.mjs` (:489 console pattern, :942-962 fixture
ring, :1277-1300 pips) · `floor.spec.mjs` (:4 pointer rule, :60-79 phone stop) · `apps/web/app/(app)/app/harness/`
(`editor/layout.tsx:65-101`, `canvas/route.ts:26-55`) · `(authed)/canvas/route.ts:22-49` · `apps/web/pilots.test.ts:121-131`
· `controls.test.ts:18-27` · `style-guide.test.ts:84-114` · `doc-schema-jitless.test.ts` · `apps/web/lib/style-pack.ts:39`
· `new-project-sheet.tsx:13` · `apps/web/app/layout.tsx:2` · `apps/web/tokens.test.ts:218-222` · `apps/web/next.config.ts:8-12,71-79`
· `(editor)/read.ts:290` · `components/shell/shell.tsx:46-47` · `components/editor/small-screen-notice.tsx:31,43-47` ·
`apps/web/lib/journal.ts:259` · `.github/workflows/ci.yml` · `supabase/tests/rls.sql` ⇐ `architecture/…/RLS-TEST.sql:846`.

**Group E — the editor.** `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` (`useHanded` :1222,
`recordViewed` :1321-1337, `flush` :1601 :1638 :1652, `land` :1710-1760, lock release :1939-1943, `chooseSubject`
:2251-2283, `point` :2388, `paint`'s edit reads :2546-2550, the chips :3696-3709, compact flip :3449-3455, picker :4029
:4031 :5295, pill `hidden` :4904, grip :4170, the chip `data-members-off-chip` :4552, `#editor-said` :5108) · `read.ts`
(:183, :196-220, :276-280) · `projects/[id]/sync/route.ts` (:42-114) · `components/editor/save-state.tsx:81-82` ·
`components/editor/section-picker.tsx` (:156, :197, :280) · `components/editor/section-pill.tsx` ·
`components/kit/layers-row.tsx:69-111` · `components/editor/layers.tsx` (:122, :450, :497-498) ·
`components/controls/sidebar.tsx` (:222, :272, :464-465, :548) · `components/controls/item-list.tsx:105-107` ·
`apps/web/lib/` — `canvas-layer.ts` (:48 :65 :105-120), `canvas.ts` (:131 :257 :262-267 :287), `live-content.ts`
(:49 :94-95 :105-139 :216-219 :541), `ghost-surfaces.ts` (:148 :160), `probe-rule.ts` (:87 :545-572 :604 :633-649),
`paywall.ts` (:76-87 :121), `pilots.ts:132`, `lock.ts:174`, `reorder.ts:49`, `editor.ts:187-190`, `behaviours.ts:64-67`,
`local-store.ts:100`, `style-guide.ts:77`, `renders.ts:97-99`, `inline.ts:271`, `globals.css:398-399`,
`greyed.ts:67-69` · `packages/section-runtime/src/marks.ts:597-660` · `packages/library/orbit-weekly/` (corpus media) ·
`app/api/…/lock/route.ts:122` · `tools/perf/fps-trace.mjs`.

**Surfaces this story touches, and their frames (R-74).** Projects' no-match — `S3 Dashboard.dc.html` S3a with P0's
no-match rule (`P0 Editor Primitives - Spec.md:236`) · Sites' no-match and its windows — `S11 Sites.dc.html` S11a,
`S11e Manage Keys Popup.dc.html`, `S2 Onboarding.dc.html` S2c · Connect's sentences — S2b·2 / S11b · Layers' pictures
— `S4 Editor.dc.html:54-58` (rows) and `D8 Editor Below 1440.dc.html:66-70` (rail) · the Layers hover — S4b · the
Section Picker — `S5 Section Picker.dc.html` S5a (its ⌘K chip :34) · the save message — B6 in
`B Missing Surfaces.dc.html` · the lock's surfaces — B5a–c · the preview subject — B9 and D5e · the Paywall — `C Post
Body.dc.html` C3a · the style-guide article — C4 · the capped list's header — P0-3 · the canvas pill's shadow —
`P0-1 Inline Text Toolbar.dc.html:142` · the skeleton — S4a's card · Ghost's floating button — Ghost's own look
(`MEASUREMENTS.md` §55; no frame draws it).

## Tasks & Acceptance

**If Question 1 is ruled option 1, each group below becomes its own story (A → 5.24a … E → 5.24e) and takes its tasks,
its owner-test rows and its verification lines with it; this spec keeps the triage and becomes 5.24a.**

### Group A — the ledger and the plan

- [ ] `tools/story-board.py` — **the orphan check**: `orphaned_entries()` refuses at exit 2 an open entry whose owner
  line names no story that is not done in `sprint-status.yaml`, or whose living owners neither name its DW id in their
  `epics.md` block nor in their spec; the message says what to do. `demo()` gains a done-owner fixture and a silent-owner
  fixture that must be refused and a living, naming owner that must pass. It lands in the same commit as the re-homing
  below, since today's ledger fails it; if Question 1 splits the sweep, each sub-story's card lists the entries it owns.
- [ ] `epics.md` + `deferred-work.md` — **re-home every entry under *Left open***: add each sentence to its story's
  criteria word for word; rewrite each entry's `owner:` to that story with a dated note keeping the old owner; the
  entry stays `open`.
- [ ] `deferred-work.md` — close every entry under *Already fixed* with its evidence re-executed at Dev.
- [ ] `docs/section-authoring.md` — **DW-111** (:257: read `universals` from the drawn panel, never the spec table),
  **DW-179** (prop types: visible authored text is `richtext` with the four marks unless the spec narrows; a link label
  drops `a`), **DW-227** (:822: no design offers carousel autoplay) with R-175's dated note and a library test that no
  design declaring `carousel` carries an autoplay or interval control (control: a fixture with one fails).
- [ ] `prd.md` Appendix G — **DW-217**: the collaboration bullet records that `project_template_prefs` becomes per user,
  a Schema-phase migration, when seats ship.
- [ ] `tools/design-patch-prompts.py` — **DW-118**: a note beside P0's prompt, outside the copied text, that R-104
  superseded "a curated Tabler set"; the prompt stays as sent.
- [ ] `tools/doc-audit.py` + `epics.md` — **DW-164** (the library stories' module lines become the sentence naming each
  design's own Behaviour module line, never `core`; a guard fails a library story whose module line lists modules — red
  on HEAD) and **DW-177** (Stories 9.4, 9.8, 10.5, 10.25 name A1 #16 Reveal, A2 #15 Triple, A4 #18 Overlap Card, A9 #15
  Ledger; a derived check that every live roster design is named in a story of its category — red on HEAD naming those
  four).
- [ ] `tools/doc-audit.py`, `build-board.py`, `category-prompts.py`, `story-board.py` — **DW-132**: a page whose content
  is unchanged keeps its on-disk date; only a content change stamps today. Control: a self-check regenerating each page
  with the date faked a day ahead must produce identical bytes (red under the old rule).
- [ ] `tools/story-board.py` `demo()` — **DW-172**: run `tools/hooks/commit-msg` in a temporary repo: a Dev commit with
  one unticked task exits 1 naming it, a Dev commit with no spec exits 1, all ticked exits 0.
- [ ] `prd.md` NFR-2, `tools/check-baseline.mjs`, `VERIFY-AT-BUILD.md` row 27, Stories 7.5/7.33 — **DW-140**: "< 40 KB
  gzipped (40,960 bytes, gzip level 9)", `size-limit` run with `gzip: true`; the check asserts its size equals
  `zlib.gzipSync(file, {level: 9}).length` and that NFR-2's sentence names what it checks; grep "brotli".
- [ ] `tools/check-catalog.mjs` + appendix-h1 §2 — **DW-143** (every key of every committed `catalog.json` is still live,
  retired or superseded; failure names the key and its last commit; an in-memory previous catalog with an extra key is
  the control) and **DW-148** (the status form "**superseded by** `key`", compared both ways; a cloned catalog is the
  control).
- [ ] **Question 2** as ruled — option 1: in `epics.md` each category's first story trades its misplaced designs for the
  owner's pair (their design-specific criteria move with them) and every "all of them are Pro" line becomes true;
  FR-G2, the tiering note, `sections-inventory.md:12` and Invariant 1 name the owner's pick; `SYNTHESIS_DEFAULTS` and
  §3–§4 take A25 #2, A28 #1 and A29 #1 (`synthesize.test.ts` derives its dropped set, so it follows); a doc-audit check
  that each category's first story names its `[Free] designs:` pair from the export — red on HEAD.
- [ ] **Questions 5, 11, 12, 13** as ruled — Q5 option 1: the one-hour limit written into `docs/project-context.md`'s
  security rules and DW-40 closed on the ruling; Q11 option 1: DW-64 closed on the ruling; Q12 option 1: FR-H7's
  sentence stated as the rule any later move follows, DW-122 closed; Q13 option 1: the member-state pass added to §4's
  owner check and to every category's owner-gate story, DW-221 closed.

### Group B — accounts, sites and connections

- [ ] `apps/web/server/site-probe.ts` — **DW-65, DW-271**: one helper every `site_settings` writer goes through
  (`probeSite`, `readSettings`, `answerPortal`, `answerPlan`, and the Content save — **DW-84**'s second half): it reads
  `site_settings, updated_at`, patches, updates `.eq('updated_at', …)`, and on no row re-reads and re-patches, three
  tries. **DW-272**: `readSettings`' body moves to `server/settings-reread.ts` (relative imports) taking `{admin, call}`.
  Controls: a node test lands a second writer between read and write (both keys survive; drop the `eq` → red); a fake
  admin whose owned-row read is null never calls `call` (reorder → red); `server-wiring.test.ts`: no `.update({…site_settings`
  outside the helper.
- [ ] `sites/brand/layout.tsx` (new) — **DW-67**: the site read, `hasBrand` and `notFound()` move into the segment's
  layout, which sits above its own `loading.tsx` boundary; the address stays `/sites/brand?site=…` (the layout reads it
  through `SEARCH_HEADER`, as `(dashboard)/layout.tsx` does); the skeleton stays. Control: `brand-none` asserts HTTP
  404 (inside the boundary it answers 200).
- [ ] `apps/web/lib/probe-rule.ts` — **DW-71**: `Brand`/`brandOf` drop icon, cover and description; `hasBrand` checks
  every field `Brand` promises; the harness's `BRAND_KEYS` follows. Control: `probe-rule.test.ts` pins the keys and
  refuses `{accent: 42}`.
- [ ] `server/ghost-admin/index.ts` + `sites/actions.ts` — **DW-77**: `remove(kinds[])` clears both in one transaction;
  `disconnectSite` makes one call. Control: `server-wiring.test.ts` counts one `remove(` with both kinds.
- [ ] `lib/connect-rule.ts` + `sites/actions.ts` — **DW-81**: `oneCredential()` refuses a post carrying more than one
  credential field before anything is stored. Control: its test, and a harness `keys-forged` post that changes no row.
- [ ] `sites/*` — **DW-82**: one helper builds `/sites` with the current `q`; the popup paths, the modal's close, both
  panels' ✕ and Cancel and every action's landing use it. Control: a harness step searches, opens and closes each
  window by ✕, Esc and a save, and `?q=` survives.
- [ ] `sites/panel-modal.tsx` — **DW-84**: while a Kit `Submit` inside is busy, Escape and the backdrop do nothing and ✕
  and Cancel are `aria-disabled` (R-98). Control: a harness step holds the save's POST, presses Escape, releases it, and
  the window neither closes nor reopens.
- [ ] `tools/probe/run-verify-ghost-admin.py` — **DW-92**: `--only <step,…>` runs the named blocks and their seedings,
  refuses an unknown name, and streams the child's output. Then **DW-74, DW-83, DW-85**: run `brand-ownership` and
  `moved-domains` with it and record them. Controls: `--only no-such-step` exits non-zero; DW-83's select without its
  first order term, run read-only over the pooler, picks the disconnected record.
- [ ] `lib/connect-rule.ts` — **DW-86**: both Ghost Admin paths read in Ghost's own admin source at 5.130.6 and 6.58.0
  (npm tarballs) and cited beside their sentences; a word that differs is corrected; `connect-rule.test.ts` pins them.
- [ ] `tools/probe/check-access.py` — **DW-90**: a read-only GitHub check reading `github-authentication-token-expiration`
  and warning inside 30 days; the register row names the tool. Control: an answer without the header FAILs; a threshold
  self-check.
- [ ] **DW-91**: a harness-only throwing page (404 unless `INFLOZO_HARNESS`) and a `pnpm keyboard` test for the tab title
  "Something went wrong · Inflozo"; a `run-verify-passkeys.py` step holding the ceremony pending that asserts `inert`,
  `aria-hidden` and that Tab cannot enter. Controls: delete `error.tsx:56` or the `inert` line → red.
- [ ] `(dashboard)/page.tsx`, `lib/connect-rule.ts` — **DW-27**: both no-match sentences end with **Clear search**, a link
  to the page without `q`, in the icon picker's style; the field keeps no ×. Control: a `run-verify-dashboard.py` step
  on `/` and `/sites`.
- [ ] `lib/entitlement.ts` — **DW-29**: `readEntitlement(client, id)` beside `planFor`; `plan.test.ts` points a real
  supabase-js client at a local server: a 500 gives `free`, `pro_active` gives `pro`.
- [ ] `tools/probe/run-verify-passkeys.py` — **DW-32**: `kill-mid-ceremony` (hold the finish POST, switch passkeys off,
  release, expect the switched-off sentence and no session, restore in `finally`) and `named-aaguid` (an init script
  writes a listed AAGUID; the new row carries its name). Controls: the switch-on round trip; the unshimmed step's
  "Passkey".
- [ ] `sign-in/actions.ts`, `account/actions.ts` — **DW-41**: `signOutEverywhere` signs out `others` then `local`;
  `signOut` lands by the cookies left; both comments corrected; `signed-out.test.ts` follows. Control: a node test
  against a local server answering 500 on logout; `run-verify-sign-out-everywhere.py`.
- [ ] `app/api/cron/purge-accounts/route.ts` + `lib/purge-rule.ts` — **DW-47**: the run excludes failed ids and loops
  within a time budget under 300 s (`ponytail:` names the ceiling and the `purge_attempts` upgrade). Control: 25
  always-failing accounts before one good one — the good one is purged in the same run.
- [ ] `apps/web/server/db.ts` — **DW-50** (Question 15): `ssl: { ca, rejectUnauthorized: true }` with Supabase's CA
  inlined as a constant (a file read would meet DW-269's tracing trap). Control: a harness step connects with the pinned
  CA (passes) and a self-made CA (fails); the deployed Sites page still reads the key store.
- [ ] `lib/admin-rule.ts` + `lib/connect-rule.ts` — **DW-52**: `ghost_unavailable` for 429 and ≥500, with the sentence
  "Ghost didn't answer just now. Try again in a moment."; 404 and 403 stay `ghost_refused`.
- [ ] `server/ghost-admin/index.ts` + `lib/admin-rule.ts` — **DW-58**: before the fetch, a DNS lookup refuses a
  loopback, private, link-local, CGNAT, unique-local, unspecified or v4-mapped answer with `detail.blocked` and the
  unreachable sentence (`ponytail:` names DNS rebinding). Controls: unit vectors both ways; a harness connect to
  `https://127.0.0.1.nip.io` refused while T1 connects.
- [ ] `lib/connect-rule.ts` + `sites/actions.ts` — **DW-59**: `storeOrUndo` and `siteWrite` lifted and run by
  `connect-rule.test.ts` (swapping the branches or dropping a kept column goes red).
- [ ] `tools/probe/configure-supabase-auth.py` — **DW-14**: the Pro-only idle-timeout row and its 402 retry go, replaced
  by one comment; `--check` exits 0, `--expect mailer_otp_exp=901` still exits 1.
- [ ] `(dashboard)/loading.tsx`, `sites/(list)/page.tsx` — **DW-25, DW-57**: the rules themselves stated in the header
  comments (the first byte waits on the guard by rule; the Sites card's layout is the owner's).
- [ ] **Question 10** as ruled — option 1: `normaliseSiteUrl`'s caller refuses a path with "Inflozo connects a Ghost site
  at the root of its address — /blog isn't supported yet." (the path derived), and a test.

### Group C — the section runtime, the library and the recordings

- [ ] `eslint.config.js` — **DW-4**: `toString` refused only with no argument; `noInlineConfig` in the core block.
  Control: three `lintText` rows (a Date refused, `n.toString(16)` clean, a disable comment plus `.localeCompare()` still
  refused).
- [ ] `section-runtime/src/core.ts` — **DW-96** (an attribute's value collapses line breaks to one space on both
  emitters), **DW-159** (`renderTree` drops the design's comment nodes before any token is put), **DW-228**
  (`stampControls` keeps `data-i18n-*`), **DW-168** (`RenderInput.version` reaches `bindingRefusals`;
  `check-snapshots.mjs` passes `ghostCompat.minVersion`; a `mustFail` row: a22/1 at 5.61.0). Controls: an
  `agreement.test.ts` vector each, and the `mustFail` row.
- [ ] `library/src/vocabulary.ts` + `contexts/matrix.json` — **DW-99**: `total_paid_members` and `content_api_url` join
  `BARE_HELPERS` with matrix rows, re-recorded by `record-contexts.py`; a comment beside `taxonomyItems`. **DW-129**:
  the two code-injection keys move to `neverOffer` (appendix-b1 §6 too). Controls: an agreement case; a contexts test.
- [ ] `library/src/validate.ts` — **DW-104** (a top-level `,` and an unbundled seed refused; one `PREVIEW_SEEDS` list),
  **DW-161** (a members field outside its form refused), **DW-186** (a control titled "Member visibility" refused),
  **DW-196** (`darkCapabilities` a closed word list: `tokens`, and `image-swap` only where a control swaps an image; the
  words defined in `docs/section-authoring.md`), **DW-213** (a second `data-items-limit` on one path refused). Controls:
  a `validate.test.ts` case each, red on HEAD.
- [ ] `library/icons/tabler.d.json.ts` + `tsconfig.base.json` — **DW-113**: a declaration and `allowArbitraryExtensions`.
  Control: `tsc --listFilesOnly` does not load the JSON.
- [ ] `tools/stress/sections.js` + `compile.js` — **DW-125**: `@site.navigation` and a declared tiers query; each
  archetype rendered with its target in `test-vocabulary.mjs`; gscan 0/0 on both majors.
- [ ] `tools/matrix/cases.mjs` + `(authed)/pilots/` — **DW-171**: the show-to arms from `carriesMemberVisibility`; the
  baseline swap is the owner's approval (Ask First). Control: a `cases.test.mjs` assertion, red on HEAD.
- [ ] `section-runtime/src/tokens.ts` — **DW-224**: rule 2 forces the underline; all three rules select
  `:where(a:not([class]), a[class=""])`; `reference-tokens.css` regenerated; the R-173 test extended.
- [ ] `section-runtime/src/doc-schema.ts:68` — **DW-288**: the rule as a comment (kept, never drawn, never pruned) and a
  test that an unknown design id survives parse and swap.
- [ ] `tools/probe/record-shim.py` — **DW-147, DW-237**: `restore_and_delete()` re-activates, then deletes and reads back
  even if the re-activation raised; `record-shim.py`, `run-verify-core.py`, `record-contexts.py` and
  `record-page-number.py` call it; the rule joins `RESET-PROTOCOL.md`; an offline `--self-check` joins `pnpm test`.
  **Question 14**: the leftover probe themes deleted after the owner has seen the list.
- [ ] `tools/probe/record-cards.py` — **DW-103** (Question 14): the defaults read through a recorder-owned pair of posts
  and tags; both majors re-recorded; `orbit-weekly.test.ts` asserts every defaults row is the recorder's.
- [ ] `tools/probe/record-contexts.py` + `contexts/matrix.json` — **DW-127** (Question 14): the empty fields seeded on T1
  and T3 after the inventory, private mode switched on and back, re-recorded, `unverified` markers dropped where a
  recording now shows; `contexts.test` requires every scope row recorded or reasoned.

### Group D — the checks and the walks

- [ ] `apps/web/*.test.ts` — **DW-117, DW-162**: one executed test loads the three frame routes' handlers with stubbed
  `next/server` and Supabase and asserts 303 to `/sign-in` signed out and 200 signed in, replacing the three text tests;
  the editor walk's signed-out loop gains `/controls/frame` and `/style-guide/frame`.
- [ ] `apps/web/lib/zod.ts` — **DW-174, DW-201**: `z.config({ jitless: true })` and re-exports `z`; every app zod import
  uses it; `no-restricted-imports` keeps it so. Control: importing `lib/style-pack.ts` with `Function` trapped fires no
  probe; one signed-in load of `/` counts no `securitypolicyviolation`.
- [ ] `tools/keyboard/journey.spec.mjs` — **DW-182** (typing past the fixture heading's 40 raises "Heading holds 40
  characters." and drops the 41st; with `top.document.hasFocus` false, blurring keeps the session), **DW-211** (in
  `floor.spec.mjs`: the pill's ◀ ▶ and Shuffle pressed on the fixture ring, then ⌘Z).
- [ ] `tools/probe/run-verify-editor.cjs` — **DW-183, DW-204** (the signed-in GETs retried once on a timeout; one walk
  read beside `npx vercel logs` and each stall recorded as client or product), **DW-219** (step 89 on Author and Page,
  and a forged request refused), **DW-220** (66b waits on the sync POST for the budget `lib/journal.ts` exports),
  **DW-222** (step 36 measures against the hovered root after the pill's tick), **DW-236** (a bad frame is skipped and
  counted), **DW-284** (step 90 waits until no server action is in flight), **DW-291** (step 89 polls the saved subject
  before reloading). Each carries its control as the triage names it.
- [ ] `tools/probe/die-pips.cjs` — **DW-216**: the one measurement the journey and both walks import.
- [ ] `apps/web/lib/canvas.ts` — **DW-208**: `canvasCaching()` both canvas routes call; the text regex goes; a unit test.
- [ ] `tools/probe/record-edit-lock.py` + `RLS-TEST.sql` — **DW-245**: a probe error is not "RUN VOID"; the fixture user
  is cleaned up once created; F4 seeds relative to the current generation; `supabase/tests/rls.sql` copied.
- [ ] `apps/web/app/layout.tsx` + `app/fonts/` — **DW-246**: the three faces self-hosted through `next/font/local` (OFL
  files and licences committed); a `tokens.test.ts` row forbids `next/font/google`; an offline `pnpm build` passes.
- [ ] `tools/probe/run-verify-live-content.cjs` — **DW-251**: a ring tile shows the site's newest title; under a
  simulated total past `LIST_LIMIT` both capped lines read.
- [ ] `apps/web/lib/` + the harness — **DW-257**: `designateAll()` shared by `read.ts` and the harness; an unflagged
  harness Home journey; `unasked()` with a node test. **DW-279**: a harness-only re-read and a journey stop that sees the
  floating button arrive. **DW-285**: `ShellUserContext` exported; the harness gives the notice its avatar.
- [ ] `tools/check-traces.mjs` + `ci.yml` — **DW-269**: after `pnpm build`, the editor, `/canvas` and `/pilots` traces must
  list every tracked file under `packages/library/designs`. Control: a scratch build with `PACKAGES` built from
  `import.meta.url` goes red.
- [ ] `run-verify-controls.cjs`, `run-verify-pilots.cjs` — **DW-287**: `load` instead of `networkidle`, with the landmark
  waits that already follow.

### Group E — the editor

- [ ] `packages/library/orbit-weekly/media/` + `lib/style-guide.ts` + `lib/canvas.ts` — **DW-102**: a few seconds of
  in-house audio and video served same-origin in place of the sample host. Control: no sample-host media survives; the
  walk's CSP read.
- [ ] `section-runtime/src/marks.ts` — **DW-181**: pasted inline weight, style and decoration read as the field's allowed
  marks. Control: `marks.test.ts` cases from clipboard HTML recorded by pasting from Google Docs, Word Online and Apple
  Notes; the `font-weight:normal` wrapper alone stays unmarked.
- [ ] `lib/editor.ts` + `lib/reorder.ts` + `layers.tsx` — **DW-187, DW-189**: one pure helper keeps a site-wide drag
  inside its group (headers above footers), used by Layers' Site-wide card and the pill's grip. Control: a unit test with
  made-up ids.
- [ ] `components/controls/sidebar.tsx` + `section-runtime/src/doc-edit.ts` — **DW-198**: the sidebar picks the swatches
  for both surfaces from one place; `clearProject()` beside `clearDarkOverrides`. Controls: a journey compares each dot
  with the canvas in light and dark; a two-canvas clear test.
- [ ] `(editor)/editor-skeleton.tsx` — **DW-199**: the card holds 16:10 in a short, wide window. Control: a
  `floor.spec.mjs` stop compares its box with the real card's.
- [ ] `editor.tsx` — **DW-205** (a repeated sentence is spoken again; a journey counts the live region's changes),
  **DW-229** (the PAUSED chip's sentence for screen readers, EXPERIENCE's words), **DW-241** (becoming read-only closes
  the menus and dialogs), **DW-290** (`prepareChrome()` in idle time after the first paint; `fps-trace.mjs` measures the
  first selection at 4×, manual).
- [ ] `components/editor/section-picker.tsx` — **DW-207**: browsing clears the refusal (a Post Content stand-in fixture
  that never ships); a search shows "All sections" chosen; ⌘K inside the picker focuses the search. Three journey stops.
- [ ] `lib/preview-subject.ts` — **DW-223**: a pick waits in `sessionStorage` until its action answers and wins at the next
  open. Control: walk step 89 holds every action, picks, reloads at once, and sees the pick.
- [ ] `editor.tsx` + `lib/lock.ts` + `lock/route.ts` — **DW-225** (a reader's View as picks are not stored), **DW-240,
  DW-244** (the release backdates the heartbeat inside a short grace instead of deleting, filtered on this session's last
  beat), **DW-242** (the holder's reload paints no greyed frame), **DW-243** ("kept editing" only when the holder
  cleared the request). Controls: `lock.test.ts` cases and `run-verify-lock.cjs` stops, each as the triage names it.
- [ ] `projects/[id]/sync/route.ts` + `read.ts` — **DW-235**: `docRefusal()` shared; the route answers 422 before the RPC.
  Control: an `editor.test.ts` case and a walk 66c post.
- [ ] `apps/web/lib/live-content.ts` + `lib/canvas.ts` — **DW-248** (a capped search asks Ghost by title through a closed
  grammar executed on both majors), **DW-250** (a stored Tag or Author subject paints after one round), **DW-258** (one
  slug grammar, executed on T1 and T3 first), **DW-259** (hand-picked ids read in chunks), **DW-270** (`tiers` included on
  every post and page read and kept by the whitelist; shim fixtures re-recorded). Controls: a `live-content.test.ts` row
  each; the live-content walk.
- [ ] `lib/canvas.ts`, `lib/probe-rule.ts`, `lib/ghost-surfaces.ts`, `lib/pilots.ts` — **DW-273** (the paywall box follows
  the site's major), **DW-275** (the paywall stylesheet served on its own route and loaded on the first Paywall paint),
  **DW-278** (`portal_button_icon` stored and drawn: the five presets, a custom image, else the person icon), **DW-280**
  (an absent announcement or brand key leaves the stored value standing). Controls: a test each, as the triage names it.
- [ ] `lib/canvas-layer.ts` — **DW-256**: the host declares Tailwind's four shadow variables. Control: a keyboard stop
  reads the note's computed shadow.
- [ ] `components/kit/layers-row.tsx` + `editor.tsx` — **DW-281**: `LayerThumb` draws the frames' glyph per category (the
  Hero glyph where no frame draws one); Epic 9's and 10's preamble gains "a category's first story adds its Layers glyph,
  extrapolated from S4/D8's five (R-74)". Control: a journey stop at 1024 and 1440.
- [ ] `components/controls/sidebar.tsx:464-465` — **DW-282**: `read-prop-…` and `read-control-…`. Control: a journey stop
  fails on React's duplicate-key warning.
- [ ] `editor.tsx:4552` — **DW-283**: the MEMBERS OFF chip is whole or absent. Control: `floor.spec.mjs` at 600 × 960 touch.
- [ ] `lib/behaviours.ts` — **DW-226**: `movesByItself` honours the declaration's own width. Control: `behaviours.test.ts`.
- [ ] **Questions 3, 4, 6, 7, 8, 9** as ruled — at their recommended options: the signed-out save state (B6's red panel,
  its sentence and a Sign in button in a new tab); the browser copy erased at sign-out after sending, asking first when
  it cannot send; the floating button assumed off when unreadable (FR-C2's sentence follows); the Paywall panel's line
  in the Sites screen's own sentence per ask; a Layers row's hover outlines its section without scrolling; the capped
  header adds its range. Each with a journey stop that fails with its line removed.

### The close itself

- [ ] `deferred-work.md` — every closed entry: `status: done <date>` and a `resolution:` naming this story and its
  evidence; re-homed entries: the new owner line; **no entry deleted or renumbered**.
- [ ] Standing rule 7 — grep for every DW id touched and every string replaced; fix what it finds.
- [ ] `pnpm check`, `pnpm keyboard`, `bash supabase/tests/run-rls-gate.sh`, `python3 tools/doc-audit.py --check` — all
  green, and the deployed walks pass.

**Acceptance Criteria:**

- Given the ledger after Story 5.23b, when this story is done, then every open entry is closed by a change, closed
  with its evidence, closed on the owner's ruling, or open with a named story that is not done and whose text carries
  it — and the gate refuses a commit that leaves an entry owned only by finished stories.
- Given the checks the ledger said were missing, when each is added, then its control has been seen to fail with the
  thing it protects reverted, and the run is recorded under Verification.
- Given each surface a fix touches, when it is compared with the frame named in the Code Map, then it matches the frame,
  and every departure is recorded beside the code (R-74).
- Given every touched surface, when axe runs at 1440, 834 and 390, then it reports zero violations.
- Given the owner, when he follows *Owner's manual test* on the deployed site, then he sees each row's result (R-80).
- Given `pnpm check`, `pnpm keyboard`, the RLS gate and the documentation gate, then all four are green; no entry was
  deleted or renumbered, no design file edited, and no migration shipped.

## Spec Change Log

*Empty until the first review loop.*

## Design Notes

**How the triage was made.** Nine read-only passes, each entry read in full and checked in the code at `6bf7c4e0`;
nothing was written to the repo or to a real service except read-only public GETs and the GitHub Actions API. Each
verdict is a claim the Dev run re-executes before acting on it.

**Why five stories are recommended (Question 1).** Story 3.9 closed 29 entries and took a day across its phases; this
sweep closes about four times that, plus the plan edits. A Dev commit must have every task ticked
(`tools/hooks/commit-msg`), so one story means one uncommitted working copy for the whole build, one review of a very
large change, and one long test. The five groups touch different files and can land one after another; A first, so the
ledger is honest and guarded before any code moves; D before E, so the walks E leans on are steady first.

**Routine calls made here, each stated to the owner in one line.**

1. **DW-267 stays Story 7.13's.** Dropping an unused column now would be this story's only migration — a Schema phase
   and a hand-applied production change (R-99) for a column nothing reads; 7.13 already carries it.
2. **DW-187 closes with DW-189.** One rule — a site-wide drag stays inside its group, headers above footers — answers
   both, and a unit test with made-up ids proves it before any footer design exists.
3. **Five owner questions move to the stories they shape** (DW-144 → 9.6, DW-145 → 7.12, DW-178 → 9.1, DW-185 → 9.5,
   DW-261 → 7.3/7.6), each written into that story's text as a question it asks first. Asking them now would decide
   category work before its designs are in front of him.
4. **DW-240's grace.** A closed tab frees editing a few seconds later instead of at once — the lock's timings tune and
   its comparisons do not (epic 5's context), and the grace is what stops a reload handing editing away.
5. **DW-225.** A window reading along clears its own View as dots for the session but stores nothing, because the page
   it looks at may be behind the editing window's.
6. **Two new sentences in the established voice:** DW-52's "Ghost didn't answer just now. Try again in a moment." and
   DW-229's "PAUSED — this part moves by itself on your site; it holds still while you design, and Preview runs it"
   (EXPERIENCE's own words, R-170).

**The Free-pair finding (Question 2).** R-17 was amended on 2026-08-28 and the picks were made category by category on
29–30 August; `epics.md` was written on 2026-09-04 from the positional rule, and neither it, FR-G2, the tiering note
nor `sections-inventory.md:12` was updated. The generated roster already marks the picks (`inventory-gen.py` reads the
export's line), so only the hand-written text disagrees. Derive the categories affected with the command under
Verification; the three default rows are `SYNTHESIS_DEFAULTS`' `a25/1`, `a28/2` and `a29/2`, each dropped today because
no A25, A28 or A29 design exists, so correcting them changes nothing on screen. DW-232 (A34's pager) and DW-268
(Ledger's paywall) are the same finding already owned.

## Questions for the owner

Most are one line to answer — reply `1: 1, 2: 1, …`, or `all as recommended`.

### Question 1 — This sweep is four times the last one. One story, or five in a row?

**In plain English.** The ledger's open items break down like this: seven are already fixed, about a hundred and twenty
can be fixed now, about eighty need a later story that will really build them, and a few are yours to decide. Story 3.9
fixed 29 in one story. Doing all of this as one story means one very long build that saves nothing until the end, one
review of a very large change, and one long test for you.

**An example.** If the build runs out of room halfway, nothing is pushed — a build is pushed only when every item in it
is done — and the next session starts from a half-finished copy.

1. **Five stories, one after another, each about the size of 3.9 (RECOMMENDED).**
   - **5.24a — the ledger and the plan.** Every item gets its real owner, the plan's stories gain what they now carry,
     and a check stops an item being orphaned again. No screen.
   - **5.24b — accounts, sites and connections.** Screens: Projects and Sites.
   - **5.24c — the section runtime, the library and the test-site recordings.** No screen.
   - **5.24d — the checks and the walks.** No screen.
   - **5.24e — the editor.** Screen: the editor.
   - Epic 6 starts after 5.24e.
2. **One story, as R-207 has it.** The same work, one build, one review, one test.
3. **Three stories:** the ledger and the plan; all the code that changes no screen (b, c and d above); the editor.

**Ruled:** _(awaiting the owner)_

### Question 2 — Which designs are free: your picks, or "the first two"?

**In plain English.** On 28 August you ruled that the two free designs in each category are your choice, not simply
the first two (R-17, amended), and you then picked them category by category; the drawings record your picks. But the
plan for Epics 9 and 10, the PRD's FR-G2 and one line of the inventory still say "the first two" — and in all but four
categories your picks are not #1 and #2. It also reaches the pages nobody has designed yet, which are built from free
designs only: your picks make three of their default designs Pro.

**An example.** For Headers you picked 1 Rail and 13 Centre Nav. The plan's Story 9.1 builds 1 Rail and 2 Split Rail as
"the free pair" and builds Centre Nav later as a Pro design — so a free customer would get Split Rail, which you did not
pick, and never Centre Nav, which you did. And an untouched post page would open with A25 #1 Measured, which your pick
(2 Plain and 5 Full Bleed) makes Pro.

1. **Your picks, everywhere (RECOMMENDED).**
   - In each category's first story, your two picks trade places with the designs the plan put there.
   - The untouched pages use one of your free picks: the post and page body A25 #2 Plain, comments A28 #1 Rule, the
     author archive's header A29 #1 Centred (the one the tag archive already uses).
   - FR-G2 and the inventory say "the two the owner picked", and a check stops the plan drifting from your picks again.
2. **The first two, as the plan says.** Your picks are set aside. The drawings keep your picks' Free badges, because
   the export is never edited, so drawings and product would disagree.

**Ruled:** _(awaiting the owner)_

### Question 3 — If you are signed out while the editor is open, what should the save message say? (DW-202)

**In plain English.** The editor keeps your typing on this computer when it cannot send it. If your sign-in has run
out, it says "we will send it when the connection returns" — true for a dropped connection, but here waiting never
fixes it; signing in does.

**An example.** You come back to an open tab in the morning, type a heading, and the red panel says your work will go
"when the connection returns", though your internet is fine.

1. **A sixth state in the same red panel (RECOMMENDED):** "You've been signed out. Your work is safe on this device —
   sign in again and it will be sent.", with a **Sign in** button that opens a new tab, so this one keeps your work.
2. Keep "Retrying" and change only its sentence for this case.
3. Send the tab straight to the sign-in page; the device keeps the work and sends it after you sign in.

**Ruled:** _(awaiting the owner)_

### Question 4 — When you sign out, should Inflozo erase the copy of your work it keeps in this browser? (DW-203)

**In plain English.** The editor saves every change in your browser first, then sends it. That copy stays after you
sign out. Only your own account can open it in Inflozo, but someone using the same computer could read it with the
browser's developer tools. *(The other half of DW-203 — two tabs writing one copy — is already fixed by the edit lock.)*

**An example.** You edit on a library computer and sign out; the next person could read your unpublished page in the
browser's storage.

1. **Erase it at sign-out, after first sending anything not yet sent; if it cannot be sent, ask before signing out
   (RECOMMENDED).**
2. Always erase it at sign-out, even work not yet sent.
3. Keep it, as today.

**Ruled:** _(awaiting the owner)_

### Question 5 — After "Sign out everywhere", a stolen sign-in ticket still reads your data for up to an hour. Keep the hour? (DW-40)

**In plain English.** "Sign out everywhere" ends every session, and every Inflozo page refuses the old ticket at once.
But a ticket someone had already stolen from your browser can still read your own rows straight from the database until
it expires, up to an hour later — Supabase's default.

**An example.** A ticket copied at 10:00 could still list your projects through the database at 10:50.

1. **Keep the hour, and write it into the project's security rules so it is a decision, not an accident (RECOMMENDED).**
   The ticket sits in a cookie no script on the page can read, and the sign-out check re-tests the hour on every run.
2. Cut it to ten minutes. Six times shorter; every open tab renews its ticket six times an hour.
3. Make the database refuse a signed-out ticket at once — a check on every read, about a day's work.

**Ruled:** _(awaiting the owner)_

### Question 6 — When Inflozo cannot tell whether your site shows Ghost's floating Subscribe button, what should the editor assume? (DW-277)

**In plain English.** Ghost can show a floating Subscribe button in the corner of every page. Usually Inflozo reads
whether it is on. When it cannot, it assumes ON and draws it — but Ghost's own default is OFF, on both versions. The
Sites screen still asks you either way.

**An example.** A self-hosted Ghost that hides the setting: your page in the editor shows a Subscribe button your real
site probably does not.

1. **Assume off, Ghost's own default (RECOMMENDED).**
2. Keep assuming on, as the PRD says today.

**Ruled:** _(awaiting the owner)_

### Question 7 — Should a sign-up section's settings say when your site cannot take the sign-up? (DW-274)

**In plain English.** When your site has members switched off, a sign-up section's settings say so. When sign-ups are
invite-only, paid-only, or paid sign-up has no Stripe connected, the Sites screen says so, but the section's settings
say nothing — so you can place a sign-up box that silently does nothing on the live site.

**An example.** Your site is invite-only. You place the Newsletter section; its settings are silent, and on the live
site the form does nothing for visitors.

1. **The settings say it too, in the Sites screen's own sentence, matched to what the section asks for (RECOMMENDED).**
2. Only "members off", as today.

**Ruled:** _(awaiting the owner)_

### Question 8 — When you point at a section's row in Layers, should the page outline that section? (DW-188)

**In plain English.** Pointing at a section on the page highlights its row in Layers. The other way round does nothing.

**An example.** You point at "Newsletter" in the Layers list, and the Newsletter section on the page gets the same thin
outline it gets when you point at it there.

1. **Outline it, and never scroll the page (RECOMMENDED).** Moving down the list would otherwise make the page jump.
2. Outline it and scroll it into view.
3. Leave it as it is.

**Ruled:** _(awaiting the owner)_

### Question 9 — When a design shows only some of a list's items, should the list's header keep its allowed range? (DW-212)

**In plain English.** A list in the settings normally reads "2–6 · 3 used". When a design shows fewer items than the
list holds, it reads "3 items · 2 shown in this design" — the sentence you approved in Story 5.11 — and "2–6"
disappears, though + and − still stop at 2 and 6.

**An example.** The capped list on the `/controls` page.

1. Keep it as it is.
2. **Both on one line: "3 items · 2 shown in this design · 2–6" (RECOMMENDED).** Nothing is hidden, and the stop at 6
   explains itself.
3. Show the range only when you point at the header.

**Ruled:** _(awaiting the owner)_

### Question 10 — Should Inflozo say so when you give it a Ghost site that lives under a path? (DW-55)

**In plain English.** Some Ghost sites live under a path, like `https://example.com/blog`. Inflozo drops the path, looks
at `https://example.com`, then says "Ghost refused the connection (HTTP 404)" — blaming Ghost for our limit.

**An example.** You type `https://example.com/blog` in Connect a site.

1. **Not supported yet, and say so: "Inflozo connects a Ghost site at the root of its address — /blog isn't supported
   yet." (RECOMMENDED).** A small change.
2. Support it: the path kept in every address Inflozo builds, proved on a new test Ghost installed under a path. Large.
3. Leave it as it is.

**Ruled:** _(awaiting the owner)_

### Question 11 — Should the two Re-check buttons make you wait between presses? (DW-64)

**In plain English.** Re-check plan and Re-check connection ask your Ghost again every time. Nothing limits how often;
a double press is already blocked.

**An example.** You press Re-check connection five times in a minute; your Ghost answers five times.

1. **No wait, as today (RECOMMENDED).** It is your own Ghost, and each press is two small requests.
2. A 60-second wait: the button greys with "Checked just now — check again in a minute".
3. No visible change: presses within 60 seconds quietly reuse the last answer.

**Ruled:** _(awaiting the owner)_

### Question 12 — Should you be able to copy or move a section to another kind of page? (DW-122)

**In plain English.** A section lives on the page you added it to. To have it on the Post page too, you add a fresh one
there from the Section Picker.

**An example.** Copying the newsletter band from your Home page onto your Post page.

1. **Not at launch (RECOMMENDED).** The Section Picker already puts any design on any page, and site-wide sections cover
   "the same on every page". FR-H7's rule stays the rule any later move must follow.
2. Build "Copy to…" and "Move to…" in the Layers row menu now — a day or more, and you test it.
3. Yes, as its own story after Epic 5, named on the board.

**Ruled:** _(awaiting the owner)_

### Question 13 — When you sign off a category, should your check include looking as each kind of visitor? (DW-221)

**In plain English.** FR-D16 says the dots on View as make "the owner's member-state pass at each category gate
reliable" — but no category gate has that pass.

**An example.** At the Announcement Bars gate you switch View as to Paid member and see the bar set to "Paid members"
appear, then to Logged out user and see it gone.

1. **Add the pass to §4's owner check and to every category's owner-gate story (RECOMMENDED).** FR-D16 already assumes
   it.
2. Keep the gates as they are and delete FR-D16's sentence about them.

**Ruled:** _(awaiting the owner)_

### Question 14 — May the sweep add test content to your two test Ghost sites and delete leftover probe themes there?

**In plain English.** Three fixes need to change `ghost6.inflozo.com` and `ghost5.inflozo.com`: fill empty fields (a
tag's description and picture, an author's website, a tier's benefits, a newsletter's description, a post excerpt) so
the recordings show real values; keep a recorder's own two posts and tags, as drafts; and delete the probe themes earlier
runs left installed. The reset rule is: I list first, you look, you confirm, then I change.

**An example.** The tag "News" gets a description and a picture, and keeps them for later tests.

1. **Yes to all three, after you have seen the list (RECOMMENDED).**
2. The content only; keep the old probe themes.
3. Neither — the three fixes move to the first stories that need the fields (A21's Story 10.71, A29's Story 10.96) and
   the themes stay.

**Ruled:** _(awaiting the owner)_

### Question 15 — Can you download Supabase's certificate, so the app checks it is talking to your real database? (DW-50)

**In plain English.** The app's line to its key store is encrypted, but it does not check that the far end really is
your database. The fix needs Supabase's certificate, which your dashboard gives out: **Supabase → your project →
Database settings → SSL configuration → Download certificate**. It is public, not a secret — a minute's work.

**An example.** Someone who could sit between Vercel and Supabase could pretend to be the database, and today the app
would not notice.

1. **Yes — download it and tell me where the file is (RECOMMENDED).**
2. Not now — DW-50 moves to Story 15.8 with DW-49, where the connection is made anew for the live site.

**Ruled:** _(awaiting the owner)_

## Owner's manual test

Do this on the real site after Deploy. It follows the recommended options; the rows move to their own stories if you
rule Question 1 option 1, and change where you rule another option.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | `https://app.inflozo.com/` | Projects | Type in the search box. Then click **Clear search**. | `zzzz` | "No projects match "zzzz". **Clear search**". The click empties the search and your projects are back. |
| 2 | `https://app.inflozo.com/sites` | Sites | The same. | `zzzz` | "No sites match "zzzz". **Clear search**"; the click brings every site back. |
| 3 | `https://app.inflozo.com/sites` | Sites | Type part of one site's name so only it shows. Open its **⋯ → Manage API keys**, close with ✕. Open it again, close with Esc. | `ghost5` | After each close the list is still filtered and the box still says `ghost5`. |
| 4 | `https://app.inflozo.com/sites/connect` | Connect a site | Type an address with a path. | `https://example.com/blog` | "Inflozo connects a Ghost site at the root of its address — /blog isn't supported yet." |
| 5 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Pilot sections, Home | Look at the small pictures at the start of each Layers row. | — | Each kind of section has its own: the header, hero, post grid and newsletter pictures differ. Before, all were the same. |
| 6 | same | Pilot sections, window narrower than about 1280 | Look at the tile strip. | — | The tiles show the same per-kind pictures. |
| 7 | same | Pilot sections, full width | Point at the **Newsletter** row in Layers (don't click). | — | The Newsletter section on the page gets its thin outline; the page does not scroll. |
| 8 | same | Pilot sections | Select the Newsletter section, click into its description on the page, and paste a line copied from a Google Doc. Undo afterwards (⌘Z). | a Google Doc line with one **bold** and one *italic* word | The bold word stays bold and the italic word stays italic. |
| 9 | same | Section Picker | Press ⌘K. Click a category in the left rail, then type in the search. Then click a card and press ⌘K again. | `grid` | While you search, **All sections** is the one marked in the rail. The second ⌘K puts the cursor back in the search with your text selected. |
| 10 | `https://app.inflozo.com/projects/99d4d277-540f-4407-b9e1-033d4c93058f/post` | Ghost 5 Project, Post | Open the **Previewing with** pill at the foot, choose a different article, and reload at once (⌘R). | — | After the reload the page still shows the article you just chose. |
| 11 | `https://ghost5.inflozo.com/ghost/`, then the Ghost 5 Project's Home | Ghost admin, then the editor | In Ghost admin's Portal settings, switch the floating button on and choose a different icon; save. Open the Ghost 5 Project's Home. Afterwards put Ghost's settings back. | — | The floating Subscribe button, bottom right of the page, wears the icon you chose, not the plain person. |
| 12 | `https://app.inflozo.com/style-guide` | Style guide | Scroll to the audio and video cards; press play on each. | — | Each plays a few seconds, where before nothing played. |
| 13 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` in two windows side by side | Editor | Window A is editing, B reads along. Close A's tab. | — | Within a few seconds B can edit. |
| 14 | same | Editor | With A editing again, open A's **⋯** menu. In B, take over editing. | — | A's menu closes by itself as A becomes read-only. |
| 15 | same | Editor | With A editing, reload A. | — | A keeps editing; B keeps reading along. |
| 16 | same | Editor | In a second tab, sign out (account menu → Sign out). Back in the editor tab, type one word into a heading. Then press **Sign in**. | one word | "You've been signed out. Your work is safe on this device — sign in again and it will be sent." After you sign in, the word is sent. |
| 17 | `https://app.inflozo.com/controls` | Controls | Find the list whose design shows fewer items than it holds. | — | Its header reads "3 items · 2 shown in this design · 2–6". |
| 18 | Pilot sections → **Template ▾ → Template surfaces → Paywall** | Paywall canvas | Open it. | — | Ghost's own box looks exactly as before. |
| 19 | any app screen | Projects and the editor | Look at the lettering. | — | Unchanged — the fonts now come from Inflozo itself rather than Google. |

## Verification

*Filled by the Dev and Review runs (R-82). Named here is what each group must hit.*

**Commands:**

- `python3 -c "import importlib.util as u; s=u.spec_from_file_location('b','tools/story-board.py'); b=u.module_from_spec(s); s.loader.exec_module(b); d=b.load_deferred(open('_bmad-output/implementation-artifacts/deferred-work.md').read()); print(sorted((x['id'] for x in d if not b.dw_closed(x)), key=lambda i: int(i[3:])))"`
  — expected: the ledger's open entries at HEAD, which Dev compares with this spec's triage and re-triages where they
  differ.
- `for f in _bmad-output/planning-artifacts/design/claude-design-export/Inflozo/A*Spec.md; do grep -m1 -H '^\*\*\[Free\] designs:\*\*' "$f"; done`
  — the owner's picks, read against each category's first story in `epics.md`; expected at Create: all but four
  categories disagree; after Question 2's work, none (the new doc-audit check says so).
- `pnpm check` — expected: green, the new tests and self-checks inside it.
- `pnpm keyboard` — expected: every journey passes, the new stops included.
- `bash supabase/tests/run-rls-gate.sh` — expected: green, with DW-245's relative F4.
- `python3 tools/doc-audit.py --check` (twice) — expected: green, with the orphan, Free-pair, roster and module-line checks.
- `cd tools/stress && npm install && node build.js && node gate.js theme` — expected: 0 errors, 0 warnings on both majors
  (DW-125).
- `bash tools/matrix/run-matrix-gate.sh` — expected: green after the owner approves DW-171's baselines.
- `node tools/perf/fps-trace.mjs` at 4× — manual, never CI: the first selection before and after DW-290.

**The real services each group hits:**

- **A** — none but GitHub's CI on the next day's first push (DW-132's field proof).
- **B** — `app.inflozo.com` (the dashboard, sign-out, passkeys and ghost-admin harnesses), Supabase through
  `SUPABASE_DB_POOLER_URL` and GoTrue (throwaway accounts, deleted afterwards), T1 `ghost6.inflozo.com` for connect and
  disconnect, public DNS for DW-58, and the GitHub API read-only for DW-90.
- **C** — T1 and T3 (`ghost5.inflozo.com`) for the recordings under the reset protocol, and gscan on both majors.
- **D** — `app.inflozo.com` through the editor, controls, pilots and live-content walks, Vercel's deployment logs
  (`npx vercel logs`) for DW-204, and CI's `check` job for DW-269.
- **E** — `app.inflozo.com` through the editor, lock and live-content walks, T1 and T3 for DW-248, DW-258, DW-270 and
  DW-278, and Supabase for the lock and View as rows.
