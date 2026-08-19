---
title: Inflozo Architecture Stress Test — Round 2
type: stress-test-prompt + round-1 handover
status: ready to run in a fresh session
created: 2026-08-19
supersedes: STRESS-TEST-PROMPT.md (round 1, completed)
---

# Stress-test the Inflozo architecture — Round 2

Be adversarial. Your job is to break it, not to praise it.

Round 1 has already run. **This file carries everything it established.** Read it whole before
you start — the point of Round 2 is to find what Round 1 could not, and you cannot know that
without knowing what Round 1 did.

Run this as **four passes in order**, using the BMAD skills named. Do not skip a pass and do not
merge them: each has a different method, and the point is that they disagree with each other.

---

## Part 1 — Context

**Inflozo** is a visual site builder for Ghost CMS. Users drag pre-made sections onto a canvas;
the product compiles the design into a clean, hand-editable Ghost theme and deploys it. The
central claim is that canvas and shipped site agree **by construction** — one authored source
(annotated HTML) feeds two renderers, one producing canvas DOM and one producing Handlebars
`.hbs` text.

The owner is a solo founder who is not an engineer. Every explanation lands in plain language
with a concrete example, and every finding carries options with one marked (RECOMMENDED).

Base path: `/home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/`

| What | Where |
|---|---|
| The spine — 35 invariants, AD-1..AD-35 | `architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md` |
| Everything claimed as executed | `.../MEASUREMENTS.md` |
| Schema + its runnable RLS proof | `.../SCHEMA.sql`, `.../RLS-TEST.sql`, `.../PRELUDE.sql` |
| External facts still unverified (21 items) | `.../VERIFY-AT-BUILD.md` |
| The decision log for the architecture run | `.../.memlog.md` |
| **Round 1's prompt (for method reference)** | `.../STRESS-TEST-PROMPT.md` |
| **The PRD — v4.1, 366 KB** | `prds/prd-Inflozo-2026-08-17/prd.md` |
| Normative for mechanism (short, read whole) | `prds/prd-Inflozo-2026-08-17/addendum.md` |
| Normative for scope — 484 designs | `prds/prd-Inflozo-2026-08-17/sections-inventory.md` |
| Ghost helper surface per template | `prds/prd-Inflozo-2026-08-17/appendix-b1-template-contexts.md` |
| The string catalog | `prds/prd-Inflozo-2026-08-17/appendix-h1-string-catalog.md` |
| The runnable compiler spike | `prds/prd-Inflozo-2026-08-17/spike-compiler/` |
| The 7 research companions (outrank the PRD body on any Ghost fact) | `prds/prd-Inflozo-2026-08-17/research-*.md` |

**Never read `prd.md` whole.** Read by section with `sed -n`: §4 build order 131-169 · §5 FRs
170-455 · §6 NFRs 456-481 · §7 architecture 482-700 · §8 epics 701-801 · appendices from 802 ·
Appendix F.1 plan matrix ~1037.

### The one rule that governs this project

A claim about an external platform is a hypothesis until read in that platform's source or
executed against it. Four such claims entered this PRD as normative text with the confidence of
research and were verified FALSE — each deleted or damaged a working feature. A fifth was caught
during the architecture run. **Cite or execute. Never assert, and never accept an assertion
because it sounds authoritative.**

Round 1 found a **new variant** of this failure worth watching for: a fact can be correctly read
and still carry a wrong inference. The TypeScript version was read accurately from the registry;
the error was treating "latest" as "compatible." Watch for verified facts carried one step too far.

---

## Part 2 — What Round 1 established. Do not re-derive any of this.

### 2.1 Confirmed by execution — these are facts now

Environment: `node` 22.23.2, `jsdom` 30.0.1, `handlebars` 4.7.9, `gscan` 6.4.2,
PostgreSQL 17 (`docker postgres:17-alpine`).

1. **AD-5's numeric entity encoding cannot survive `outerHTML`.** Via `textContent` the `&`
   double-escapes (`&amp;#123;`, reader sees a literal `&#123;`). Via `innerHTML` — the path AD-4's
   marks serializer forces — the HTML parser decodes `&#123;` back to `{` before serialization and
   the serializer never re-escapes a brace, so user-typed `{{title}}` ships as a LIVE Handlebars
   expression and `{{#if x}}BOOM{{/if}}` evaluates as a block helper. Proven fix: escape AFTER
   serialization via the §7.3 opaque-token mechanic. **Proven on plain text only — see 2.3.**
