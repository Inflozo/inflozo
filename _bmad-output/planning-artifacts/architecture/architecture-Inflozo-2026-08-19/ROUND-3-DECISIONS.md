---
title: Inflozo Architecture Stress Test — Round 3 Decisions
type: decision record
status: all 13 decided, 2026-08-20 — 12 as recommended, D1 by owner ruling
supersedes: nothing — extends STRESS-TEST-R2.md Part 3 (Round 1's 33) and ROUND-2-DECISIONS.md (Round 2's 16)
evidence: ROUND-3-REPORT.md · MEASUREMENTS.md §14 · VERIFY-AT-BUILD.md item 29
---

# Round 3 — decisions taken

Round 3 ran **all four passes**. 13 findings were put to the owner with options; **12 were decided
as recommended and one (D1) was a ruling only the owner could make.** All 13 are applied.

Environment for every executed claim: Ghost 5.130.6 and 6.58.0 images · gscan 4.49.7 and 6.4.2 ·
`storage-api` v1.61.7 over `supabase/postgres` 17.6.1.140 · node 22.23.2 and 24.19.0, glibc and musl
· `dompurify` 3.4.14 · `jsdom` 30.0.1 · `handlebars` 4.7.9.

---

## The ruling

| # | Decision | Why it needed the owner |
|---|---|---|
| **D1** | **Keep AD-19's `pg_advisory_xact_lock`. Round 1 decision 12 (the lease record) is STRUCK.** | Two approved rounds asserted opposite things about the same AD: R1 d12 said replace the lock with a lease, and Round 2's survivals list said the transaction-scoped lock is the right choice. R1 d12 was never applied. Round 3 flagged it and declined to pick. **Reasons of record:** the lock is one line, needs no table, policy, denormalized `user_id`, expiry or stuck-lease cleanup, and it releases itself when the transaction ends — including when the server dies mid-deploy, which is exactly what a lease must handle by hand. Round 1's three objections are real and judged not to bind at v1 scale. Annotated in place in `STRESS-TEST-R2.md`; **AD-19 is unchanged.** |

---

## Tier 1 — the evidence was wrong

