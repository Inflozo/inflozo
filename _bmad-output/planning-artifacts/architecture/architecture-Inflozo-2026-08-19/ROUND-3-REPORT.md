---
title: Inflozo Architecture Stress Test — Round 3 report
type: stress-test report
status: findings for owner decision
created: 2026-08-20
branch: round-3
passes_run: "1 (execute), 2 (bmad-review: adversarial, edge-case-hunter, verification-gap), 3 (ghost-build-room), 4 (red team + pre-mortem)"
---

# Round 3 — report

## Which passes ran

**All four.** Round 2's most useful admission was that three of its four did not, so this is stated first.

| Pass | Ran | Note |
|---|---|---|
| 1 — execute | ✅ full | Deliberately small per R3 Part 4, but it closed R1 decision 10 and VERIFY-29 |
| 2 — `/bmad-review` adversarial · edge-case-hunter · verification-gap | ✅ | Run in-session rather than fanned out to subagents |
| 3 — `/bmad-party-mode --party ghost-build-room` | ✅ | Headline deliverable: R1 decision 8, the full 484 walk |
| 4 — `/bmad-advanced-elicitation` red team + pre-mortem | ✅ | Framed as R3 Part 4 specified |

**Two Pass-1 items did not run, and neither is blocked on reasoning:**

- **Fluid concurrency (R1 decision 11)** — needs a Vercel project. Not executable here.
- **CSP in a scaffolded Next 16 app (R1 decision 5)** — deprioritized against the reasoning passes once Pass 1 had produced more than its budget. Still only reasoned, now for a third round.

---

# Section 1 — Findings

## CONFIRMED by execution

### F1 · The checked-in spike still ships the escaping rule AD-5 refuted, and its tests assert the refuted behaviour as correct

**What breaks.** `spike-compiler/compile.js:41` is still `escapeHbs = (s) => String(s).replace(/\{\{/g, '\\{{')` — the backslash form `MEASUREMENTS.md` §3 proved does not work and AD-5 replaced. Executed against the checked-in spike with `handlebars@4.7.9`:

| user types | spike emits | Ghost renders |
|---|---|---|
| `Try {{@site.title}} here` | `Try \{{@site.title}} here` | `Try {{@site.title}} here` — inert ✅ |
| `C:\{{title}}` | `C:\\{{title}}` | **`C:\LEAKED-PROP`** — live evaluation |
| `C:\{{@site.title}}` | `C:\\{{@site.title}}` | **`C:\MY GHOST SITE`** — the site's own title interpolated into the user's headline |
| `C:\{{#if title}}yes{{/if}}` | `C:\\{{#if title}}yes\{{/if}}` | **theme will not compile** — Handlebars parse error |

**How I know.** `node attack2.js` against an unmodified copy of `spike-compiler/`. The escape ladder reproduces `MEASUREMENTS.md` §3 exactly: 1 backslash inert, 2 → `\LIVE`, 3 → `\\LIVE`.

**Why no round caught it.** `test.js:65` asserts exactly one case — `assert(evil.template.includes('\\{{@site.title}}'))` — and that is the single case the broken rule handles. So **16/16 still passes**, and both rounds cited "the spike reproduces, 16/16" as evidence of health. `MEASUREMENTS.md` §1 says "The spike is reproducible, not merely reported"; the spine's `sources:` block lists it as a normative source; `spike-compiler/README.md` item 6 states the refuted claim as a proven result.

**It has a sibling.** `verify-mechanical-theme-and-math.md` — which the spine designates as *outranking the review findings it checks* — recommends a **different** backslash remedy at Claim 9: "double any run of backslashes preceding a `{{`, then escape the brace." Executed: `C:\{{x}}` → emits `C:\\\{{x}}` → renders **`C:\\LIVE-VALUE`**. Also refuted.

**Which AD.** AD-5, R1 decision 1, `MEASUREMENTS.md` §1 and §3.

**What I would change.** Re-point `spike-compiler/` at AD-5's numeric entities, replace `test.js` §4 with the five-case ladder above, correct the README's item 6, and add a correction block to `verify-mechanical-theme-and-math.md` Claim 9 — the same treatment Round 2 gave the two research companions.