2. **The two renderers already disagree on an ordinary input.** A `data-prop` inside a
   `data-repeat` ships the library's placeholder plus a raw `data-prop` attribute into the theme,
   while the canvas shows the user's real value. Cause: `renderTheme` extracts the repeat body
   before `applyProps` runs.
3. **The §7.3 opaque-token mechanic has no namespace isolation.** A user typing `__HBS_0__` into a
   text prop gets a live Handlebars expression substituted in. A section author writing
   `<!--__HBS_0__-->` causes an entire `{{#foreach}}` block to be emitted twice.
4. **Nested repeaters break silently.** Inner `data-repeat` ships as a literal HTML attribute, no
   `{{#foreach}}` is emitted, and an orphan partial carries an unresolved `__HBS_1__` into the
   theme. gscan passes it; AD-34's gate does not look for it.
5. **`suggestions_public` allows cross-tenant writes.** `security_invoker` NOT SET (= definer),
   owned by `postgres`, and `authenticated` holds INSERT/UPDATE/DELETE inherited from Supabase
   default privileges that SCHEMA.sql §11 narrows for tables and never for the view. Executed:
   user A deleted user B's suggestion, rewrote its title/body/status, set `vote_count=99999`, and
   inserted a row with `user_id` NULL. RLS on the base table holds correctly.
6. **`edit_locks` has ZERO triggers and is fully client-writable.** Executed: set
   `lock_generation=999`, rewound it to 1, zeroed `unsynced_edits`, forged `holder_session_id`.
   AD-31 explicitly claims `lock_generation` is trigger-guarded monotonic. It is not.
   Same class: `profiles.free_editable_project_id` and `assets.stored_bytes` are client-writable.
7. **`pg_advisory_xact_lock` is STRICT.** A null `site_id` returns NULL and acquires ZERO locks,
   silently. `deploy_jobs.site_id` and `projects.linked_site_id` are both `ON DELETE SET NULL`.
   `hashtext` is int4 — 200k site ids produced 4 collisions.
8. **PostgREST runs one transaction per request**, and the Stack table lists no direct Postgres
   driver — so an advisory lock taken via `supabase.rpc()` releases before the upload begins.
9. **`jsonb` does not preserve object key order** (sorts by length then bytewise). Arrays are
   preserved. `project_templates.doc` is jsonb. Related: JS `Object.keys` hoists integer-like keys.
10. **Per-section compile cost scales ~7.4x** from AD-11's fixture shape (5–7 elements) to a
    realistic heavy section (~780 elements): 15.7 -> 116.4 ms. AD-11 also credits a "4x faster in
    cores" advantage a single-threaded jsdom loop cannot use. The stress fixture is **not checked
    in anywhere in the repo**.
11. **TypeScript 7.0.2 is the Go port.** `require('typescript')` returns
    `{version, versionMajorMinor}` — 2 exports; `createProgram`/`createSourceFile` are `undefined`.
    `typescript-eslint@8.67.0` peers `typescript ">=4.8.4 <6.1.0"`. `next@16.3.1` declares no
    typescript peer, so nothing warns. **TypeScript 6.0.3 is stable, is the full 24.3 MB compiler
    (2,248 exports), and IS inside typescript-eslint's range.**
12. **gscan 6.4.2 source, read directly:** `config.custom` capped at **20** keys
    (`010-package-json.js:162`) — which is exactly FR-Q2's 17 + FR-Q5's 3, so the cap is correct;
    allowed types are `select|boolean|color|image|text`; `color` default must match
    `/^#[0-9a-f]{6}$/i`; snake_case is a hard **error**. **gscan contains ZERO mentions of
    `color_scheme`, `dark_accent_color` or `dark_logo`** — they are ordinary custom settings to it.
13. **Ghost 6.58 source, read directly** (`custom-theme-settings-service.js`): Ghost DESTROYS a
    stored custom-setting value when the setting's `type` changes, and RESETS it to default when
    its value is no longer in the `options` list. AD-9 guards neither axis.
