---
title: Inflozo Architecture Stress Test — Round 2 Decisions
type: decision record
status: all 16 decided as recommended, 2026-08-19
supersedes: nothing — extends STRESS-TEST-R2.md Part 3 (Round 1's 33 decisions)
evidence: every CONFIRMED item below was produced by execution; see the Round 2 report
---

# Round 2 — decisions taken

Round 2 ran **Pass 1 (execute) in full**. Passes 2, 3 and 4 were not run — see §Carry-forward.

Environment for every executed claim: real **Ghost 5.130.6** (bundling gscan 4.49.7) and **Ghost 6.58.0**
(bundling gscan 6.4.2) in Docker; **PostgreSQL 17**; node 22.23.2, jsdom 30.0.1, handlebars 4.7.9,
gscan 6.4.2 and 4.49.7; Ghost's own bundled `intl-messageformat` 5.4.3.

**16 findings were put to the owner with options. All 16 were decided as recommended.**
Two findings (17, 18) needed no decision — they are positive results and are recorded in §What held.

---

## Tier 1 — has an external deadline, or is actively lying to users

| # | Decision | Evidence |
|---|---|---|
| **R2-1** | **Add an explicit table-level `GRANT` for every table to `SCHEMA.sql`**, and make AD-26's per-migration checklist require one. The schema grants **in**, never relies on a platform default. | Supabase removes automatic `public`-table exposure: default for new projects **2026-05-30**, enforced on existing projects **2026-10-30**. Applied under the new default, `SCHEMA.sql` reports **0 errors** and leaves **29 of 30 tables unreachable**. `RLS-TEST.sql` aborts at its fixture block with **0 assertions run**. |
| **R2-2** | **Run the Ghost-5 half of the quality gate against the gscan version Ghost 5 actually bundles (4.49.7)**, pinned as an AD-23 fixture alongside 6.4.2. | Same theme, three verdicts: local gscan 6.4.2 `checkVersion:v5` → 0 errors; **real Ghost 5.130.6 → 1 ERROR**; 6.4.2 `v6` → 0 errors, matching real Ghost 6.58.0. Spec diff: `GS110-NO-MISSING-PAGE-BUILDER-USAGE` and `GS110-NO-UNKNOWN-PAGE-BUILDER-USAGE` are **error in 4.49.7, warning in 6.4.2**; `GS050-CSS-KGVIDTHUMB`, `-KGVIDTHUMBPL`, `-KGVIDTI` exist **only** in 4.49.7. Ghost 5 **activates despite the error** — so this is a false all-clear, not a deploy blocker. |
| **R2-3** | **Correct `PRELUDE.sql` to Supabase's documented grant set, cite the doc and its capture date beside it, and model the NEW (post-October) default** so the one file also proves R2-1. | `PRELUDE.sql` declares `grant all on tables to authenticated`; Supabase documents **SELECT, INSERT, UPDATE, DELETE** only. The over-grant hands `authenticated` TRUNCATE on all 31 relations, and **TRUNCATE is not subject to RLS** — executed as user A, it destroyed `site_credentials` and `billing_events` (both AD-7 server-only) and cascaded `projects` to 16 tables. **Not claimed live in production**; the finding is that normative test infrastructure states an uncited external fact, and states it wrong. |
| **R2-4** | **Take Round 1's open rider:** `alter default privileges in schema public revoke all on tables, sequences, functions from anon, authenticated`. **And extend AD-26's per-migration checklist from tables to views and functions.** | Every Round 2 database finding shares this root cause, as did Round 1's `suggestions_public` finding. R2-1 moves the platform in the same direction regardless. |

**R2-1, R2-3 and R2-4 are one edit to two files and should land together.**

---

## Tier 2 — before the compiler epic (E4 / E7)

| # | Decision | Evidence |
|---|---|---|
| **R2-5** | **Amend Round 1 decision 6:** the final user-text substitution runs over the emitted **file tree** — the template *and every emitted partial* — not over "the template". | Round 1 decisions **2 and 6 are jointly incoherent**. Decision 2 places the fill-in *before* repeat extraction; decision 6 places it *last*. Implemented as written, the partial ships a raw `{§01§}` marker and **the user's text is absent entirely**. This is a new leak of the class decision 2 was written to close. |
| **R2-6** | **Widen Round 1 decision 7's assertion:** it covers every emitted file including partials; it names the `{§N§}` marker shape explicitly; and it adds *"every emitted partial is referenced by at least one template."* | A theme carrying the leaked marker, the lost text, a literal `data-repeat="tags"` attribute **and** an orphan partial scored **0 errors / 0 warnings on both the v5 and v6 gscan specs**. AD-34's gate is the only thing that can catch any of it. |
| **R2-7** | **Give the compiler's own token a shape a section author's HTML comment cannot contain** — the same unforgeable-shape reasoning decision 6 applied to user text. | Decision 6 fixes the half where a *user* types `__HBS_0__` (now ships inert). The half where a *section author* writes `<!--__HBS_0__-->` is untouched: an entire `{{#foreach}}` block is **still emitted twice**. Fixed in one place, not propagated to its sibling. |
| **R2-8** | **State in AD-4 that the theme renderer never inserts marks markup into the DOM** — the marks output is spliced after serialization, not set as `innerHTML`. | Confirmed by execution: feeding the correctly-escaped fragment through `innerHTML` decodes it back to live `{{`, reproducing Round 1's finding 1 with marks present. AD-4's current wording ("both renderers call the single serializer") naturally reads as the broken form. **This sentence is what makes decision 1 work.** |
| **R2-9** | **Add `localeCompare`, `toLocaleUpperCase`, `Intl.*` and `new Date(x).toString()` to AD-1's banned list**, so the existing CI boundary check catches them. | Latent, not live — the current spike is byte-identical across four LANG/TZ combinations including `tr_TR` and `Pacific/Kiritimati`. But `localeCompare` under `sv` orders differently from `en`, and `toLocaleUpperCase('tr')` of `title` is `TİTLE`. These are the natural reach when sorting or formatting, and nothing stops them arriving. |
| **R2-10** | **Specify the layer-name slug function and its collision rule**, beside the existing §7.4 rule binding filename to layer name. | `Hero` and `HERO` slug to the same `hero` — three distinct names produced two slugs. The spike names partial files from layer names, so one section's partial overwrites another's. Compounds with R2-12. *(Suspected: the slug function Inflozo will use is not specified anywhere; a conventional one was tested.)* |

---

## Tier 3 — database and deploy safety

| # | Decision | Evidence |
|---|---|---|
| **R2-11** | **Apply Round 1 decisions 3 and 13–16 as one batch** before the next epic opens. | All re-executed as regressions and all still open: `suggestions_public` has no `security_invoker` and still carries INSERT/UPDATE/DELETE; `edit_locks` has **zero triggers** with all twelve columns client-writable; no trigger on `auth.users`; `deploys` has no settings-snapshot column; the custom-template name guard is INSERT-only. **Correction to Round 1:** `sync_vote_count` has a *null ACL* = EXECUTE to **PUBLIC**, not merely to `authenticated` — as do all guard functions and all of `pgcrypto`, which is installed into `public`. |
| **R2-12** | **Write down that the deploy zip filename IS the Ghost theme identity**, derive it from one frozen column, and never let it change for the life of a site binding. | Four byte-identical zips under four filenames produced **four separate themes**; `package.json.name` is ignored for identity. The filename is also the activate and delete key. AD-31 already mentions freezing `projects.slug` "after a theme name is frozen" — this is the mechanism that makes that freeze load-bearing, and no AD states it. |
| **R2-13** | **Extend AD-32 to name `storage.buckets` explicitly** and add it to the verification list. | AD-32 opens with "no bucket is public" and then governs only `storage.objects`. The `public` flag lives in `buckets`, which the rule never mentions. *(Suspected: real Supabase's `buckets` RLS state was not verified.)* |

---

## Tier 4 — verify or write down

| # | Decision | Evidence |
|---|---|---|
| **R2-14** | **Give FR-Q8's validator decision 1's mechanic:** transform user braces to `&#123;` / `&#125;` rather than refusing them. One escaping rule covers both the compiler and the translation path. | Against Ghost 6.58.0's bundled `intl-messageformat` 5.4.3: unbalanced braces throw (FR-Q8's premise confirmed), **and the standard ICU literal-brace escape `'{'` also throws**, as does `'{'name'}'`. There is no valid input a user can type for a literal brace. The numeric-entity form **parses cleanly**. |
| **R2-15** | **Record both tiers transcripts as AD-23 fixtures, correct each research companion for the half it got wrong, and add a library rule: emptiness is tested on a filtered `{{#get}}`, never on `tiers.length`.** | **VERIFY 14b resolved by execution, identically on 5.130.6 and 6.58.0.** Unfiltered `{{#get "tiers"}}`: `tiers.length` = **2** (includes the hidden tier) while `{{#foreach}}` yields **1** row. `filter="visibility:none"` and `filter="type:paid"` both give length 1 and **zero** rows. The visibility filter applies to the serialized rows, after the count. **Both companions were half right.** FR-H6's explicit `visibility:public` filter is safe — count and rows agree. The hazard is a design using `{{#if tiers.length}}` on an unfiltered get: a pricing section with a heading and no cards. |

---

## Tier 5 — reasoned, decided now to stop it being quoted as settled

| # | Decision | Evidence |
|---|---|---|
| **R2-16** | **Drop Round 1 decision 25 (splitting `project_treatments`).** Keep the one table. Round 1 decision 26's "nothing to build" then stays true. | Decision 26 names `project_treatments.pagination_design_id` as "already in the schema — nothing to build"; decision 25 splits that table. Whichever lands second falsifies the other's cost. The split turns one table with one RLS policy into three, each needing its own policy, its own `rls.sql` row (AD-26) and its own denormalized `user_id` (AD-6) — permanently — to separate three nullable text columns. *(Suspected: no concrete driver for the split was found in the tree.)* |

---

## What held — do not re-attack in Round 3

- **Round 1 decision 1 (escape after serialization) survives marks.** This was Round 1's own largest open hole.
  AD-4's `{text, marks[]}` serializer was built and given eight compositions: a bold boundary inside a brace run,
  a boundary between the two `{` of `{{`, an `href` containing braces, nested marks over `{{#if x}}BOOM{{/if}}`,
  FR-Q3's plain-text lock, paste normalization of HTML carrying both, a user URL with braces **and** a quote, and
  a user typing the marker shape itself. **All eight shipped inert, all eight compiled, none produced live
  Handlebars.** No ordering was found in which a user string becomes live.
- **AD-9 / Round 1 decision 18 proven necessary, on BOTH Ghost versions.** With a value stored, changing a
  setting's `type` (`select`→`text`) **destroyed** it; removing a value from `options` **reset** it to default.
  Untouched settings kept their values, so the destruction is specific, not a blanket reset.
- **VERIFY 14a is safe.** Retitling a page with a custom template selected changes neither the slug nor
  `custom_template`. FR-I1 / FR-D6 / A30 unblocked.
- **AD-30 cannot be collided through `body_class`.** A post tagged `scheme-dark` and `d-a9-11` rendered
  `post-template tag-scheme-dark tag-d-a9-11` — Ghost namespaces tag, page and author classes.
- **`{{body_class}}` enumerated** (identical on both versions): home `home-template`; post
  `post-template tag-{slug}`; page `page-template page-{slug}`; tag `tag-template tag-{slug}`; author
  `author-template author-{slug}`. It contains **nothing** from `@custom`, so AD-17's scheme class must be
  emitted *beside* it.
- **AD-14 holds for the spike as written** — byte-identical across four LANG/TZ combinations, and across
  `jsonb` vs JS key order (the renderer indexes by path rather than iterating).
- **The spike reproduces and gscan has now actually been run:** 16/16 checks, `build.js` **0 errors / 0 warnings
  on both specs**. Round 1 never executed this.
- **All 23 RLS assertions still pass**, and AD-7's server-only tables correctly deny SELECT/INSERT/UPDATE/DELETE
  cross-tenant. **No sequences and no relation that is neither table nor view** is reachable by `authenticated` —
  that surface is clean.
- **MEASUREMENTS drift reproduces:** the shipped proof prints **37 policies / 28 tables** against §8's stated
  34 / 26 (Round 1 decision 24 still applies).
- **gscan 4.49.7 vs 6.4.2 — the claims that survived the version split:** `GS100` and `GS051-CUSTOM-FONTS` exist
  in both with identical regexes; the 20-key `config.custom` cap and the five allowed types are unchanged.
  **AD-17 and AD-18 survive.** Only the GS110 pair and the three GS050 Koenig rules moved.

---

## Carry-forward to Round 3

**Passes 2, 3 and 4 were not run.** `/bmad-review`, `/bmad-party-mode --party ghost-build-room` and
`/bmad-advanced-elicitation` were not invoked. Pass 1 produced more executed material than expected and was
finished and reported rather than starting three passes that could not complete in the same session.

**Two Pass 1 items also remain untouched:** the DOMPurify SVG upload path (FR-K2), and the CSP in a scaffolded
Next 16 app (Round 1 decision 5).

**What Round 3 must carry in:**

1. **R2-2 changes what every remaining pass would conclude.** Every gscan-derived claim in the spine now has a
   Ghost-5 half that is unproven against gscan 4.49.7.
2. **Pass 3's A33 Koenig question is directly affected.** The three `GS050-CSS-KGVID*` rules that exist *only*
   in 4.49.7 are Koenig card rules, and they sit exactly where MEASUREMENTS §7 found the ten-warning multiplier.
   Six designs times that multiplier, on a rule set the gate cannot currently see.
3. **The Round 1 failure-mode variant recurred and should stay on the watchlist.** R2-2 is a verified fact
   carried one step too far ("gscan 6.4.2 has a v5 spec" → "therefore `checkVersion:v5` tells us what Ghost 5
   does"). R2-3 is an *uncited* external fact inside the harness meant to catch uncited external facts.
4. **No new live contradiction was found.** The one flagged in STRESS-TEST-R2.md is now closed by execution
   (R2-15).