> This is the Round-2 failure variant, third occurrence: **an unverified claim propagating from inside something that looks like evidence.** `PRELUDE.sql` and `checkVersion: 'v5'` both looked like proof. So does a runnable spike that prints `16 checks passed`.

---

### F2 · AD-5's CI assertion is falsified by the one construct every Ghost layout requires

**What breaks.** AD-5 rule 2 and PRD §7.3 mechanic 3 both state that **compile CI asserts the emitted theme contains zero `{{{` and zero `}}}` sequences**, and both call the assertion "exact". A Ghost layout must contain `{{{body}}}`.

**How I know.** Read out of the shipped Ghost 5.130.6 image: `casper/default.hbs:77` and `source/default.hbs:56` both use `{{{body}}}` — the only two triple-stashes in either theme besides one `{{{rule}}}`. `express-hbs/lib/hbs.js:527` sets `locals.body = htmlStr` — a plain string, not a SafeString — so `{{body}}` would HTML-escape the entire rendered page. The spike's own `build.js` emits `{{{body}}}`. The Round 3 stress theme reports `{{{ x1 · }}} x1 in default.hbs`.

**Consequence.** The assertion fails on every build Inflozo will ever produce. It therefore gets deleted or quietly relaxed by whoever first hits it — and what it was actually protecting (`:root{--a:{{@custom.x}}}` is a parse error) goes unguarded, silently.

**What I would change.** State it as what it protects: exactly one permitted `{{{body}}}` in `default.hbs`, zero `{{{` / `}}}` in every other emitted file.

---

### F3 · VERIFY-AT-BUILD 29 resolved — the headline risk is refuted, and a different one replaces it

Run against the **real** storage schema: `storage-api v1.61.7` migrating a `supabase/postgres:17.6.1.140` database. Not a stand-in.

**Refuted, and this is good news.** `storage.buckets` ships **RLS enabled with zero policies**. As `authenticated`: `select ... from storage.buckets` returns **0 rows**, and `update storage.buckets set public = true where id = 'site-snapshots'` affects **0 rows**. A client cannot list buckets or flip `public`. **AD-32's "no bucket is public" holds by default and needs no new policy.**

**What replaces it.** The platform's own migration `0046-buckets-objects-grants.sql` executes verbatim:

```sql
grant all on storage.buckets, storage.objects to service_role, authenticated, anon
```

`grant all` confers **TRUNCATE**, and TRUNCATE is not subject to RLS. Executed as `authenticated`:

```
NOTICE:  TRUNCATE storage.objects SUCCEEDED as authenticated
objects remaining after the probe: 0
```

This is **R2-3's finding reproducing in the real platform** rather than in `PRELUDE.sql`. Round 2 concluded "not a production hole; a harness hole" on the grounds that "Supabase documents SELECT, INSERT, UPDATE, DELETE only". That is true of the `public` schema. The **storage** schema grants more than the docs describe — and it is the schema holding the two buckets AD-29 calls irreplaceable.

**Not reachable today, stated precisely.** `storage` is not in Supabase's default `PGRST_DB_SCHEMAS` (`public, graphql_public`), so no browser client can issue TRUNCATE. The exposure needs a path that runs SQL as `authenticated` against `storage`: an exposed schema, or a `SECURITY INVOKER` function in `public` that touches it.

**What I would change.** `revoke truncate on storage.buckets, storage.objects from anon, authenticated;` in the E1 migration, plus an assertion in `supabase/tests/rls.sql` — because Supabase manages this schema and may re-grant on a storage-api upgrade.

---

### F4 · AD-11's decision survives; its headroom is ~2.2× worse than stated

R1 decision 10 is closed. `tools/stress/` is checked in: 70 realistic sections over 7 templates, 197 files, 10.20 MB, **mean 39.1 elements and 21.0 directives per section** against the spike's toy hero at 5 and 3.

| | AD-11 states | measured, node 24 · 2 GB · 1 vCPU | worst (musl) |
|---|---|---|---|
| total wall | ~2.1 s | **~3.9 s** | ~4.7 s |
| peak RSS | ~290 MB | **486 MB** | 456 MB |
| headroom vs 300 s | ~140× | **~64×** | |
| headroom vs 2048 MB | ~7× | **~4.2×** | |