14. **Vercel Fluid shares one instance across concurrent invocations** (docs, 2026-07-01), so
    `memory: 2048` is the INSTANCE budget. `fluid` is a **project-wide** setting in `vercel.json`
    or the dashboard — there is **no per-function fluid toggle**. `maxDuration` explicitly
    "includes time spent processing the request and sending the response," so the theme upload
    counts against the 300 s.
15. **Next 16 CSP** requires nonce + `strict-dynamic`; bare `script-src 'self'` blocks hydration.
    Nonces force dynamic rendering, colliding with the SSG marketing site.
16. **Tailwind 4 has no `content` globs.** It scans every file except `.gitignore`d paths,
    `node_modules`, binaries, lock files and **CSS files**. The 484 `index.html`, 31
    `behaviour.js` and every `design.json` ARE scanned by default.
17. **Supabase backups exclude Storage objects** (docs) — AD-29's claim holds. A PITR restore
    rewinds `storage.objects` metadata while bytes stay current, desyncing both directions.
18. **Ghost Content API CORS is open** — verified live against `demo.ghost.io` (204 preflight,
    `access-control-allow-origin: *`, `accept-version` allowed) and in Ghost source
    (`content/routes.js:14`). Claim holds; no recording exists.
19. **AD-30's "exactly three" is falsified by the inventory.** A9 #11 "Dark Cards — contrast-role
    cards on light page **(and inverse)**" needs a fourth kind of mode-scoping: an interior
    element whose role is relative to the page's and inverts with mode.
20. **§7.3's list of five missing constructs is at least eight.** Missing: pagination (A34, ten
    designs), nested repeats (A9 #6), and positional helpers `@first`/`@index` (A17 #3, A17 #4,
    A12 #9, A9 #3).
21. **Schema gaps confirmed against the live DB:** no trigger on `auth.users` (AD-28's entitlements
    row has no writer); `deploys` has 18 columns and none is the settings snapshot AD-27(a) names;
    `custom_templates_name_guard` is `BEFORE INSERT` only; `sync_vote_count` is SECURITY DEFINER
    with EXECUTE granted to `authenticated` (search_path is pinned, so hygiene not hole).
22. **MEASUREMENTS drift:** §8 states "34 policies across 26 tables" and "0 tables carrying
    user_id without a policy"; the shipped RLS-TEST.sql prints **37 / 28** and lists 2 (both
    deliberate). AD-11 states "gscan 210 ms per spec, so ~420 ms"; MEASUREMENTS records
    217 + 88 = 305 ms.

### 2.2 What SURVIVED attack — do not spend Round 2 re-attacking these

- RLS on every base table. 0 tables without RLS. Cross-tenant reads and writes blocked everywhere
  attacked. No UPDATE/ALL policy is missing a `WITH CHECK` (no re-parenting hole).
- **AD-8 holds:** a user cannot forge, delete or update their own `deploys` rows (0 rows).
- **AD-28 holds at the RLS layer:** a user cannot self-grant `pro_active` (0 rows).
- **AD-31's central insight is correct** — the silent-no-op column REVOKE is real and correctly
  implemented for the columns it covers. All 23 RLS-TEST assertions pass. The gap is scope only.
- **AD-19's choice of the transaction-scoped lock variant is right** — it releases cleanly at
  COMMIT, which is what makes it pooler-safe. The session-scoped variant would have been a real bug.
- **AD-7, AD-9, AD-6:** server-only tables deny correctly; `is_admin`, `custom_settings.key` /
  `frozen_at` and `deployed_template_names.filename` are genuinely frozen; the 17-setting cap, the
  6-digit-hex rule and the `credit.*` namespace lock all hold.
- **AD-11's DECISION survives** its flawed measurement — 300 s / 2048 MB still holds at 7.4x.
- **MEASUREMENTS §3, §4, §5, §6, §7, §10, §12 are sound.**
- **AD-23 works when applied** — VERIFY-AT-BUILD's 21 items have owners and refutation
  consequences. Every Round 1 gap was outside it, not a duplicate of it.

### 2.3 Round 1's OWN blind spots — Round 2 starts here

Round 1 states these honestly. Each is a real hole in the evidence, not a rhetorical hedge.

