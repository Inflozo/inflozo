---
title: 'Story 7.15 — Share destinations: one ordered, site-wide list'
type: 'feature'
created: '2026-10-16'
status: 'ready-for-dev'
owner_test: none
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

Share links are the row under a post that lets a reader send it to Bluesky, Mastodon, email and so on. You set them
once for the whole site, and no design in your library shows them yet: the first is Post Headers #14 Share Row, in
Story 10.82. Two of your rulings also disagree about how they work — Inflozo's own list (31 August) or Ghost's own share
popup (1 September) — so Question 1 asks you to pick one, and when it is built. With the recommended answer nothing
changes on screen in this story: it hands its requirements, word for word, to the stories that build the share designs,
so that from Story 10.82 you set one list in Theme settings and every share row on your site shows it, in your order.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-Q10 (R-29, 2026-08-31) and this story's card say a project has **one** ordered share list, set in Theme
Settings, emitted as plain links, and that Ghost's Portal share page is never used. The owner's later ruling of
2026-09-01, "native Ghost Share only, everywhere", says the opposite. It is recorded only in the design export's A24, A25
and A26 specs, and R-49 (2026-09-03) treats it as live. A25's and A26's share designs are drawn to it. Nothing in the PRD
or the decisions file reconciles the two (standing rule: flag, do not guess). Separately, no design that renders share
destinations is built before Story 10.82 (A24 #14 Share Row), so under R-118 the setting would be a control with nothing
to act on.

**Approach:** Question 1 puts both to the owner. This spec is written to its recommended option 1. R-29's list stands.
FR-Q10 is built with the designs that render it. Its clauses move word for word (R-118, R-195):
- to **Story 10.82**: the setting, its storage, the links and the empty-list rule;
- to **Story 10.23**: the `share` module's one job, because A9 #7's copy-link button is the module's first consumer;
- to every **A25 and A26 story** whose designs offer sharing: they render the list, not Ghost's trigger.

Epic 10's preamble lists all of them. Dev edits documents only: no code, no migration, no screen. The story is Done at
Deploy.

## Boundaries & Constraints

**Always:**
- **Dev waits for Question 1.** Two approved rulings contradict, and only the owner settles that.
- **A move is word for word.** The receiving card carries the sentence itself, not a pointer to this story (R-195).
- **Every clause gets a named owner.** Each moved clause names its receiving story and appears in Epic 10's preamble
  list, in the form of Story 7.14's block.
- **The divergence is recorded, not drawn.** The export stays as drawn (R-74). Where a receiving story's frame draws
  Ghost's trigger, that departure is recorded in `reconcile-designs-decisions.md`, in R-128's form ("this file is the
  record of the divergence").
- **No count is written down.** Write "every A25 and A26 design that offers sharing", and name designs by number.
- **Standing rule 7.** End by grepping live documents for `7.15` and confirming nothing still points here for work
  that has moved.

**Ask First:**
- **Question 1 is ruled before Dev starts.**
  - Option 2 makes this story build the setting now. It sets `owner_test: pending`, and the Record prompt turns Design
    Notes' option-2 row into this spec's tasks and owner test.
  - Option 3 rewrites FR-Q10 to the 1 September ruling before anything moves.
- **The readings handed to Story 10.82's Create are not decided here** (Design Notes, "Handed to Story 10.82"). They are
  first N links, the list's floor, the canonical URL and the destination order.

**Never:**
- Under option 1, none of the following:
  - code, migration or Schema phase;
  - a Theme settings row, a `share.js` or a T1 write.
- No edit to anything Claude Design or a generator owns:
  - the design export (R-74);
  - `sections-inventory.md`'s roster lines, which `tools/inventory-gen.py` writes from the export;
  - any document marked `record` (e.g. `reconcile-designs.md`).
- No storage choice. AD-27's doc-schema row versus 7.13's `project_treatments` column is Story 10.82's call, made with
  its own migration.

</frozen-after-approval>

## Code Map

Documents Dev edits (all `live` in `INDEX.md`):
- `_bmad-output/planning-artifacts/epics.md`
  - `:3770-3793`: Story 7.15's card. The criteria are at `:3778-3791`; the FRs/Frame/Owner-test line is at `:3793`.
  - `:7340`: Story 10.82, A24 #13–16 and the owner gate, which includes #14 Share Row.
  - `:5753`: Story 10.23, A9 #5–8, which includes #7 Index and its copy-link button.
  - `:7379`, `:7409`, `:7431`: Stories 10.83, 10.84 and 10.85 (A25).
  - `:7470`, `:7494`, `:7516`, `:7538`: Stories 10.86, 10.87, 10.88 and 10.89 (A26).
  - Epic 10's preamble ends with 7.14's block at `:5147-5160`, just before `### A4 · Heroes` at `:5161`.
  - The FR coverage map's `FR-Q10 | E7` cell is at `:531`.
- `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md:387`: FR-Q10. `:941` (Appendix B's Portal
  paragraph) already matches option 1 and is read-only.
- `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md`:
  - `:795-806`: R-29.
  - `:183`: R-29's landing row, with "⬜ A24-14, A25, A26-9".
  - `:1015`: R-49, which says "four stands until the native-share redraw".
  - The last ruling is R-243 at `:5298`. The new entry goes after it.
- `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/research-section-js-libraries.md:173`: the `share` row
  says "`navigator.share()` where present". Under option 1 that contradicts "copy-link … the `share` module's only job".
- `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/MEASUREMENTS.md:2315-2327`: §29b says
  "opens the **sign-in** modal". Portal 2.51.5's own source is more exact (see "Facts this spec rests on").
- `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md:174`: the Theme Settings IA row. It
  lists what the surface holds; share destinations are not in it.
- `_bmad-output/implementation-artifacts/epic-7-context.md:336-337`: "Cards, treatments and share destinations".
- `_bmad-output/implementation-artifacts/deferred-work.md`: the last row is DW-358.

Read-only evidence:
- **The export, A24.** `A24 Post Headers - Spec.md` and `A24-14 Share Row.dc.html`:
  - `:342-347`, `:381`, `:1035`: the ten destinations and four enabled, with the Mastodon instance.
  - `:1013`: Links, "the first N".
  - `:1032`, `:1367`: the setting's floor — Remove "says why it cannot go lower".
  - `:1634-1667`: the native-share ruling.
  - Frame `:154`: the SITE SETTING panel, the nearest drawing of the setting.
- **The export, A25.** `A25 Post Content Layouts - Spec.md`:
  - `:38-41`, `:1371-1398`: native-share, with the fallback not drawn.
  - Designs #1, #3, #4, #7, #8 and #9 draw `<a href="#/share">` (`:435`, `:505`, `:542`, `:650`, `:686`, `:723`).
- **The export, A26.** `A26 Post Footers - Spec.md`:
  - `:204`: twelve designs declare `share` (#1–6, #9–11, #13–15).
  - `:1351` and `:1589`: the same-day reversal.
  - `:1638`: native-share patch notes.
  - `a26-kit.js:44`: `SHARE4`, in a third order.
- **The export, A9.** `A9 FAQ - Spec.md:441`, `:462`: #7 declares `share` for its copy-link button.
- **The export, D6.** `D6 Theme Settings Completed.dc.html` has no share row anywhere. The setting has no frame of its
  own and is extrapolated (R-74).
- **Code that already enforces R-29:**
  - `packages/library/src/vocabulary.ts:346-352`: `PORTAL_PAGE` refuses `share`.
  - `packages/theme-compiler/src/compile.test.ts:1327-1334`: `data-portal="share"` refused.
  - `tools/verify-design-pass.py:246-259`.
- **Prepared, unused:**
  - `packages/library/modules/registry.json`: the `share` row.
  - `packages/library/modules/` holds `core.js` only.
  - `packages/library/strings/catalog.json:36-39`: `post.share`, `post.share_on` "Share on {network}",
    `post.copy_link`, `post.link_copied`. There is no "Email" key.
  - `packages/library/icons/tabler.json`: every brand glyph is vendored.
- **No consumer is built.** `packages/library/designs/` holds a1/1, a4/13, a17/1, a22/1 and a24/1. None declares
  `share`.
- **The tool misreads `share`.** `tools/derive-module-reach.py` lists A10-9 and A10-12 under `share`; both are false
  hits (a field named `share`, and a negated mention). It misses A9-7, because `:154` keeps only the text before "JS
  off". `research-section-js-libraries.md:102` inherits that list.

## Tasks & Acceptance

**Execution** (Question 1, option 1):
- [ ] `_bmad-output/planning-artifacts/epics.md` — move each clause where Design Notes' table sends it -- R-195's
  word-for-word move, and R-118, because no design renders the list before 10.82.
  - **Story 7.15's card.** Add a dated italic note under its criteria, in 7.14's form: the clauses moved, where to, and
    why. Change the last line to `**Owner test:** none (Question 1, option 1)`.
  - **Story 10.82's card.** Add the moved criteria word for word, introduced as "*(moved from Story 7.15 by its
    Question 1, option 1 (owner, <date>), word for word — R-118, R-195)*".
    - Add the frame: "the Theme settings **Share destinations** block is extrapolated from
      `D6 Theme Settings Completed.dc.html` D6a, `A24-14 Share Row.dc.html`'s SITE SETTING panel and
      `P0-3 Item List Controls.dc.html` (R-74), and **matches them**".
    - Add a "handed over at Story 7.15's Create" line listing Design Notes' five readings.
  - **Story 10.23's card.** Add the copy-link clause.
  - **Stories 10.83–10.89.** Each story named in the table gets one line naming its own share designs: they render the
    site's list through 10.82's links, not the `#/share` trigger their frames draw, and are extrapolated from A24 #14's
    drawn row.
  - **Epic 10's preamble.** Add a "Given owners by Story 7.15's Create" numbered list after 7.14's block.
  - **The coverage map.** Change `FR-Q10 | E7` to `FR-Q10 | **E10** (Story 10.82 and the share designs, from 7.15)`.
- [ ] `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md` — on FR-Q10, add a dated note naming the
  ruling and where FR-Q10 is now built -- propagate.
- [ ] `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md` -- this file is
  where the two rulings are reconciled.
  - **A new ruling, numbered after the last one in the file.** It records Question 1's ruling and the 1 September
    ruling it supersedes, quoting the export's words. It lists every receiving story, and records the A25 and A26
    frames' departure.
  - **Its Targets ledger.** Use ✅ for what Dev lands and ⬜ for each receiving story.
  - **Two dated notes.** One on R-29's landing row (`:183`) and one on R-49 (`:1015`). R-49's note says the
    native-share redraw does not happen, so A24's four-maximum stands as drawn and is 10.82's to read.
- [ ] `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/research-section-js-libraries.md` — on `:173`, add a
  dated note: under FR-Q10 the module's only job is copy-link, and `navigator.share()` is not used -- propagate.
- [ ] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/MEASUREMENTS.md` — on §29b, add a
  dated note correcting "opens the sign-in modal" -- propagate.
  - The note says Portal 2.51.5 opens its *default* page: sign-in on an invite-only site or one with no prices,
    sign-up otherwise, the account page for a signed-in member. A bare `#/share` does nothing.
  - Read in source at this Create; the paths are in Design Notes.
- [ ] `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md` — on `:174`'s Theme Settings
  row, add a dated note that share destinations (FR-Q10) arrive with Story 10.82 -- propagate.
- [ ] `_bmad-output/implementation-artifacts/deferred-work.md` — add a DW row for `tools/derive-module-reach.py`'s
  `share` misreads (A10-9, A10-12 and A9-7) and research `:102`, which inherits them -- standing rule 3: a finding
  needs an owner. Owner: Story 10.23's Create, the first story to read the module's reach.
- [ ] `_bmad-output/implementation-artifacts/epic-7-context.md` — add a "Story 7.15's Dev" sub-bullet under Cards,
  treatments and share destinations.
- [ ] Standing rule 7 — grep live documents for `7.15` and `Story 7.15`. Nothing may still assign FR-Q10 work to this
  story.

**Acceptance Criteria:**
- Given Question 1 ruled option 1, when Dev ends, then each of FR-Q10's clauses sits word for word in the card of every
  story Design Notes' table names, and is listed in Epic 10's preamble. A grep for each clause's bolded phrase finds it
  there.
- Given the Theme settings surface moved, when Story 10.82's card is read, then it names its frame,
  `D6 Theme Settings Completed.dc.html` D6a, extrapolated with A24-14's SITE SETTING panel and P0-3. It carries a
  **"matches the frame"** criterion and the owner's hand test of the list (R-74, R-80).
- Given the frames A25 and A26 draw, when Dev ends, then the new ruling records their departure and each receiving card
  names its own designs. No export file changes (`git diff --stat -- _bmad-output/planning-artifacts/design/` is empty).
- Given this story builds nothing, when its diff is read, then only `.md` files, `sprint-status.yaml` and the generated
  board change. `pnpm check` and `apps/web/busy.test.ts` are untouched (R-98).
- Given the work is done, when the gate and CI run, then `python3 tools/doc-audit.py --check` passes, and CI's `check`,
  `rls` and `deploy` are green on the Dev head with the production deployment READY.

## Spec Change Log

## Design Notes

### Routine calls, one line each (said to the owner, not asked)

1. **The move alone would be R-118's routine use.** Stories 7.13 and 7.14 moved requirements at Create without asking.
   Here the whole story moves and two rulings conflict, so the timing rides in Question 1 with the conflict.
2. **Story 10.82 is the first story to render the list.** A24 #14 is the first share-list design in `sprint-status.yaml`
   order. A9 #7 (Story 10.23) uses the `share` module for copy-link only and shows no list.
3. **Storage is not chosen here.** AD-27 says a `doc-schema.ts` row. Story 7.13's dated note on AD-27 put the equally
   site-wide card designs in `project_treatments`. Story 10.82 decides, with its own Schema phase.
4. **`owner_test: none` under option 1**, because nothing on screen changes. The hand test of the list moves to Story
   10.82.

### Where each requirement goes (the one table a ruling changes)

| FR-Q10 clause (Story 7.15's card, word for word) | Option 1 — receiving stories |
|---|---|
| "a project declares **one ordered list**, and **every design that offers sharing renders that list in that order**" | 10.82 (the setting, and A24 #14) · 10.83 (A25 #3, #4) · 10.84 (A25 #1, #7, #8) · 10.85 (A25 #9) · 10.86 (A26 #1, #3, #4, #6) · 10.87 (A26 #2, #5) · 10.88 (A26 #9, #10, #11) · 10.89 (A26 #13, #14, #15) |
| "it is **stored as one row on the project doc**, not per section — a per-section list is how two share rows end up disagreeing" | 10.82 |
| "destinations are emitted as **real `<a href>` URLs built at compile from the post's own canonical URL**: no script, no SDK, no third-party button, and the whole set works with JavaScript off" | 10.82 (builds the links) · each A25/A26 story above (uses them) |
| "**copy-link is the one destination needing a script**, and it is the `share` module's only job" | 10.23 (first `share.js`, for A9 #7) · 10.82 |
| "**Ghost's own Portal share page is not used**, and the reason is a Ghost fact: …" | 10.82 · each A25/A26 story above (their frames draw `#/share`) |
| "the default list ships as an ordered set the owner may reorder or trim, and **an empty list renders no share affordance at all** rather than an empty container" | 10.82 · each A25/A26 story above (an empty list draws nothing) |
| Frame: `D6 Theme Settings Completed.dc.html` D6a · Owner test: yes | 10.82 (with A24-14's SITE SETTING panel and P0-3, R-74) |

**What changes under the other options:**
- **Option 2: built now.** This story builds the setting now and the table's 10.82 rows shrink to the links. The build
  is:
  - storage, with a Schema phase (R-99);
  - a `setShareDestinations` action in `settings/actions.ts` and its row in `apps/web/settings.test.ts:240`;
  - a Share destinations block in `theme-settings.tsx`. Its rows are P0-3's: a handle that is a button, drag through
    `lib/reorder.ts`, ⌥↑/⌥↓, and `movedTo` announced. Its switches post the way `ModeSegment` does, because the Kit's
    `Toggle` is `type="button"`. It also gets a Mastodon instance field;
  - walk step 109, with step 52's exact rail list unchanged;
  - the hand test below.
- **Option 3: Ghost's popup.** The clauses are rewritten to the 1 September ruling and then moved. That means:
  - one trigger to `#/share`;
  - on Ghost 5, Copy link and Email, chosen at compile from the site's Ghost major;
  - two switches in Theme settings;
  - Appendix B, `PORTAL_PAGE` and `compile.test.ts:1327` reversed in Story 10.82;
  - A24 #14 redrawn in Claude Design before Story 10.82.

### Handed to Story 10.82's Create (its readings, not this story's)

1. **First N or the whole list.** A24 #14's Links control (Two · Three · Four) draws "the first N" of the list. FR-Q10
   says every design renders "that list".
2. **The list's floor.** A24's setting keeps Remove "at the floor" and "says why it cannot go lower" (`A24 spec:1032`,
   `:1367`). FR-Q10 says the owner may trim it and an empty list renders nothing.
3. **Three orders are drawn.**
   - A24 #14: Bluesky · Mastodon · Email · Copy link.
   - `a26-kit.js` `SHARE4`: Email · Copy link · Bluesky · Mastodon.
   - A26 #9's fallback: Email · Copy link.

   The export's default is "all ten present and four enabled, in the order A24 drew".
4. **Which URL.** Inside `{{#post}}`, `canonical_url` (when set) or `{{url absolute="true"}}`. Ghost's own `<link
   rel="canonical">` and Portal's share page use the first.
5. **Unverified destination formats.** Each intent URL and Mastodon's `https://{instance}/share?text=` must be executed
   before they are relied on (standing rule 1). So must the catalog's missing "Email" key and `{network}` versus the
   export's `{destination}`.

### Facts this spec rests on (read at this Create, 2026-10-16)

- **R-29's Ghost facts.** `MEASUREMENTS.md` §29b; `reconcile-designs-decisions.md:795-806`.
- **The 1 September ruling, in the export.**
  - `A24 Post Headers - Spec.md:1634-1667` ("native Ghost Share only, everywhere").
  - `A26 Post Footers - Spec.md:1351`, `:1589` ("Reversed the same day by the owner").
  - Treated as live by R-49 (`:1015`) and `tools/design-patch-prompts-4.py:173-176`.
  - Not in `prd.md`, `epics.md` or any ruling entry.
- **Portal, read in source.** @tryghost/portal 2.51.5 and 2.69.339 are the latest patches of Ghost's pins
  (`defaults.json` `~2.51` / `~2.69`), read from each package's `umd/portal.min.js.map`.
  - **2.51:** `getPageFromLinkPath` has no `share` branch (`App.js:808-916`), so it returns `default` (`:915`).
  - **2.51:** `getContextPage` (`:927-931`) turns that into sign-in, sign-up or the account page.
  - **2.51:** a bare `#/share` matches nothing (`:507`, `:1021`).
  - **2.69:** opens its share page on `#/share` (`app.jsx:662, 710-714`).
  - **2.69:** builds X · Facebook · LinkedIn · Threads · Bluesky and email from `link[rel=canonical]`
    (`use-share-data.js:15-42, 52`).
- **Ghost helpers, read in ghost@5.130.6 and ghost@6.58.0.**
  - `helpers/encode.js:9-11` is the same in both: `encodeURIComponent` over its first argument. Given an empty argument,
    it encodes Handlebars' options object, so it must be guarded.
  - `helpers/url.js:15-19`: `{{url absolute="true"}}` is the permalink, `encodeURI`-normalised, never `canonical_url`.
  - `meta/canonical-url.js:5-9`: the post's `canonical_url` wins in the head.
  - Not executed on T1; that is Story 10.82's.

## Verification

**Commands (Dev):**
- `python3 tools/doc-audit.py --check`, run twice -- expected: PASS.
- `git diff --stat <Create head>..HEAD` -- expected: only `.md` files, `sprint-status.yaml` and
  `_bmad-output/planning-artifacts/STORY-BOARD.html`. No `packages/`, `apps/`, `supabase/` or export path.
- Grep `epics.md` for each bolded phrase in Design Notes' table -- expected: each is found in every story the table
  names, and in Epic 10's preamble.
- Grep live documents for `7.15` -- expected: nothing still assigns FR-Q10 work to this story.

**Review, on the real infrastructure (R-82).** A documents-only story still ships through CI.
- GitHub Actions on the Dev head, read with `GITHUB_TOKEN` -- expected: `check`, `rls` and `deploy` success.
- Vercel, read with `VERCEL_TOKEN` and `VERCEL_TEAM_ID` -- expected: the deployment at that sha READY and served by
  app.inflozo.com.
- Not run: T1 and Supabase. Nothing a theme carries or the database holds changes.

## Owner's manual test

**None under Question 1's option 1.** Nothing on screen changes; your hand test of the list moves to Story 10.82.

If you rule **option 2**, these become your test, run after Deploy on a laptop at full width, signed in as yourself.
**Pilot sections** is `b6d4db35-8e5e-45e1-a70f-4daa28916d51`. Step 6 puts everything back.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/settings` | Theme settings | Find **Share destinations**. | — | X, Facebook, LinkedIn, Bluesky, Mastodon, Threads, WhatsApp, Reddit, Email and Copy link in that order, with Bluesky, Mastodon, Email and Copy link switched on, and a Mastodon instance box reading `mastodon.social`. |
| 2 | same | Theme settings | Press Tab until Copy link's handle is focused, then press ⌥↑ three times. Reload. | — | Copy link sits above Email, Mastodon and Bluesky. A voice reads "Moved to position …". After the reload it has stayed there. |
| 3 | same | Theme settings | Switch **Mastodon** off. Reload. | — | Mastodon is still off. |
| 4 | same | Theme settings | In the Mastodon instance box, type the dummy data and save. Then type `not a site` and save. | `fosstodon.org` | The first saves. The second is refused with one sentence, and `fosstodon.org` stays. |
| 5 | same | Theme settings | Switch every destination off. | — | A line saying no share links will show on your site. No error. |
| 6 | same | Theme settings | Switch Bluesky, Mastodon, Email and Copy link back on, drag Copy link back to last, and set the box to `mastodon.social`. | — | The list as in step 1. |

## Questions for the owner

### Question 1 — How should share links work, and when are they built?

**In plain English.**
- **Two of your rulings disagree about share links on your readers' sites.**
  - **31 August** (R-29, the requirements and this story's card): Inflozo makes its own share links. You set **one list**
    once in Theme settings: which places are on, out of X, Facebook, LinkedIn, Bluesky, Mastodon, Threads, WhatsApp,
    Reddit, Email and Copy link, and in what order. Every design that shows sharing uses that list.
  - **1 September**, while the designs were being drawn: "native Ghost Share only, everywhere". One **Share** button
    opens Ghost's own share popup. On Ghost 5, which has no such popup, the button becomes **Copy link** and **Email**.
  - The requirements were never changed to match. Post Headers #14 is drawn the 31 August way. Post Content's and Post
    Footers' share designs are drawn the 1 September way.
- **No design in your library shows share links yet.** The first is Post Headers #14 Share Row, in Story 10.82. Your
  rule R-118 says a control arrives with the story that makes it work. You applied it this week to card treatments
  (7.13) and page-link styles (7.14).

**Example.** A reader finishes a post on your Ghost 6 site.
- **The 31 August way.** Under the title they see your row, "Bluesky · Mastodon · Email · Copy link", in your fonts and
  your order. Every link except Copy link works even with JavaScript off. A Ghost 5 site shows the same row.
- **The 1 September way.** They see one **Share** button that opens Ghost's own popup: X, Facebook, LinkedIn, Threads
  and Bluesky, in Ghost's order and Ghost's look, with no Mastodon. With JavaScript off the button does nothing. A
  Ghost 5 site shows Copy link and Email instead.

1. **Inflozo's own list (31 August), built with Story 10.82.** This story hands its requirements to Story 10.82 and to
   the Post Content and Post Footers stories, word for word, as 7.13 and 7.14 did.
   - Now: nothing changes on screen, there is no hand test, and the story is done once it is deployed.
   - In Story 10.82 you get the list in Theme settings and the Share Row together, and you test both.
   - Post Content's and Post Footers' share designs show your list instead of Ghost's button, copying Post Headers
     #14's drawn row.

   **(RECOMMENDED)** It works without JavaScript and the same on Ghost 5 and 6. It looks like your site, includes
   Mastodon and follows your order. It is also what the code already enforces today.
2. **Inflozo's own list (31 August), built now.** Theme settings gets a **Share destinations** list today: ten rows, drag
   to reorder, a switch on each, and a Mastodon box. You test that it saves (the six steps above). No page on your site
   shows share links until Story 10.82.
3. **Ghost's own popup (1 September), built with Story 10.82.** The requirements and this story's card are rewritten to
   one Share button, with Copy link and Email on Ghost 5. In Story 10.82, Theme settings gets two switches for those two.
   Post Headers #14 is redrawn in Claude Design first. Fewest drawings change, but share does nothing without JavaScript and has no
   Mastodon.

**Ruled:** _(awaiting the owner)_