**§7.1's gscan-boundary split still does not trigger and is still not built.** The number moved; the decision did not — which is the point of measuring. Full table at `MEASUREMENTS.md` §14.

Same caveat §2 carries: the fixture reads no Storage bytes and subsets no fonts.

---

### F5 · Three defects in the pipeline as decided, none visible on a two-section fixture

Found by building `tools/stress/` to the decided design rather than to the spike's:

1. **Token resolution must run in reverse insertion order.** Repeats process deepest-first (R1 d7), so an inner repeat's tokens are inserted *before* the outer replacement that carries them into the string. Forward order — what the spike does — substituted them before they existed and **ten `partials/*.hbs` shipped raw tokens**.
2. **User-text substitution must be one regex pass, not a loop of per-marker replaces.** A loop re-scans its own output, so a user typing the slot-0 marker shape inside slot 3's text gets it written to the file *after* slot 0 was processed. It also cost **289 ms vs 8 ms** — 36×.
3. **The escaper must strip the marker delimiters.** R1 d6 asks for "a shape escaped user text can never contain"; that holds only if the escaper removes it.

---

### F6 · `GS050-CSS-KGWF` is an error on both majors even under `card_assets: true`

A theme that never styles `.kg-width-wide` and `.kg-width-full` scores **1 error on gscan 4.49.7 and 1 on 6.4.2**. It fires with **no** card exclusion at all, so it sits outside `MEASUREMENTS.md` §13d's exclusion arithmetic entirely. Lands on E6 (token emission) and E7 (compile validation).

Also executed: **gscan does catch an unresolvable partial reference** (`GS005-TPL-ERR`, error on both majors). It does not catch an orphan partial — AD-34's assertion remains the only thing that can.

---

### F7 · DOMPurify's defaults leave `<style>` and `@import` inside an SVG, and nothing names a configuration

16-payload SVG XSS corpus, `dompurify@3.4.14` + `jsdom@30.0.1`:

| configuration | payloads surviving |
|---|---|
| DOMPurify defaults — what "sanitize with DOMPurify" reads as | **2 / 16** |
| defaults + `USE_PROFILES: {svg}` — the common recipe | **2 / 16** |
| hardened — svg profile, `foreignObject`/`use`/`style` forbidden | **1 / 16** |

Script, `onload`, `onerror`, `foreignObject`+`iframe`, `xlink:href="javascript:"`, external `use`, CDATA-wrapped script and comment-broken script are all removed by defaults — DOMPurify is doing its job. What survives defaults is `<style>@import url(https://evil.example/x.css)`, which is a live external fetch whenever the SVG is viewed as a document rather than through `<img>`, and a DTD prologue that leaks `]&gt;` as visible text.

The spine's conventions row says only "an uploaded SVG is sanitized with DOMPurify (FR-K2)" and the Stack pins it as "current". **The configuration is the entire security property**, and no artifact names one.

---

## CONFIRMED by reading, with file and line

### F8 · The only sanitizer in the product runs on the client, on the one bucket the client writes directly

Three individually correct rules, jointly incoherent:

- Conventions (`ARCHITECTURE-SPINE.md:314`): "an uploaded SVG is sanitized with DOMPurify (FR-K2)" — and DOMPurify is named "the **only** sanitizer in the product".
- **AD-12**: "FR-K2's existing **client-side** `canvas.toBlob` pass emits the rendition set in the same pass".
- **AD-32**: "`assets/{userId}/…` is the one bucket **the client writes directly**, because FR-K2's optimization happens in the browser and a server round-trip would double the egress P5 exists to avoid."

So the sanitizer is advisory. A client that simply does not run it writes the raw SVG straight to Storage. For `assets/` the victim is the uploader — self-XSS on the Supabase storage origin. **`suggestion-images/` is the one that is not self-inflicted:** it is also client-written (`SCHEMA.sql` §12, `suggestion_images_owner_write`) and is served to the public board through FR-M3's approval gate, so a hostile SVG that an admin approves is served to every visitor.