1. **AD-5's replacement fix was proven on PLAIN TEXT ONLY.** AD-4 says a text prop is
   `{text, marks[]}` over `strong|em|u|a` and that `marks.ts` is the single serializer. The fix was
   never tested with **marks interleaved with braces** — e.g. a user bolding half of `{{title}}`,
   or a link whose `href` contains braces. That is the exact composition that broke the original.
2. **No real Ghost was ever stood up.** Every Ghost claim is source-read or docs-read. Nothing was
   rendered at runtime on 5.x or 6.x.
3. **gscan was never RUN by Round 1** — only its source read. The spike's `build.js` runs it; that
   was not exercised.
4. **The AD-11 re-measure used synthetic sections**, not real library designs, because no real
   designs exist yet.
5. **Determinism was shown as HAZARDS, not as an actual byte-difference** across two machines or
   two runs. No two-machine comparison was performed.
6. **Never tested at all:** the marks serializer, the ICU MessageFormat path (FR-Q8), the
   DOMPurify/SVG upload path (FR-K2), the CSP in a running Next app, the canvas renderer beyond the
   repeater case, Variant Shuffle / Site Remix preservation, the Style Pack token system, the
   synthesis defaults, the entitlement state machine, accessibility / the render matrix.

---

## Part 3 — Decisions already taken. Treat as SETTLED; do not re-litigate.

33 findings were put to the owner with options. **All 33 were decided as recommended.** Two
carry corrections made after the fact, marked below. Round 2 may find a decision WRONG on new
evidence — that is in scope and valuable — but it must not re-open one merely to re-argue it.