| # | Decision | Evidence |
|---|---|---|
| **D2** | **Correct `spike-compiler/` to AD-5's numeric entities, replace its escaping test with the full ladder, and correct both documents that carry the refuted remedy.** | `compile.js:41` still shipped `replace(/\{\{/g, '\\{{')` — refuted by `MEASUREMENTS.md` §3 and replaced by AD-5. Executed: `C:\{{@site.title}}` rendered **`C:\MY GHOST SITE`** (live evaluation of the site's own title inside a user headline) and `C:\{{#if x}}y{{/if}}` produced a theme that **would not compile**. `test.js:65` asserted only the one shape the broken rule handles, so the suite printed **16/16** through two rounds and both cited it as evidence of health. Now 21/21 over seven shapes, including the marker shape itself; `build.js` still scores gscan 0/0. `README.md` item 6 and `verify-mechanical-theme-and-math.md` Claim 9 both carried it — and Claim 9's *alternative* fix ("double any run of backslashes") was executed and is **also** false: it renders `C:\\LIVE-VALUE`. Both now carry correction blocks. |
| **D3** | **AD-5 rule 2 and §7.3 mechanic 3: assert exactly one permitted `{{{body}}}` in `default.hbs`, zero `{{{` or `}}}` elsewhere.** | Both said "zero `{{{` and zero `}}}`" and called the assertion exact, on the premise that "Inflozo emits no triple-stash by design". It emits one, unavoidably. Read from the shipped Ghost 5.130.6 image: `casper/default.hbs:77` and `source/default.hbs:56` both use `{{{body}}}`, and `express-hbs/lib/hbs.js:527` assigns `locals.body` as a plain string, so `{{body}}` would HTML-escape the whole page. `spike-compiler/build.js` has emitted it since the spike was written. As stated the assertion fails on every build, so it gets deleted — taking the guard against `:root{--a:{{@custom.x}}}` with it. |

---

## Tier 2 — before the compiler and library epics

| # | Decision | Evidence |
|---|---|---|
| **D5** | **Settle all 13 missing directive constructs as one authoring-vocabulary decision, normative in §7.3 and gating E4.** *(Closes R1 decision 8, deferred through two rounds.)* | The full 484 walk. §7.3's list was "five", Round 1 raised it to "at least eight", the answer is **13** — ten of them new. **Item 1, repeat over a user-typed content array, is the largest single gap in the library and was named nowhere:** 11 categories, ~166 designs, roughly a third of the inventory. Also new: `{{#get}}` with filter/limit/order, the `{{else}}` arm, the four-valued member conditional, group-by, bare-helper binding, the `page.hbs`-only guard wrapper, mixed literal-and-bound attributes, a bound value into an inline custom property (**which collides with AD-3 and needs a ruling**), and mixed text interpolation. |
| **D11** | **New AD-5b: three ordering rules the pipeline needs.** | All three are properties of the decided design, not of any implementation, and none is visible on a two-section fixture — which is why two rounds missed them and all three surfaced within an hour of building `tools/stress/`. (a) Expression tokens resolve in **reverse insertion order**, or nested repeats ship raw tokens — ten partials did, at gscan 0/0. (b) User-text substitution is **one regex pass**, never a loop of replaces, which re-scans its own output and is 36× slower. (c) The **escaper strips the marker delimiters**, because R1 d6's "shape escaped text can never contain" is a property of the escaper, not the shape. |
| **D12** | **AD-18 gains the Koenig width classes: `cards.css` declares `.kg-width-wide` and `.kg-width-full` on every theme.** | `GS050-CSS-KGWF` is an **error** on **both** gscan majors and fires with **no card exclusion at all**, so it sits outside `MEASUREMENTS.md` §13d's exclusion arithmetic entirely. Executed: the stress theme scored 1 error on 4.49.7 *and* 6.4.2 until both selectors existed. |
| **D13** | **Replace R2-7's shape rule with a CI lint over the 484 design sources.** | R2-7's requirement is **self-cancelling**: the compiler carries its own tokens *inside* HTML comments, so the shapes an author's comment cannot contain (anything holding `--`) are exactly the shapes the compiler cannot use. No shape satisfies both halves. Hit empirically in Pass 1 — the only remaining option was C0 control characters, which are unforgeable in practice but not by the format. The library is Inflozo's own data (AD-2), so a lint is total and cannot be forgotten the way a convention can. |

---

## Tier 3 — data, durability and gating

| # | Decision | Evidence |
|---|---|---|
| **D4** | **Give DOMPurify a placement and a configuration: server-side re-sanitize for `suggestion-images`, and a named config for both paths.** | The conventions row said only "an uploaded SVG is sanitized with DOMPurify". AD-12 puts that pass **in the browser**; AD-32 lets the client write `assets/` and `suggestion-images/` **directly**. A client that skips the sanitizer uploads the raw file. For `assets/` the blast radius is the uploader; **`suggestion-images/` is approved onto a public board (FR-M3)**, so one user's file reaches every visitor. Measured over a 16-payload corpus on `dompurify@3.4.14`: defaults leave **2** standing (`<style>` with `@import`), the named config leaves **1** (an inert DTD prologue). |
| **D6** | **Close the storage TRUNCATE grant — and record that the obvious form is a no-op.** | **VERIFY-29's headline risk is refuted:** `storage.buckets` ships RLS-on with **zero policies**, so `authenticated` sees 0 rows and cannot flip `public`. AD-32 holds by default. **What replaces it:** storage-api migration `0046-buckets-objects-grants.sql` does `grant all` (hence TRUNCATE) to `anon` and `authenticated`, and TRUNCATE bypasses RLS — executed, `truncate storage.objects cascade` **succeeded**. **And the fix does not work as recommended**, which is the third no-op-revoke shape this project has hit: run as `postgres` the revoke reports success and changes nothing, because Postgres only lets a role revoke grants it made and the grantor is `supabase_storage_admin`; `postgres` is not a superuser in the image, is not a member of that role, and `GRANTED BY` fails with "grantor must be current user". TRUNCATE still succeeded afterwards. `SCHEMA.sql` §12 therefore **attempts and reports** rather than assuming, and `RLS-TEST.sql` asserts the outcome plus the control that actually holds today — `storage` is not a PostgREST-exposed schema. **Open probe item:** whether hosted Supabase grants `postgres` the membership that makes the revoke work. |
| **D7** | **Add a third column to Appendix F.1 for `pro_past_due`. Internal only; during grace every Pro capability is retained.** | `entitlements.state` has three values and F.1 — which AD-28 names as the resolver's **sole** data source — defined caps for two, leaving the 7-day grace undefined. That is verbatim the divergence AD-28 exists to prevent ("they will disagree … on `pro_past_due`"). It is **not** a plan and never appears as one: FR-N1's Pricing page lists Free and Pro, the only two anyone can buy. The generous reading follows FR-L2's own transitions — the banner is the consequence, the downgrade happens only at grace expiry — and the strict reading would strand a paying customer mid-deploy over a bank decline, which F.2 forbids. |
| **D9** | **AD-30: fold the mode-specific toggle into the token block. There is no second mechanism.** | As written it "emits a single `data-{control}` attribute whose *value* is token-resolved" — which cannot work, because an attribute in an emitted template is **static** and cannot hold two values. If the difference lives in the token, the token is the mode-scoped thing and the control is not, which is case one. A control whose *named value* differs per mode would need a second attribute or a mode-selecting rule in a design stylesheet, and AD-30 forbids both. Distinct from Round 1 finding 10, which grows the enumeration; this says the second member of it has no working expression. |
| **D10** | **AD-29: `deploy-artifacts` is NOT regenerable. Rewrite the durability tier and say so in the UI.** | AD-29 used "regenerable by recompiling" to justify giving that bucket no protection. AD-14 makes compile a pure function of **what it was handed**, and the library is an input that FR-J14 moves monthly — so recompiling an old doc produces a *different* theme. FR-J9's rollback redeploys a **stored artifact** for exactly that reason. An artifact pruned by FR-J7 is gone, so the retention window is the real bound on rollback depth. |
| **D8** | **Apply both unapplied Round 1 decisions: 21 and 24.** | Both approved in Round 1, neither written down, both found still open in Round 3. **d21** — AD-33 now carries the fidelity-rotation carve-out (container schedule, not Vercel Cron, because it drives Playwright from the pinned NFR-6(a) image). **d24** — AD-11 no longer restates seven figures and cites `MEASUREMENTS.md` §14 instead; §8's "34 policies / 26 tables" is recorded as needing re-derivation from the proof, which prints 37 / 28. |

---

## What Round 3 changed about how the project works

The pre-mortem's conclusion, kept because it outlives these 13 decisions:

**An artifact that executes was being trusted more than one that is read, and the executable artifact
was the wrong one.** A passing test suite that asserts the wrong thing outranked, in practice, a
correction sitting in a normative document two directories away. Three occurrences now — `PRELUDE.sql`,
`checkVersion: 'v5'`, and the spike.

**The rule this adds to "cite or execute":** when a decision refutes a claim, the same change must
touch **every** artifact carrying it — including code, tests and READMEs, not only the normative
prose. D2 is the instance; the discipline is the point.

---

## Carry-forward to Round 4

1. **Real infrastructure is being provisioned** — Vercel Pro, hosted Supabase, real Ghost on
   DigitalOcean. `tools/probe/.env.example` names what each block unlocks.
2. **Still never executed, now for a third round:** the Next 16 CSP (R1 decision 5) and Vercel Fluid
   concurrency (R1 decision 11).
3. **D6 leaves one open probe:** whether hosted Supabase's `postgres` can perform the revoke.
4. **D5 leaves one open ruling:** construct 12 puts a bound value into an inline custom property,
   which AD-3 forbids outright. That collision needs a decision before A20 is authored.
5. **Untested surfaces, unchanged since Round 2:** the edit-lock protocol, Style Pack token
   resolution, Variant Shuffle / Site Remix preservation, the entitlement state machine, the render
   matrix, and determinism on a second physical machine.