**What I would change.** Sanitize server-side — on the signed-URL mint at minimum, on ingest preferably — and name the DOMPurify configuration in the conventions row rather than the library alone.

---

### F9 · ⚠️ LIVE CONTRADICTION — R1 decision 12 against Round 2's survival finding, on AD-19

**R1 decision 12** (approved, Tier 3, "before more code is written"): *"**Replace AD-19's advisory lock with a lease record** — a 'who's deploying' row with a timestamp and expiry. Survives all three defects (null key, one-transaction-per-request, unbounded blocking) instead of patching each."*

**Round 2's survivals** (`STRESS-TEST-R3.md` §2.3): *"**AD-19's** transaction-scoped lock variant is the right choice."*

Decision 12 was **never applied** — `grep` finds no lease record anywhere in `SCHEMA.sql`, and `ARCHITECTURE-SPINE.md:201` still reads `pg_advisory_xact_lock(hashtext('site:' || site_id))`.

Two approved rounds assert opposite things about the same AD. **Per R3 Part 3, I am stopping and saying so rather than picking one.** The owner decides which stands; whichever it is, the other must be struck from its record so a fourth round does not re-find this.

---

### F10 · Two more approved Round 1 decisions were never applied

- **R1 decision 21** — fidelity rotation runs on a container schedule, "AD-33's 'one home' rule gets a stated carve-out." AD-33 (`ARCHITECTURE-SPINE.md:288`) still lists fidelity rotation among the six crons under "every cron lives in `apps/web/app/api/cron/{name}` with its schedule in `vercel.json`". **No carve-out is stated.**
- **R1 decision 24** — quote MEASUREMENTS verbatim, stop restating numbers in two places. AD-11 still restates seven of them, and `MEASUREMENTS.md` §8's "34 policies across 26 tables" still disagrees with the shipped proof's 37 / 28 (Round 2 confirmed the drift reproduces).

---

### F11 · AD-28's resolver has three states; F.1, its declared sole data source, defines two

`SCHEMA.sql:452` — `create type public.entitlement_state as enum ('free','pro_active','pro_past_due')`.

Appendix F.1 (`prd.md:1053`) — *"This table is the **sole definition** of Free/Pro gating"* — has exactly two columns: **Free** and **Pro**.

So what a `pro_past_due` user may do during AD-28's 7-day grace is undefined in the one table AD-28 names as its single source — and "they will disagree on the 7-day grace, on `pro_past_due`" is verbatim the divergence AD-28 was written to prevent. Five epics read `resolveEntitlement`; its data source cannot answer for a third of its own state space.

---

### F12 · R2-7's "a shape a section author's HTML comment cannot contain" is unsatisfiable as stated

The compiler carries its own tokens **inside HTML comments** (`doc.createComment(...)`). The set of shapes an author's comment cannot contain is exactly the set containing `--` — which is exactly the set the compiler cannot use either, because a comment containing `--` is invalid HTML and does not survive re-parsing. The requirement is self-cancelling.

Hit empirically in Pass 1: building the fixture, the only shape available was C0 control characters, which are unforgeable in practice but only because a section author is unlikely to paste one — not because the format forbids it.

**What I would change.** Stop resting on shape. The library is Inflozo's own data (AD-2), so a CI lint over the 484 `index.html` files is total, cheap, and cannot be forgotten by an author — which a convention can.

---

### F13 · AD-30's second mode-scoped expression is not expressible

AD-30 gives each of FR-D7's three mode-scoped things "one expression". The second reads: *"**A mode-specific toggle** is a control whose value differs per mode; it emits a single `data-{control}` attribute whose *value* is token-resolved, never a `-dark` twin."*

An attribute in emitted HTML is **static**. Its value cannot differ per mode. If the difference lives in the token the attribute resolves to, then the control is not per-mode — the *token* is, which is case one (background role) again. A control whose **named value** differs per mode — Top divider: `Line` in light, `Fade` in dark — needs either a second attribute or a mode-selecting rule in a design stylesheet, and AD-30 forbids both ("the token block and the base stylesheet are the only files in a generated theme that mention a mode").