### Tier 1 — before more code is written
| # | Decision |
|---|---|
| 1 | **AD-5: escape AFTER serialization**, via the opaque-token mechanic. |
| 2 | **Fill in user text BEFORE extracting the repeat body** (reorder in `renderTheme`). |
| 3 | **Make `suggestions_public` `security_invoker = true` and revoke write grants through it.** |
| 4 | **Pin `typescript@6.0.3`** (corrected from "5.x/6.x line" — 6.0.3 verified as full compiler and inside typescript-eslint's peer range). |
| 5 | **Two CSP policies** — nonce-based on `app.inflozo.com`, static on `inflozo.com`. |

### Tier 2 — before the compiler epic (E4/E7)
| # | Decision |
|---|---|
| 6 | **Substitute user text LAST**, with an unforgeable marker shape (e.g. `{§0§}`) that escaped user text can never contain. No random nonce — it would break AD-14. |
| 7 | **A then B:** first assert no directive attribute (`data-repeat|bind|prop|partial|empty`) and no compiler token survives into the emitted tree; then support nested repeats. |
| 8 | **Rebuild §7.3's missing-constructs list by walking the full 484-design inventory** before E4 starts. |
| 9 | **AD-30: add an inverse colour pair to the token block.** Invariant survives; enumeration grows from three to four. |
| 10 | **Rebuild the stress fixture with realistic sections, check it into `tools/stress/`, re-run under Node 24 in a 2 GB container.** |
| 11 | **CORRECTED:** keep Fluid ON (it is project-wide, not per-function — turning it off would strip the whole app). Set per-function `memory`, set an explicit upload timeout below `maxDuration`, measure concurrency during E0 as part of #10, and isolate the compile function into its own Vercel project ONLY if measurement demands it. |

### Tier 3 — database and deploy safety
| # | Decision |
|---|---|
| 12 | **Replace AD-19's advisory lock with a lease record** — a "who's deploying" row with a timestamp and expiry. Survives all three defects (null key, one-transaction-per-request, unbounded blocking) instead of patching each. |
| 13 | **Column-lock `edit_locks`, `profiles`, `assets`** via revoke-then-grant, and add the `lock_generation` monotonic trigger AD-31 already promises. |
| 14 | **Create the `entitlements` row at signup via a trigger, owned by E1's schema story.** |
| 15 | **Add the settings-snapshot column to `deploys`.** |
| 16 | **Extend the custom-template rename guard to UPDATE; remove browser EXECUTE on `sync_vote_count`.** |

### Tier 4 — verify or write down
| # | Decision |
|---|---|
| 17 | **Rename to "the three FR-Q5 dark keys"; re-open §7.6 item 19 scoped to Ghost's RUNTIME** (it was closed against gscan only). |
| 18 | **Extend the AD-9 freeze to a promoted setting's `type` and its option set.** |
| 19 | **Add `@source not "../../packages/library";` plus a CI size assertion.** |
| 20 | **Add three checks to the FR-J17 gate:** `{{body_class}}` present; a generic family after the `var(--gh-font-*)` fallback; snake_case enforced on user-named promoted settings. |
| 21 | **Fidelity rotation (NFR-6(c3)) runs on a container schedule, not a Vercel cron.** AD-33's "one home" rule gets a stated carve-out. |
| 22 | **Capture three recordings into `fixtures/`:** the malformed-`visibility` gscan cascade, the Ghost CORS transcripts, the rebuilt stress fixture. |
| 23 | **Add "reconcile `storage.objects` against each bucket" to NFR-4's restore drill.** |
| 24 | **Quote MEASUREMENTS verbatim in the spine; stop restating numbers in two places.** |

### Tier 5 — reasoned, decided at epic open
| # | Decision |
|---|---|
| 25 | **Split `project_treatments`** into one table per owning epic. |
| 26 | **Pagination is ONE project-level setting** (`project_treatments.pagination_design_id`, already in the schema — nothing to build). Both entry points — the main feed's control panel and Theme Settings — are two surfaces onto that one value. The 28 non-placeable treatments are project selections, not AD-3 controls. |
| 27 | **Every design stylesheet's selectors are rooted at its own identity class** (`.d-{categoryId}-{n}`). Highest cost if deferred — one sentence now, a 484-file rewrite later. |
| 28 | **`parkedControls` is keyed `{designId}.{controlKey}`.** |
| 29 | **Make AD-25's prune exemption conditional on `resolved_at`.** |
| 30 | **One shared notifications schema file**; exempt cross-epic shapes from the colocation convention. |
| 31 | **Correct AD-14's compile signature before E4 builds the NFR-6(c1) harness.** |
| 32 | **Work the edit-lock protocol through as a state diagram before E5 builds it.** |
| 33 | **Clear a row's storage-path column in the same step that deletes its bytes.** |

### Open riders — recommended in Round 1, not yet decided

- **Finding 3's companion (B):** open `SCHEMA.sql` with
  `alter default privileges in schema public revoke all on tables, sequences, functions from anon, authenticated`
  so every future object grants IN rather than out. Round 1 recommended pairing this with decision
  3; only 3 was selected. **This is the change that stops the `suggestions_public` class from
  recurring on every future view, function and table.** Round 2 should press on it.
- **AD-26's per-migration checklist** currently gates new TABLES on RLS + an `rls.sql` row. It says
  nothing about views or functions. Unresolved.

### ⚠️ A live contradiction — flag, do not resolve

`research-ghost-binding-contexts.md` and Ghost's own docs both state the tiers endpoint filters by
visibility; `research-ghost-membership-pages.md` read the code and believes both wrong. Both are
normative companions in the same tree. Tracked as VERIFY-AT-BUILD item 14b; resolvable only by
execution against a running Ghost. FR-H6's explicit `visibility:public` filter is safe either way,
so it blocks nothing today. **If you find another such pair, stop and say so rather than picking one.**

---

## Part 4 — The four passes

### PASS 1 — Execute. No skill; this is hands-on.

Do this first, because no review skill does it. The lenses reason; they do not run anything, and
this project's entire failure history is reasoning that sounded right. You have `node`, `npm`,
`docker`, `curl` and web access.

**Start with Round 1's own biggest hole — the fix it proposed but only half-proved.**

Decision 1 replaces AD-5's rule with "escape after serialization." That was proven on plain text.
**It was never proven with marks.** AD-4 mandates `{text, marks[]}` over `strong|em|u|a`, and
`marks.ts` as the single serializer feeding both renderers. Build that serializer and prove the
composition:

- a user bolds half of `{{title}}` — the mark boundary falls INSIDE the brace run
- a link whose `href` contains `{` and `}`
- a mark boundary landing between the two `{` of `{{`
- nested marks over a brace run
- the plain-text lock (FR-Q3) truncating `marks` to `[]` on text containing braces
- paste normalization on pasted HTML containing both marks and braces

Then verify the ordering constraints compose: marks -> escape -> serialize -> unwrap markers ->
resolve Handlebars tokens -> substitute user text LAST (decision 6). Prove no ordering exists in
which a user string becomes live.

Then execute against these, in expected-yield order:

1. **Run the spike and gscan for real.** `cd spike-compiler && npm install jsdom handlebars gscan
   && node test.js && node build.js`. Round 1 never ran gscan. Confirm 16/16 and 0/0 on both specs
   reproduce, then break them: feed the compiler the adversarial inputs from 2.1 items 2, 3 and 4
   and see what gscan says about the resulting theme. The claim to test is that **gscan cannot see
   any of them**.
2. **Determinism for real (AD-14).** Round 1 showed hazards, not a difference. Produce an actual
   byte-difference: compile the same doc twice with different `LANG`, different `TZ`, a doc
   round-tripped through `jsonb` vs one straight from JS, and layer names that slug-collide
   (`Hero` / `HERO` / `Héro`) or are integer-like (`404`, `12`). NFR-6(c1)'s committed snapshots and
   FR-J16's zero-false-positive drift check both rest on this.
3. **Stand up a real Ghost** (`docker run -d -p 2368:2368 ghost:5-alpine` and `ghost:6-alpine`).
   This is the single largest gap in the whole evidence base — 21 VERIFY-AT-BUILD items and every
   Ghost claim in the spine are source-read only. Highest-value targets, in order:
   (a) do `color_scheme` / `dark_accent_color` / `dark_logo` render as anything special in Admin,
   on 5.x and on 6.x? (decision 17); (b) retitle a page that has a template selected — does the
   template still apply? (VERIFY 14a, load-bearing under FR-I1/FR-D6/A30); (c) `{{#get "tiers"}}`
   with a hidden tier (VERIFY 14b, the live contradiction); (d) what `{{body_class}}` actually
   emits (decision 20); (e) upload a theme and time it (decision 11's upload budget).
4. **The RLS proof, again, after decisions 3/13/14/15/16.** Stand it up
   (`docker run -d -e POSTGRES_PASSWORD=x postgres:17-alpine`, apply PRELUDE -> SCHEMA -> RLS-TEST).
   Round 1's attacks are listed in 2.1 items 5, 6, 21 — **re-run them as regressions**, then attack
   what Round 1 did not: `storage.objects` beyond the three policies, the service-role path,
   sequences, and every relation an authenticated session can reach that is neither table nor view.
5. **The paths Round 1 never touched:** the ICU MessageFormat parser (FR-Q8 — one unbalanced brace
   500s every page rendering that label, and it interacts with decision 1's brace handling), the
   DOMPurify SVG upload path (FR-K2), and the CSP in a scaffolded Next 16 app (decision 5).

### PASS 2 — `/bmad-review lenses=adversarial,edge-case-hunter,verification-gap`

Run it over `ARCHITECTURE-SPINE.md`, `SCHEMA.sql` and `MEASUREMENTS.md` together, carrying Pass 1's
executed findings in as `also_consider`, plus Part 2 of this file so no lens re-derives Round 1.

The **adversarial** lens is load-bearing and requires at least ten concrete findings — an empty
list is a signal to re-check, not a pass. Round 1 pointed it at epic pairs and it produced 18
findings. **Point Round 2's at different one-level-down units**, because the epic-pair seam is
now well mined:

> Take the 33 decisions in Part 3 as implemented. Construct pairs of them that are each
> individually correct and **jointly incoherent** — where applying both produces a system neither
> intended. Round 1's own headline failure was exactly this shape: AD-4 and AD-5 are each correct
> alone and cancel when composed. Find the next one.

Also aim it at the units Round 1 never opened: the 12 Style Packs against the 484 designs; Variant
Shuffle (FR-D13) and Site Remix (FR-D17) against FR-D19 parking and decision 28; the Synthesis
Defaults (FR-D6) against AD-22 and AD-27(d); Appendix F.1's plan matrix against AD-28.

The **verification-gap** lens: Round 1 found 18 gaps in the spine and MEASUREMENTS. Point Round 2's
at the sources those documents rest on — the **seven `research-*.md` companions**, which outrank the
PRD body on any Ghost fact and were never themselves audited. Same question: which claims read like
facts about an external platform but carry no citation, no fixture and no executed evidence?

The **edge-case-hunter** lens: aim it at the surfaces Round 1 skipped — the Style Pack token
resolution, the synthesis/main-feed designation rule, the entitlement state machine, and the
render matrix — not at the compiler or the edit lock, which Round 1 covered heavily.

### PASS 3 — `/bmad-party-mode --party ghost-build-room`

That party is persisted for exactly this kind of question, and its memlog now carries Round 1.
Put the **Ghost-specific** claims in front of it — the ones where being wrong is expensive:

- Round 1 proved the directive vocabulary is missing at least three constructs. **Walk the full
  inventory with Ravi and produce the complete list**, category by category, so decision 8 has an
  answer rather than an instruction.
- With a real Ghost now running (Pass 1 item 3), put the four VERIFY-AT-BUILD items that block
  epics — 11, 13, 14a, 15 — in front of the room with actual output rather than source reading.
- Does anything in the theme structure or helper surface break on **Ghost 5.x**, which NFR-7
  supports publicly and T3 tests permanently? Round 1 raised this for the three dark keys and got
  no further.
- **A33 Koenig Card Treatments (6 designs) and the `card_assets.exclude` mechanic.** MEASUREMENTS §7
  found excluding one card adds 10 warnings the theme must then satisfy. Six designs times that
  multiplier is unexamined, and it lands on E7 and E10 simultaneously.

### PASS 4 — `/bmad-advanced-elicitation`

Take everything from passes 1-3 and run **red team** and **pre-mortem** over the synthesis.

The pre-mortem framing: *it is eighteen months out, the library is built, all 33 decisions in Part 3
were implemented as written, and the architecture failed anyway. What failed?*

That framing is deliberately different from Round 1's. Weight it toward:
- a decision in Part 3 that was implemented **correctly** and turned out to be the wrong decision
- a Round 1 finding that was fixed in one place and not propagated to its siblings
- an unverified external claim propagating — the failure mode this project has suffered four times

---

## Part 5 — Reporting

One consolidated report at the end, ranked by severity. For each finding:

- **What breaks** — concretely. Name the two units that diverge, or the input producing wrong output.
- **How you know** — the command and its output, or the source file and line. Neither means it is
  an opinion; mark it as one.
- **Which AD or which Part 3 decision** is missing, wrong, or too loose.
- **What you would change** — one sentence.

Separate **CONFIRMED** (executed) from **SUSPECTED** (reasoned). Do not inflate. Say plainly which
invariants survived — knowing what held is as useful as knowing what broke.

**Then, in a second section, restate every finding in layman terms** with numbered options and one
marked **(RECOMMENDED)**. The owner is not an engineer and will decide from that section. Use
concrete analogies; never leave a recommendation implicit.

**Do not edit any file** unless the owner asks. Report only. If two approved decisions contradict
each other, stop and say so rather than picking one.

### Do not spend the run re-deriving these

Confirmed by execution across the architecture run and Round 1, independently re-checked:
Handlebars' backslash escape is not composable; `{{x}}}` is a parse error; `GS100` is an error on
both gscan specs and fires when any declared `config.custom` key is unreferenced, with `{{#if}}`
guards and partials both counting as references; `GS051-CUSTOM-FONTS` requires both font variables
in one file; excluding a Koenig card restores gscan's rules for it; Vercel's limits (Pro 300 s
default / 800 s max, 2 GB default / 4 GB max, 4.5 MB body cap); Ghost `main` bundles gscan 6.4.2 and
handlebars 4.7.9; `middleware.ts` is deprecated in Next 16 for `proxy.ts`; a Vercel env var cannot
change without a redeploy; a column-level REVOKE is a no-op while a table-level GRANT stands; plus
everything in Part 2.1 and Part 2.2 of this file.

### One overlap to know about

`/bmad-architecture` with the **validate** intent runs the Reviewer Gate against the spine and
produces a bespoke HTML report. That gate has already been run on this spine and its findings are
folded in. Run it **last, and only if you want the HTML report as a deliverable**; expect it to
partly re-cover Pass 2.