This is distinct from Round 1 finding 10 (AD-30's "exactly three" being falsified by A9 #11). That one grows the enumeration; this one says the second member of the enumeration has no working expression.

---

### F14 · AD-29 calls `deploy-artifacts` "regenerable by recompiling"; AD-14 and FR-J14 make that false

AD-29 justifies giving `deploy-artifacts` no protection: *"`deploy-artifacts` is regenerable by recompiling"*. But AD-14 says compile is a pure function of *what it was handed* — and the library is one of those inputs. FR-J14 moves the library monthly. Recompiling last quarter's doc against today's library produces a **different theme**.

FR-J9's rollback redeploys a *stored artifact* precisely because recompiling would not reproduce it. So "regenerable" is false for any artifact older than one library release — and it is the stated reason that bucket carries no durability rule.

---

### F15 · AD-17 forces `default.hbs` to carry a scheme class; AD-30 says only two files may mention a mode

AD-17: `color_scheme` "is emitted as the body class FR-E4's precedence actually resolves on (`scheme-light` / `scheme-dark`)". That class is emitted in `default.hbs`, beside `{{body_class}}` (Round 2 proved `body_class` carries nothing from `@custom`). AD-30's invariant names only "the token block and the base stylesheet". Minor, but it becomes a CI rule that fails the build the first time someone writes it literally.

---

## The Pass 3 deliverable — R1 decision 8, finally walked

Round 1 said §7.3's five missing constructs is "at least eight" and left it as an instruction. Walking all 34 categories of `sections-inventory.md`, **the complete list is 13**, and the largest one is named nowhere in any artifact.

The current vocabulary is `data-prop`, `data-prop-attr`, `data-bind`, `data-bind-attr`, `data-empty`, `data-repeat`, `data-repeat-limit`, `data-partial`.

| # | Missing construct | Categories affected | New? |
|---|---|---|---|
| 1 | **Repeat over a content-prop array** — `items[]`, `logos[]`, `steps[]`, `images[]`, `team[]`, `values[]`, `socials[]`. `data-repeat` names a *Ghost* source and emits `{{#foreach}}`; a content array is user data baked at compile as N static blocks. | A5, A8, A9, A10, A11, A12, A13, A14, A15, A16, A22 — **11 categories, ~166 designs** | **NEW — the biggest gap in the library** |
| 2 | **`{{#get}}` with filter / limit / order** — the whole FR-H2 Data group (Source, Count, Order), plus A7's mandatory `filter="visibility:public"` | A7, A15, A17–A22, A27 — 9 categories | **NEW** |
| 3 | **Two-armed conditional (`{{else}}`)** — `data-empty` emits a one-armed `{{#if}}` | A1 member swap, A22 signed-in swap, A19 #11 fallback, A27 "fallback to latest", A23 zero-state | **NEW** |
| 4 | **Member-state conditional, four closed values** — Everyone / Logged out / Free / Paid | A2, A6, A22, A26, A30 (13), A32 (12) | **NEW** |
| 5 | Positional helpers — `@first`, `@last`, `@index`, `@number`, `@even`/`@odd` | A17 #3/#4/#8/#17/#18, A18 #6, A13, A19 #6 | Round 1 |
| 6 | Pagination — `{{pagination}}`, `{{#if pagination.next}}`, `{{page_url}}` | A34 (10) | Round 1 |
| 7 | Nested repeats | A17/A18 tag chips, A20 #3/#14, A21 #5, A9 #6 | Round 1 — **and F5 adds the ordering constraint** |
| 8 | **Group-by / change detection** — sticky month/year headers, alphabetical grouping | A18 #7, A20 #12, A21 #15 | **NEW** |
| 9 | **Bare-helper binding (a helper with no bound path)** — `{{content}}`, `{{comments}}`, `{{total_members}}`, `{{navigation}}`, `{{statusCode}}`, `{{content_api_key}}` | A25, A28, A7 #12, A23, A31 | **NEW** |
| 10 | **Compile-target-conditional wrapper** — `{{#if @page.show_title_and_feature_image}}` around title + feature image on `page.hbs` **only**, not emitted on `post.hbs`. Same design, different markup per target. | A24 — normative for all 16 | **NEW** |
| 11 | **Mixed literal + bound attribute value** — `data-portal="signup/{tier}"` | A22, A30, A32 | **NEW** |
| 12 | **Bound value into an inline custom property** — A20's tag-accent tint needs `style="--tag-accent: {{accent_color}}"`, which **AD-3 forbids outright** ("no inline styles") | A20 | **NEW — an AD-3 collision** |
| 13 | **Text-node interpolation mixing static and bound text** — `data-bind` replaces the whole `textContent` | A10 #7, A20 #14 | **NEW** |

**This gates E4, and item 1 alone is a third of the library.** It should be settled as an authoring-vocabulary decision before E4 opens, not discovered per category in E9–E11.

---

## Pass 4 — pre-mortem

*Eighteen months out, all 49 decisions implemented as written, and the four Round 2 refuted implemented in their original form because nobody re-ran them.*

**What failed, in the order it would be noticed:**

1. **Nothing, for eleven months.** The library ships, themes deploy, gscan is green. The escaping bug (F1) needs a user to type a backslash before a brace — rare, and it looks like a content bug, not a compiler bug, so the first three reports are closed as "user typo".
2. **Month 12: a Windows user pastes a file path into a headline** and the site's own title appears in the middle of it. By then 484 designs and ~40,000 user text props have been through the same serializer. The fix is one function; the audit of what already shipped is not.
3. **The library-update path is where it spreads.** FR-J14 moves the library monthly, and every update recompiles. A user whose headline was fine last month becomes broken this month because the escaping ran again on the same doc.
4. **Month 14: October 30 already passed.** Supabase's enforced grant cutover (2026-10-30) hits every project. R2-1 was implemented, so this is survived — the calendar item that was *not* on anyone's list is **storage-api's grant migration** (F3), which re-grants `all` on every storage upgrade and silently re-opens the TRUNCATE hole after E1 revoked it.
5. **Month 16: the compile function starts timing out** — not from the split AD-11 declined, but because AD-11's real headroom was 64× not 140×, and nobody re-measured after the library grew past 70 sections per theme.

**The three weightings R3 named, answered:**

| Weighting | What Round 3 found |
|---|---|
| **A decision correct when taken, with a clock on it** | Round 2 found two (Supabase's October cutover, Ghost's bundled gscan). Round 3 adds a third: **storage-api's `grant all` migration re-runs on every Supabase storage upgrade** (F3). It is not a date, it is a vendor's release cadence — which is worse, because there is nothing to put in a calendar. |
| **A fix applied in one place, not propagated to siblings** | Now **five** occurrences. AD-5 was applied to the spine and the PRD and **not** to the spike, its tests, its README, or `verify-mechanical-theme-and-math.md` (F1). R2-7's shape rule fixed the user half and left the author half — and the author half turns out to be unsatisfiable (F12). |
| **An unverified claim propagating from inside something that looks like evidence** | Third occurrence, and the most convincing yet: a **runnable** spike that prints `16 checks passed` while implementing a refuted rule, cited by both prior rounds as proof of health (F1). |

**The red-team conclusion.** The single highest-leverage change is not any one AD. It is that **an artifact which executes is currently trusted more than one that is read, and Round 3 found the executable artifact was the wrong one.** A passing test suite that asserts the wrong thing outranks, in practice, a correction sitting in a normative document two directories away. The countermeasure is mechanical: when a decision refutes a claim, the same commit must touch **every** artifact that carries it, including code and tests — which is what "cite or execute" does not currently say.

---

## What survived — and a great deal did

- **AD-5's numeric-entity mechanism works end-to-end on a real theme.** Five hostile strings including `C:\{{@site.title}}` across 70 sections: zero live evaluations, zero parse failures, and the browser decodes every one back to the exact characters. The *decision* is right; only its propagation failed.
- **AD-11's decision holds.** The split still does not trigger, at 64× and 4.2× rather than 140× and 7×.
- **AD-14 determinism holds across four environments** — two libc implementations, two Node majors, two filesystems, two CPU allocations — byte-identical over 197 files. Round 2 showed only LANG/TZ on one.
- **AD-32's "no bucket is public" holds by default on real Supabase**, and needs no new policy. The most expensive refutation in VERIFY-29's consequence column did not happen.
- **AD-34's two-checker gate reproduces on a real fixture**, 0/0 on both majors, and its leak assertions caught every one of the three defects in F5 — which is precisely what R2-6 widened them to do.
- **AD-17, AD-18, AD-19's theme-identity rule, AD-27, AD-31, AD-35** were attacked and did not move.
- **DOMPurify removes 14 of 16 SVG payloads on defaults alone** — the finding is about configuration and placement, not about the library.
- Everything in R3 Part 2.3 that I re-touched still holds.

---

# Section 2 — For the owner, in plain language

Fifteen findings. Four need a decision now; the rest are recommendations you can approve as a batch.

---

## 1. The test that was proving us right was testing the wrong thing ⭐ most important

**Plain version.** Last round we found that our way of "defusing" special characters a user types didn't work, and we fixed the design documents. But the little working program we keep as proof — the one that prints "16 checks passed" and that both previous rounds pointed at to say "see, it works" — was never updated. It still uses the broken method. And its test only checks the one case the broken method happens to get right.

So: if a user types a Windows file path like `C:\` and then something in curly brackets, their headline comes out showing **your site's name** instead of what they typed. In one case the theme won't even build.

Think of it as a fire alarm that was tested by pressing the test button — which is wired to the speaker, not to the smoke sensor.

**Options:**
1. **Fix the program, its test and its README, and add a correction note to the one research file that recommends a third broken method. (RECOMMENDED)** — Half a day. It also puts a real test in place that would have caught this.
2. Delete the spike entirely, since the real compiler will replace it — but then we lose the only runnable proof of the whole approach, and the research file stays wrong.
3. Leave it and rely on the design documents being right — not recommended: the next person to open that folder will copy the broken function, because it is the only working code in the repository.

---

## 2. Two previous decisions disagree with each other, and I am not going to pick ⚠️ needs your ruling

**Plain version.** In Round 1 you approved: "replace the deploy lock with a lease record" (a row in a table saying who is currently deploying). It was never built. In Round 2, the report listed the *existing* lock as something that "survived attack — this is the right choice."

Both are approved. They say opposite things. The stress-test rules say I must stop and hand this to you rather than choose.

For context: this is the mechanism that stops two of your projects deploying to the same Ghost site at the same instant. Either approach works; they fail differently.

**Options:**
1. **Keep the existing lock (what's written in the architecture today) and strike Round 1 decision 12 from the record. (RECOMMENDED)** — It is simpler, it is already written down, and Round 2 examined it deliberately and approved it. Round 1's three objections are real but small at your scale.
2. Build the lease record and strike Round 2's note — more code, more robust if you ever have many concurrent deploys.
3. Defer to whoever builds E7, with both notes left in place — not recommended: that is exactly how this became a contradiction.

---

## 3. A rule we wrote can never pass ⚠️

**Plain version.** We wrote a build check that says "the finished theme must contain zero triple-curly-brackets." Every Ghost theme is *required* to contain exactly one — it is the piece that says "put the page contents here." Ghost's own two themes both use it.

So the check fails on every single build. Whoever hits it first will just delete it — and the real problem it was guarding against goes unguarded.

**Options:**
1. **Change the rule to "exactly one, in the layout file, and none anywhere else." (RECOMMENDED)** — One sentence. Keeps the protection.
2. Delete the check — loses a guard against a specific bug that breaks a whole theme.

---

## 4. Uploaded SVG images can skip the safety check ⚠️

**Plain version.** SVG image files can contain code. We correctly said "clean them with DOMPurify." But the cleaning happens **in the browser**, and the browser is also allowed to upload directly to storage. Anyone technical can simply not run the cleaner.

For your own images that only hurts the person who did it. The one that matters is **suggestion board images** — those get approved and shown to everybody.

I also tested the cleaner against 16 known attacks. On its default settings it removes 14. The two that get through are not the dangerous kind, but nobody has ever written down which settings to use, and the settings are the whole point.

**Options:**
1. **Clean on the server as well, and write down the exact settings. (RECOMMENDED)** — Do the server-side clean only for the suggestion board (small, and it is the cross-user path); write the settings down for both.
2. Clean everything on the server — safest, but adds cost on every image upload, which is the exact thing the architecture avoided on purpose.
3. Don't allow SVG uploads at all — simplest and completely safe, but rules out logos, which are usually SVG.

---

## 5. The compile budget: good news with a smaller margin

**Plain version.** The measurement behind "we don't need to split the compile job in two" was taken on a toy example that was never saved. I built the realistic one and saved it this time.

The real answer: a full compile takes about **4 seconds and uses 486 MB**. Our limits are 300 seconds and 2 GB. So we have about 64× the time and 4× the memory we need. The earlier figures said 140× and 7× — they were too optimistic, but **the conclusion doesn't change: no split needed.**

**No decision needed** — it is recorded, and the fixture is now checked in so this can be re-measured whenever the library grows.

---

## 6. The section vocabulary is missing 13 things, not 8

**Plain version.** Sections are written as plain HTML with little labels on them that say "put the post title here", "repeat this for each post". Two rounds ago we noticed the label vocabulary was missing some things. I have now walked all 484 designs and listed everything it cannot express — **13 gaps**.

The big one nobody had spotted: **there is no way to repeat something over a list the user typed themselves.** Every "features list", "testimonials", "FAQ", "team", "gallery" and "logo wall" needs it — that is **11 of your 34 categories, about 166 designs**, a third of the library.

**Options:**
1. **Settle all 13 as one authoring-vocabulary decision before the section-library work starts. (RECOMMENDED)** — It is one design session. Discovering these one at a time across the category epics means re-authoring designs already built.
2. Handle the big one now and the other 12 as they come up — cheaper this month, more expensive by month four.

---

## 7. Storage buckets: the scary one didn't happen

**Plain version.** The open question was whether someone could flip your "private" storage to "public" and expose every customer's original theme backup. **They cannot** — I tested it against a real Supabase setup. That risk is closed.

But I found something adjacent: Supabase's own setup grants users a command called TRUNCATE ("empty this table completely"), and that command is the one thing our security rules don't cover. It isn't reachable from a browser today, so it's not an emergency — but Supabase re-applies that grant every time they upgrade storage, so it needs to be a standing check rather than a one-time fix.

**Options:**
1. **Add the one-line revoke plus a permanent test that fails if it ever comes back. (RECOMMENDED)** — Two lines total.
2. Do nothing, since it isn't reachable — not recommended, because "not reachable" depends on a setting nobody is currently watching.

---

## 8. Four smaller items — approve as a batch

| | Plain version | Recommended |
|---|---|---|
| **Past-due customers are undefined** | Your pricing table has two columns, Free and Pro. The system has three states — the third is "Pro but the payment failed, in the 7-day grace period." Nothing says what those customers can do. | **Add a third column to the pricing table.** It is the exact confusion we built the single entitlement resolver to prevent. |
| **Two approved decisions were never applied** | Round 1's decisions 21 and 24 were approved and never made it into the documents. | **Apply both**, or formally drop them so a fourth round doesn't re-find them. |
| **Dark-mode controls: one of the three ways doesn't work** | We said there are exactly three things that can change between light and dark mode, each with one way of doing it. The second way can't actually work — an attribute in a finished page is fixed and can't have two values. | **Pick the mechanism now** (probably: this case resolves through the colour tokens like the first case does, and there is no second way). |
| **"We can always rebuild a deleted theme file"** | We justified not backing up compiled themes by saying we can rebuild them. We can't — rebuilding uses today's section library, and that changes monthly, so you'd get a *different* theme. | **Change the wording, and treat rollback history as genuinely not-regenerable.** |

---

## What is still not tested, after three rounds

Being straight with you about what nobody has checked:

- **The security headers in a real Next.js app** (deferred a third time — it needs an afternoon, not a decision).
- **Vercel's shared-instance behaviour** — needs a real Vercel account.
- **Determinism on a genuinely second machine** — I tested four environments, but all on this one computer.
- **The editor's lock protocol, Style Pack tokens, Variant Shuffle preservation, the accessibility matrix** — still only designed, never exercised.
