---
title: 'Inflozo — executed measurements and findings'
type: architecture-companion
status: final
created: '2026-08-19'
---

# Executed measurements

Everything here was run, not read. Reproduction commands are given because AD-23 requires a
recording rather than a paraphrase, and because three of these findings contradict text that
currently reads as normative.

Reference machine: Linux, 4 cores, 32 GB, Node v22.23.2, `jsdom` 30.0.1, `handlebars` 4.7.9,
`gscan` 6.4.2, PostgreSQL 17.11 (Docker `postgres:17-alpine`).

---

## 1. The spike reproduces

    cd spike-compiler && npm install jsdom handlebars gscan && node test.js

**16/16 renderer assertions pass** on this machine, unchanged. The spike is reproducible, not
merely reported.

---

## 2. Compile sizing — the 40-section stress fixture · behind AD-11

§7.1 requires duration and memory to come from a measurement against the 40-section stress
fixture, not from a platform default. This is that measurement.

**Fixture.** The stress template carries 40 sections; the other six synthesizable templates
carry their Synthesis Default stacks, modelled at five each — **70 section renders across 7
templates**, assembled into a complete theme: 173 files, `screen.css` with one flat stylesheet
per placed design, `cards.css`, `main.js`, 8 woff2 subsets, 80 hashed image renditions
(incompressible random bytes, so the zip figure is honest), `locales/en.json`, a full
`package.json` carrying `image_sizes` and the three FR-Q5 built-ins.

| Stage | Wall time |
| --- | --- |
| render + serialize (70 sections) | **770 ms** (11.0 ms/section) |
| assemble the rest of the tree | 14 ms |
| gscan 6.4.2 — **both specs** (v5 217 ms + v6 88 ms) | **305 ms** |
| FR-J17 quality gate (§11) | **700 ms** |
| zip | 222 ms |
| **total** | **~2.0 s** |

**Corrected at the reviewer gate.** The first version of this table timed **one** gscan spec while the
pipeline commits to two, and omitted the FR-J17 gate entirely — a stage the PRD makes mandatory on
every compile. Both are measured above and folded into AD-11. Both specs score **0 errors, 0
warnings** on the stress fixture.

| | |
| --- | --- |
| Peak RSS | **289 MB** |
| Theme size | 9.75 MB uncompressed · 9.66 MB zipped |
| gscan | **0 errors, 0 warnings** |

**Sizing decided from it:** `maxDuration: 300` and `memory: 2048` — both the Vercel Pro
defaults, giving ~140× duration and ~7× memory headroom. The reference machine has 4 cores
against Vercel Fluid's 1 vCPU, and the real function additionally pays Storage reads and font
subsetting, which the fixture did not; a 10× shell factor still lands two orders of magnitude
inside the ceiling. **§7.1's gscan-boundary split therefore does not trigger and is not
built** (recorded as Deferred in the spine).

**Two things kept out of the function to make that true.** Image renditions are generated in
the browser at upload (AD-12) — a `sharp` dependency would have dominated both figures. And
the 9.66 MB zip never crosses a function boundary (AD-13), because Vercel caps request *and*
response bodies at 4.5 MB.

---

## 3. Handlebars escaping · behind AD-5 · **contradicts §7.3**

§7.3 identifies a real bug in the spike's escaping rule and then states a remedy: *"The
backslash is escaped too. The emitted form is `\{{`."* The bug is real. **The remedy was
executed and does not work.**

    node -e "H=require('handlebars');for(n=0;n<5;n++)console.log(n,JSON.stringify(H.compile('\\\\'.repeat(n)+'{{t}}')({t:'LIVE'})))"

| backslashes emitted before `{{t}}` | renders |
| --- | --- |
| 0 | `LIVE` |
| 1 | `{{t}}` — inert, **and the backslash is consumed** |
| 2 | `\LIVE` |
| 3 | `\\LIVE` |
| 4 | `\\\LIVE` |

Handlebars' escape is **not composable**. Exactly one backslash escapes a mustache and it
disappears; every count ≥ 2 evaluates. There is therefore **no** emission that renders a
literal `\` followed by a literal `{{` — so a user who types `C:\{{title}}` cannot be served
correctly by any backslash rule, and a block helper typed after a backslash produces a
template that will not compile on any count.

**HTML numeric entity encoding closes it completely.** Escape `&` first, then emit `&#123;`
for every `{` and `&#125;` for every `}` the user typed. Handlebars never sees a mustache;
the browser decodes the exact characters back. Every case round-trips — `{{title}}`,
`C:\{{title}}`, `{{{title}}}`, `{{#if x}}…{{/if}}`, `{{!-- c --}}` — with zero parse failures
and no interaction with Handlebars' escaping rules at all.

Under the preamble's precedence, this is a **fact about an external platform settled by
execution**, which outranks the PRD body. It does not change any product decision: FR-J1's
guarantee is unchanged and is now actually delivered. **It is in E0(a)'s scope** — the PRD
already puts "the escaping bug already found" there; what changes is that the fix it names is
not the fix that works.

---

## 4. A mustache may not abut a closing brace · behind AD-5

    node -e "require('handlebars').precompile(':root{--a:{{@custom.x}}}')"   # Parse error

Handlebars reads `}}}` as a triple-stash close. FR-Q5 mandates an inline token block in
`default.hbs` for promoted colours, and the natural emitted form is exactly this shape — so
the theme would fail to compile, and gscan reports it as *"Templates must contain valid
Handlebars"* rather than as anything that points at the cause.

`;}`, ` }` and a newline all parse. The emitter therefore terminates every declaration, and
compile CI asserts the emitted theme contains **zero `{{{` and zero `}}}`** sequences —
Inflozo emits no triple-stash by design (AD-4), so the assertion is exact and closes the whole
class rather than this one instance.

---

## 5. `GS100`'s exact trigger · closes §7.6 item 19 · behind AD-17

Five fixture themes, each differing only in how the three FR-Q5 `config.custom` keys are
referenced, checked against **both** the v5 and v6 specs.

| Fixture | v5 | v6 |
| --- | --- | --- |
| A — none referenced | GS100 **error** | GS100 **error** |
| B — all three referenced, FR-Q5's fallback-chain form | **0 errors, 0 warnings** | **0 errors, 0 warnings** |
| C — referenced only inside `{{#if}}` guards | clean | clean |
| D — referenced only inside a partial | clean | clean |
| E — two of the three referenced | GS100 **error** | GS100 **error** |

Four facts, all previously assumed:

1. `GS100` is an **error**, not a warning, on both specs — so it blocks a deploy outright.
2. It fires when **any** declared key is unreferenced. Partial reference is not partial credit.
3. A reference **inside a `{{#if}}` guard counts** — which is what makes FR-Q5's fallback
   chains a real reference rather than a token mention.
4. A reference **from a partial counts** — the reference need not live in `default.hbs`.

**FR-Q5's always-declare-always-reference design is confirmed sufficient**, and its stated
reason — that the conditional design would have put a gscan collision inside the one setting
a user is most likely to toggle — is exactly right.

---

## 6. `GS051-CUSTOM-FONTS` — a rule the PRD never names · behind AD-18

Every fixture above, including the clean ones, carried one standing warning on **both** specs.
Read from `gscan/lib/specs/v5.js:751` and `gscan/lib/checks/051-custom-fonts-css-properties.js`:

```js
'GS051-CUSTOM-FONTS': {
    level: 'warning',
    rule: 'Missing support for custom fonts',
    regex: /^(?=[\s\S]*--gh-font-heading)(?=[\s\S]*--gh-font-body)/
}
```

The check scans every `.css` and `.hbs` file and passes if **one file** contains **both**
strings. Nothing in the PRD mentions it, and without it every theme Inflozo ships carries a
standing warning — which makes G3's "warnings surfaced, always", FR-J6's 0/0 target and every
category gate's automated sheet unmeetable at once, on all 484 designs simultaneously.

Closed by AD-18. The 40-section fixture scores 0/0 with the two variables present, which is
the proof that the fix is sufficient at scale.

---

## 7. Excluding a Koenig card restores gscan's rules for it · confirms FR-Q7

Setting `card_assets: { exclude: ['callout'] }` produced **12 new warnings**, each demanding a
`.kg-callout-*` class the theme must now style. **[Corrected 2026-08-20: this section previously
said 10. Re-run under both checkers, the number is 12 on each — `GS050-CSS-KGCO`, `-KGCOE`,
`-KGCOT` and nine `-KGCOBG*` background variants. The count is quantified again per card in §13.]** FR-Q7 states this ("Excluding a card also
restores gscan's Koenig rules for it, so checking scales with what Inflozo actually wrote") —
confirmed, and now quantified. It is a build obligation on E7 and on E10's A33 category gate:
designing a card means styling **every** class gscan checks for it, or the 0/0 target breaks.

---

## 8. Schema and RLS · behind AD-6 through AD-9

    docker run -d --name pg -e POSTGRES_PASSWORD=x postgres:17-alpine
    psql -f PRELUDE.sql -f SCHEMA.sql -f RLS-TEST.sql

`SCHEMA.sql` applies clean to PostgreSQL 17.11 on the first run. The static sweep reports:

- **0** public tables with RLS disabled
- **policies across tables — re-derive from the proof, do not quote this line.** It read "34 policies across 26 tables"; the shipped `RLS-TEST.sql` prints **37 / 28**. The drift is Round 1 decision 24's whole point: a number restated by hand in a second place goes stale the first time the schema moves. *(Round 3, decision D8 — the count is now read from the proof's own output, and this line exists only to record why it is not a number.)*
- exactly **2** deliberate server-only tables (`site_credentials`, `billing_events`) — both
  RLS-enabled with zero policies, which is AD-7's deny mechanism
- **0** tables carrying `user_id` without a policy that scopes on it

The behavioural pass proves isolation rather than asserting it — every line reads PASS:
cross-tenant project insert blocked, cross-tenant site update invisible, `is_admin`
self-grant blocked by the freeze trigger, `deploys` row forge blocked, vote-as-another-user
blocked, unapproved suggestion image `NULL` through the public view, the 17-setting cap held,
the 6-digit-hex colour rule held, the `credit.*` namespace lock held.

**E1's exit criterion — "RLS verified on every table the schema story creates" — now has a
runnable artifact instead of a sentence.**

---

## 9. Versions, read rather than recalled

npm registry, 2026-08-19: `next` 16.3.1 · `@supabase/supabase-js` 2.112.3 · `gscan` 6.4.2 ·
`jsdom` 30.0.1 · `handlebars` 4.7.9 · `stylelint-plugin-use-baseline` 1.4.5 ·
`browserslist-config-baseline` 0.5.0 · `eslint-plugin-compat` 7.0.2 · `size-limit` 13.0.3 ·
`web-features` 3.35.0 · `resend` 6.20.0 · `dodopayments` 2.47.0 · `zod` 4.4.3.

`TryGhost/Ghost` `ghost/core/package.json` at `main` (6.58.1-rc.0) declares **`"gscan":
"6.4.2"`** — so FR-J6's pin at 6.4.2 satisfies "at or above the newest bundled by any
supported target" as a read fact rather than a hope.

Vercel Functions limits, `vercel.com/docs/functions/limitations` (page dated 2026-07-01): Pro
duration default 300 s, maximum 800 s GA, 1800 s in beta; memory default 2 GB / 1 vCPU,
maximum 4 GB / 2 vCPU; function bundle 250 MB uncompressed; **request and response body
capped at 4.5 MB**.

Supabase Vault: `pgsodium` is pending deprecation, but Vault's interface (`vault.secrets`,
`decrypted_secrets`) is explicitly unchanged and its internals migrate off `pgsodium`.
FR-C3's posture holds. Standing watch item, not a blocker.

---

## 10. A leak this review found in its own schema, and a Postgres trap

The first draft put FR-M3's unapproved-image gate in a view and left the base table readable.
Probed on PostgreSQL 17.11, `anon` read the unapproved `image_path` straight off
`public.suggestions`, going around the view entirely. A view is not an access control when the
table underneath it is still granted.

The intuitive fix is also wrong, and silently:

    revoke select (image_path) on public.suggestions from anon;   -- NO-OP

**A column-level `REVOKE` does nothing while a table-level `GRANT` stands.** The probe still
returned `img/secret.png`. The correct form revokes the table grant and grants the allowed
column list back:

    revoke select on public.suggestions from anon, authenticated;
    grant  select (id, user_id, category, title, body, status, vote_count,
                   created_at, image_approved) on public.suggestions to anon, authenticated;

After which `select image_path from public.suggestions` as `anon` raises
`ERROR: permission denied for table suggestions`, and the `SECURITY DEFINER`
`suggestions_public` view — the only path to the column — serves it gated.

Two consequences landed in the schema. The gate is now two mechanisms, not one. And FR-M4's
moderation stopped being an RLS policy: an admin policy would have had to re-open the very
column the gate closes, and status, merge, hide and image approval are all facts the server
asserts, which AD-8 already routes through a service-role server route.

`RLS-TEST.sql` now asserts the leak is closed. Every line reads PASS.

---

## 11. The FR-J17 quality gate, measured because AD-11 had omitted it

The reconciliation review pointed out that AD-11's headroom — the number that retires §7.1's compile
split — was computed without the one compile stage the PRD makes mandatory. Measured rather than
estimated, on the same stress-fixture theme:

| | |
| --- | --- |
| `.hbs` files parsed | 79 |
| elements walked | 569 |
| links / images / headings checked | 40 / 2 / 72 |
| CSS declarations parsed | 4,610 |
| **wall time** | **697 ms** |
| peak RSS | 265 MB (inside the render stage's own 289 MB) |

The proxy runs the gate's actual shape — parse every emitted `.hbs` with the Handlebars still in it,
walk it for inline handlers, link accessible names, `alt` presence and heading order, and parse
every declaration in `screen.css` and `cards.css`. It does not run axe-core or the contrast pass,
both of which are per-render rather than per-file and are already budgeted inside the NFR-6(a)
matrix. **AD-11's conclusion survives at ~140× headroom instead of ~250×**, which is the point of
measuring rather than asserting: the number moved and the decision did not.

---

## 12. Four version rows that were recalled, not read

The version-lens reviewer checked the Stack table's own claim — *"every version above was read from
the live npm registry or the vendor's docs"* — and found four rows where that was false. Re-checked
here directly against `registry.npmjs.org`:

| Row | Stated | Actual `latest` |
| --- | --- | --- |
| TypeScript | 5.x | **7.0.2** |
| pnpm | 10.x | **11.22.0** |
| Node.js | 22 LTS | **24.x** is Vercel's default and the active LTS |
| React | "19.x, bundled with Next 16" | **19.2.8**, and a **peerDependency**, not bundled |

All four are corrected in the Stack table, and the failure is recorded rather than quietly fixed.
This is the exact failure mode the project's standing rule names — a recalled fact stated with the
confidence of a read one — reproduced inside the document that restates the rule. It is worth more
as a recorded near-miss than as a silent edit.

Two platform facts were also wrong and are load-bearing, both confirmed here against the vendor:

1. **`middleware.ts` is deprecated in Next 16**, renamed to **`proxy.ts`**, which runs on the Node.js
   runtime; `middleware.ts` survives only for Edge use cases and will be removed
   (`nextjs.org/blog/next-16`). A session-aware CSP is a Node-runtime concern, so the spine had
   committed to both the deprecated file and the wrong runtime.
2. **A Vercel environment variable cannot be changed without a redeploy** — env-var changes apply
   only to new deployments. The spine had put the passkey feature flag behind an env var *for the
   express purpose of* disabling it without a redeploy (FR-A2). Flags are now rows in
   `feature_flags`, read server-side per request.

Verified and unchanged: every other Stack row matches npm `latest`; all of AD-11 and AD-13's Vercel
limits; `browserslist-config-baseline@0.5.0` at the `2026-08-18` pin resolving to exactly Chrome/Edge
121, Firefox 122, Safari/iOS 17.2; `GS100` at `error` level inherited from `v4.js` into v5 and v6;
`GS051-CUSTOM-FONTS` exactly as quoted; Ghost `main` declaring both `gscan 6.4.2` and
`handlebars 4.7.9`, so AD-5's execution basis is Ghost's real runtime.

One further correction: **`size-limit` has no engine of its own** and measures nothing without a
preset — `@size-limit/file` is required — and its default metric is **brotli**, which is what NFR-2's
40 KB budget therefore means. And the WebAuthn surface landed in `@supabase/auth-js` **2.75.0**, not
2.105.0, so the PRD's floor is a safe over-pin rather than a capability boundary.


---

## 13. Two gscan majors, not one gscan twice · behind AD-34 · **corrects §2 and §11**

`ghost:5-alpine` → Ghost **5.130.6**, bundling gscan **4.49.7**.
`ghost:6-alpine` → Ghost **6.58.0**, bundling gscan **6.4.2**.
Image digests: `ghost@sha256:a0506f3f…48bdb5` (5-alpine), `ghost@sha256:c917e2a3…a70a3f2` (6-alpine).

    docker exec iz-ghost5 cat /var/lib/ghost/versions/*/node_modules/gscan/package.json | grep version

### 13a. The same theme, three verdicts

The theme is the probe theme (a `page.hbs` with no `@page.show_title_and_feature_image` guard, and
one `{{#get}}` using `limit="all"`), chosen because it discriminates. Verdicts as reported by the
Admin theme-upload endpoint on each real Ghost, against the local checkers:

| checker | errors | warnings |
| --- | --- | --- |
| gscan 6.4.2 at `checkVersion: 'v5'` — **what the gate used to run** | **0** | 1 |
| **real Ghost 5.130.6** (gscan 4.49.7) | **1** | 0 |
| gscan 4.49.7 at `checkVersion: 'v5'` — **what the gate runs now** | **1** | 0 |
| gscan 6.4.2 at `checkVersion: 'v6'` | 0 | 2 |
| **real Ghost 6.58.0** (gscan 6.4.2) | 0 | 2 |

The corrected pairing reproduces both real Ghosts exactly — error counts **and** rule codes
(`GS110-NO-MISSING-PAGE-BUILDER-USAGE` on 5.x; that plus `GS090-NO-LIMIT-ALL-IN-GET-HELPER` on 6.x).
The spike theme scores **0 errors / 0 warnings under both checkers**, so nothing regressed.

### 13b. Where the two v5 specs actually differ

    261 rules in gscan 4.49.7's v5 spec; 259 in gscan 6.4.2's.

| rule | 4.49.7 | 6.4.2 |
| --- | --- | --- |
| `GS110-NO-MISSING-PAGE-BUILDER-USAGE` | **error** | warning |
| `GS110-NO-UNKNOWN-PAGE-BUILDER-USAGE` | **error** | warning |
| `GS050-CSS-KGVIDTHUMB` · `-KGVIDTHUMBPL` · `-KGVIDTI` | warning | **absent** |
| `GS005-NO-INLINE-DYNAMIC-PARTIAL` | absent | error |

`GS100` and `GS051-CUSTOM-FONTS` exist in **both** with identical regexes; the `config.custom` cap is
**20** in both and the allowed types (`select|boolean|color|image|text`) are unchanged. **AD-17 and
AD-18 therefore survive the version split unchanged** — only the GS110 pair and the three GS050
video rules moved.

### 13c. Cost — the split does not buy a second gscan's worth of time

Five runs each on the spike theme, medians (the first call of each process is module load and is
excluded as cold):

| checker | median |
| --- | --- |
| gscan 4.49.7 (Ghost 5 verdict) | **27.9 ms** |
| gscan 6.4.2 (Ghost 6 verdict) | **29.6 ms** |
| both | **57.5 ms** |

**Scope limit, stated because it matters:** this is the two-section spike theme, **not** AD-11's
40-section stress fixture — which Round 1 established is not checked in anywhere in the repo and
which Round 1 decision 10 is still open against. §2's `217 + 88 = 305 ms` was measured on that
fixture and is **not** comparable to the numbers above. What these numbers do establish is that
running two gscan *majors* costs about the same per pass as running one twice, so the split is not a
new budget risk. **The authoritative re-measure against AD-11 waits on decision 10's rebuilt fixture.**

### 13d. A33 Koenig card treatments, quantified under both checkers

`card_assets.exclude` restores gscan's rules for each excluded card (§7). Measured on the spike theme:

| excluded | gscan 4.49.7 (Ghost 5) | gscan 6.4.2 (Ghost 6) |
| --- | --- | --- |
| none (`card_assets: true`) | 0 | 0 |
| one — `callout` | **12** | **12** |
| six — `callout, button, header, product, toggle, video` | **53** | **50** |

**A33 is six designs.** So the category's full styling obligation is **53 classes on Ghost 5 and 50
on Ghost 6**, and the **3-warning delta is exactly** `GS050-CSS-KGVIDTHUMB`, `-KGVIDTHUMBPL` and
`-KGVIDTI` — the video-thumbnail rules that exist only in 4.49.7 and that the previous gate could
never see. This lands on **E7** and **E10's A33 category gate** simultaneously: designing a Koenig
card means styling every class gscan checks for it, on **both** majors, or FR-J6's 0/0 target breaks
on Ghost 5 only — the harder failure to notice.

---

## 14. AD-11 re-measured on the rebuilt stress fixture · Round 3 · **corrects §2 and §11**

Round 1 decision 10 is closed. The fixture is checked in at `tools/stress/` and this is its
measurement. §2's numbers were taken on a fixture that was never committed and that Round 1
established was ~7.4x too light per section; these replace them.

    cd tools/stress && npm install && node build.js && node gate.js theme

**Fixture shape.** Eight annotated-HTML archetypes sized from `sections-inventory.md` — header with
a nav repeat, split hero with a stat row and a trust rail, post feed with a **nested** tag repeat,
tiers with a benefit sub-repeat, gallery, member-aware CTA band, article body with a related-posts
repeat, footer with three nav repeats. **Mean 39.1 elements and 21.0 directives per section**
against the spike's toy hero at **5 elements and 3 directives**. 70 renders over 7 templates
(`custom-stress` 40, six others 5 each), 197 files, 10.20 MB uncompressed / 10.09 MB zipped, with
80 hashed renditions and 8 woff2 subsets generated as incompressible seeded bytes.

The pipeline it runs is the one **as decided**, not the one the spike ships: AD-5 numeric entities,
AD-4's splice-after-serialization, R2-5's substitute-last-over-the-file-tree, R2-7's unforgeable
token and R1 decision 7's nested repeats.

### 14a. The budget

| stage | §2 claimed | host · node 22 · 4 cores | **node 24 · 2 GB · 1 vCPU** | node 24 · musl · 1 vCPU |
| --- | --- | --- | --- | --- |
| render + serialize (70) | 770 ms | 1046 ms | **1422 ms** | 1768 ms |
| per section | 11.0 ms | 14.9 ms | **20.3 ms** | 25.3 ms |
| assemble | 14 ms | 38 ms | **42 ms** | 78 ms |
| substitute user text | *(not measured)* | 8 ms | **16 ms** | 9 ms |
| FR-J17 quality gate | 700 ms | 984 ms | **1554 ms** | 1738 ms |
| zip | 222 ms | 240 ms | **260 ms** | 264 ms |
| gscan 4.49.7 + 6.4.2 | 305 ms | 493 ms | **641 ms** | 816 ms |
| **total** | **~2.0 s** | **~2.8 s** | **~3.9 s** | **~4.7 s** |
| peak RSS | 289 MB | 454 MB | **486 MB** | 456 MB |

**AD-11's decision survives; its headroom does not.** Against `maxDuration: 300` and
`memory: 2048` the worst measured case is **~4.7 s and 486 MB** — **~64x duration** and **~4.2x
memory**, where AD-11 states ~140x and ~7x. §7.1's gscan-boundary split still does not trigger and
is still not built. The same caveat §2 carries applies unchanged: the fixture reads no Storage bytes
and subsets no fonts, so the real function pays more than this.

**`substitute user text` is a stage §2 never had.** R2-5 made it one, and it is cheap only if it is
a single regex pass — the first implementation looped one replace per marker over every file and
cost **289 ms**, 36x the corrected 8 ms.

### 14b. Three defects that only appear once the decided pipeline is actually run

None of these is visible on a two-section fixture, which is why two rounds did not see them.

1. **Token resolution must run in REVERSE insertion order.** Repeats are processed deepest-first
   (R1 decision 7), so an inner repeat's tokens are inserted *before* the outer replacement that
   carries them into the string. Forward order — what `spike-compiler/compile.js` does — substitutes
   the inner tokens before they exist, and **ten `partials/*.hbs` shipped raw `\u0001N\u0002` tokens**.
2. **User-text substitution must be one regex pass, never a loop of per-marker replaces.** A loop
   re-scans its own output: a user who types the marker shape for slot 0 inside the text of slot 3
   gets that shape written into the file *after* slot 0 was processed, and it ships raw. Escaping
   cannot save this, because the marker is not made of escapable characters.
3. **The escaper must strip the marker delimiters.** R1 decision 6 calls for "a marker shape escaped
   user text can never contain" — true only if the escaper removes it. Two files shipped delimiters
   straight through until the escaper dropped C0 controls.

### 14c. The two-checker verdict, on a real fixture

    Ghost 5.x  via gscan 4.49.7 (v5)  ->  ERRORS 0  WARNINGS 0
    Ghost 6.x  via gscan 6.4.2 (v6)   ->  ERRORS 0  WARNINGS 0

§13c's scope limit is lifted: the pair costs **493–816 ms** on the 197-file theme rather than the
57.5 ms measured on the two-section spike, and the split is still not a budget risk.

**`GS050-CSS-KGWF` is an ERROR on both majors even under `card_assets: true`** — a theme that never
styles `.kg-width-wide` and `.kg-width-full` scores 1 error on 4.49.7 *and* 6.4.2. It is not in
§13d's exclusion arithmetic, because it fires without any exclusion at all. E6 and E7 both need it.

**gscan does catch an unresolvable partial reference** — `{{> "sections/index/does-not-exist"}}`
scores `GS005-TPL-ERR`, an error on both majors. It does **not** catch an orphan partial, which is
AD-34's assertion and remains so.

### 14d. AD-14 determinism across environments

The 197-file tree is **byte-identical** — `sha256 b442dfa9f6bf23af…` over `find … | sort | xargs
sha256sum` under `LC_ALL=C` — across four environments: host (node 22.23.2, ext4, 4 cores), and
containers at node 22 glibc, **node 24 glibc** and **node 24 musl/alpine**, each 2 GB / 1 vCPU on
overlayfs. Two libc implementations, two Node majors, two filesystems, two CPU allocations.

**Residual, stated:** these are four environments on one physical machine and one CPU architecture.
A second machine and a non-x86 arch remain untested.

### 14e. AD-5 end-to-end on a full theme

The fixture plants five hostile strings in user text, including `C:\{{@site.title}}` — the case that
defeats every backslash rule (§3). Compiled with Handlebars 4.7.9 against a context binding
`site.title` and `title`: **zero live evaluations, zero parse failures**, and the browser's own
parser decodes every one back to the exact characters the user typed. `grep` finds no live `{{title}}`,
`{{@site.title}}` or `{{#if @member}}` anywhere in the emitted tree.

---

## 15. Executed against two real Ghosts · closes eleven §7.6 items · Round 3, real infra

First runtime evidence in this project's history. Every prior Ghost claim came from source
reading, gscan specs, or containers. `research-ghost-binding-contexts.md` §1179 states the gap
plainly: *"Nothing was executed at runtime … No Ghost 5 or Ghost 6 instance was booted to
observe actual rendering."* These are those instances.

**Targets** (§4's T3 and T1), both Ghost-CLI production installs — nginx, MySQL 8.0.46, systemd,
Let's Encrypt, Ubuntu 24.04.4, Node 22.23.2, 1 GB + 2 GB swap:

| | host | ghost | gscan | nql |
| --- | --- | --- | --- | --- |
| **T3** | `ghost5.inflozo.com` | **5.130.6** | **4.49.7** | **0.12.7** (nql-lang 0.6.3) |
| **T1** | `ghost6.inflozo.com` | **6.58.0** | **6.4.2** | **0.13.4** (nql-lang 0.7.0) |

Both bundle exactly the gscan pair §13 measured, so these verdicts are comparable to Round 2's.
Fixtures are identical on both boxes: 32 posts (12+12+8), 8 featured, 8 without a feature image,
6 tags all above the 3-post floor, 3 authors at 11/11/10, 57 members.
Harness: `tools/probe/` — `provision-ghost.sh`, `seed-ghost.py`, `run-verify-13.py`, `run-verify-all.py`.

### 15a. Item 13 — the four docs-vs-code conflicts, at runtime. **Identical on both majors; the code wins every time.**

**Conflict 1 — `@even`/`@odd` parity. The docs are wrong.** This is the one that blocks E9.

    ROW|index=0|number=1|even=false|odd=true |first=true |last=false
    ROW|index=1|number=2|even=true |odd=false|first=false|last=false
    ROW|index=2|number=3|even=false|odd=true |first=false|last=false
    ROW|index=3|number=4|even=true |odd=false|first=false|last=true

Parity tracks the **1-based `@number`**, not the 0-based `@index` — so **the first item is `odd`**.
`docs.ghost.org/themes/helpers/functional/foreach` says "`@even` — true if the `@index` is even",
which would make the first item even. A library authored against the docs zebra-stripes backwards
in every alternating design, and nothing but a human eye on a real site would catch it.

**Conflict 2 — helpers in error templates are permitted.** Inside a real 404, `error-404.hbs` ran
`{{statusCode}}`, `{{message}}`, `{{meta_title}}`, `{{@site.title}}`, `{{t}}`, `{{img_url}}` and a
live `{{#get}}` that returned rows. The docs' prohibition is a robustness recommendation, not a
constraint. *(The non-404 `error.hbs` path is still unexercised — triggering a genuine 5xx on a
healthy Ghost needs a deliberately broken template. Recorded as still open rather than covered.)*

**Conflict 3 — `@config` carries more than `posts_per_page`.** `@config.image_sizes.m.width` → `800`,
traversable. `posts_per_page` echoed the theme's own `7` rather than a platform default, which is
what proves the theme's config is being read.

**Conflict 4 — nested partial directories resolve.** `{{> "deep/nested/thing"}}` rendered from
`partials/deep/nested/thing.hbs`, three levels down.

### 15b. Item 11 — the paywall override point. **CONFIRMED, and it has a condition nobody knew about.**

`partials/content-cta.hbs` **does** replace Ghost's default `gh-post-upgrade-cta` at the
`{{content}}` cutoff, on both majors. The register calls refutation here "the highest-cost in the
list after 14(a)"; it did not happen.

**But the override only takes effect if the theme also references that partial explicitly from a
template.** Reproduced 2/2 each way, on both majors:

| theme contains | CTA rendered from |
| --- | --- |
| `partials/content-cta.hbs` alone | **Ghost's core default** |
| the same partial **plus** `{{> "content-cta"}}` in a template | **the theme's partial** |

Ghost registers `partialsDir: [core helperTemplates, theme partials]` and
`templates.execute('content-cta')` reads `handlebars.partials['content-cta']`, so the theme's copy
should always win — and without an explicit reference it does not. Dropping the partial in and
expecting it to work is the natural thing a theme author does, and it silently fails.
**Library rule for E7 and A32: the compiler emits an explicit `{{> "content-cta"}}` reference
whenever it emits the partial.** Not a convention — a compile assertion.

### 15c. Item 15 — what a theme may style inside `{{comments}}`. **Almost nothing.** Blocks E10's A28.

`{{comments}}` emits **exactly one element** and no DOM of its own:

    <script defer src="https://cdn.jsdelivr.net/ghost/comments-ui@~1.6/umd/comments-ui.min.js"
      data-ghost-comments="…" data-api="…" data-key="…" data-count="true" data-post-id="…"
      data-color-scheme="auto" data-avatar-saturation="60" data-accent-color="#FF1A75"
      data-comments-enabled="all" data-publication="Ghost6" crossorigin="anonymous"></script>

Three consequences, all binding on A28's ten designs:

1. **The thread is not server-rendered and not reachable by theme CSS.** A28 is confined to the
   chrome *around* the thread, exactly as AD-23's entry anticipated — now with evidence.
2. **It is third-party JavaScript from `cdn.jsdelivr.net`.** Any CSP a generated theme carries must
   allow that origin or the comments silently never appear, and it sits outside NFR-2's JS budget
   while still being on the page.
3. **It carries its own `data-color-scheme="auto"` and `data-accent-color` from Ghost's settings** —
   *not* from the Style Pack. So a dark-mode canvas and a live comment thread can disagree, and
   FR-D7's mode handling cannot reach it. That belongs on §1.2's carve-out list.

### 15d. Item 12 — API pagination. **The majors genuinely differ.**

| request | Ghost 5.130.6 | Ghost 6.58.0 |
| --- | --- | --- |
| `?limit=all` | echoes `all` | **echoes `100`** |
| `?limit=200` | echoes `200` | **echoes `100`** |

Ghost 6 caps server-side at 100 and silently rewrites the request; Ghost 5 applies no cap.
FR-H2's Count ceiling of 100 and its ban on `limit="all"` are both confirmed correct — and the
Ghost 5 half is confirmed *permissive*, so a design that over-fetches is invisible on 5.x and
capped on 6.x. The gate catches it either way: `GS090-NO-LIMIT-ALL-IN-GET-HELPER` and
`GS090-NO-LIMIT-OVER-100-IN-GET-HELPER` fired on the v6 spec and were absent from v5, independently
re-confirming VERIFY 33.

### 15e. Item 14c — the Template dropdown's label transform. **Closed.**

| filename | label Ghost derives | offered for |
| --- | --- | --- |
| `custom-member-home.hbs` | **`Member Home`** | `["page", "post"]` |
| `custom-two-word.hbs` | **`Two Word`** | `["page", "post"]` |

Strip `custom-`, split on hyphens, Title-Case each word, join with spaces. Identical on both majors.
§7.4's live filename-and-label preview can now show the true label. **Also newly recorded:** custom
templates are offered for **posts as well as pages**, which FR-I1's page-binding flow assumed was
pages only.

### 15f. Item 18 — `{{total_members}}`. **The PRD's rule is wrong below 51.**

Executed at two counts on both majors:

| members | renders |
| --- | --- |
| 45 | **`45`** — exact, no rounding, **no `+`** |
| 57 | **`50+`** |

`prd.md` says the value is "a string, always, since Ghost rounds it down and appends `+`". Read from
`core/frontend/utils/member-count.js`, the brackets are: **≤ 50 exact**; 51–100 round to 10;
101–1,000 to 50; 1,001–10,000 to 100; 10,001–100,000 to 1,000; above that `humanNumber` lowercased.
Every Inflozo user starts under 51, so **the common case is the one the PRD gets wrong** — a design
that hard-codes an "N+" shape is wrong for essentially every new site.

**And the two majors compute the total differently:**

| | Ghost 5 | Ghost 6 |
| --- | --- | --- |
| `total` | `free + paid + comped` | `free + paid + comped + **gift**` |
| at ≤ 50 | returns a raw **number** | returns a comma-formatted **string** |

A site with gift subscriptions reports a different member count on the two majors. `md5sum` of that
file differs between the boxes — checking rather than assuming "same helper, same behaviour" is what
surfaced it.

### 15g. Item 20 — the NQL build Ghost resolves. **Neither major runs what FR-I2 was proved against.**

`prd.md` records FR-I2's two normative rules as "proved against `@tryghost/nql@0.13.x`, not against
Ghost's resolved build." Resolved builds:

- **Ghost 5.130.6 → nql 0.12.7** (nql-lang 0.6.3)
- **Ghost 6.58.0 → nql 0.13.4** (nql-lang 0.7.0)

So the proof covers Ghost 6 and **never covered Ghost 5**, which NFR-7 supports publicly and T3
tests permanently. This is AD-34's pattern for the third time — the version a major *bundles*
differing from the version a claim was proved against, after gscan and `member-count.js`.

**Executed at runtime, both majors, identical results — no defect reproduced:**

    NQL|relative_date  filter="published_at:>=now-30d"                 -> 1 row
    NQL|nested_parens  filter="(tag:craft+featured:true),(tag:systems)" -> 5 rows
    NQL|inner_group    filter="tag:craft+(featured:true,featured:false)"-> 5 rows

Both relative dates and nested parentheses work on 0.12.7 and 0.13.4. FR-I2's rules hold on both —
but they now hold on *observed* grounds rather than on a version that neither major runs.

### 15h. Items 2, 3, 9, 21 — closed in passing

- **Item 2 · `hostSettings` is ABSENT on self-hosted**, both majors. `GET /admin/config/` returns
  `clientExtensions, database, emailAnalytics, … , version` and no `hostSettings` key at all, so
  FR-C2's probe must treat **absence** as "not Ghost(Pro)" rather than reading a flag. The
  Ghost(Pro) half stays blocked behind the Starter trial, deliberately.
- **Item 3 · the host's theme-upload ceiling is 1 GB, not 50 MB.** Ghost-CLI writes two different
  values, and the operative one is on the SSL vhost every real deploy uses:
  `ghost<N>.inflozo.com.conf → client_max_body_size 50m` but
  `ghost<N>.inflozo.com-ssl.conf → client_max_body_size 1g`. ~100× headroom over the 10.09 MB stress
  theme. This is the answer for a Ghost-CLI self-hosted box only; Ghost(Pro) will differ.
- **Item 9 · the Owner's Staff Access Token DOES lift `GET /themes/`**, both majors — and the
  integration token does not, with **different rejections per major: 501 on Ghost 5, 403 on Ghost 6.**
  AD-24's mapping table must fold both into one Inflozo code, or the same cause produces "server
  does not support this" on 5.x and "no permission" on 6.x. Confirmation is worth more than the
  register expected: FR-J10's uniqueness no longer rests on `project_site_bindings` alone, and
  FR-J13's snapshot and FR-J16's drift check both gain a working primary path.
- **Item 21 · all three announcement settings are readable** through the Admin API with the staff
  token — `announcement_content`, `announcement_visibility` (a JSON string, `"[\"visitors\"]"`),
  `announcement_background`. FR-C4's seed is executable as designed.

### 15i. Method note — creating authors without invitations

Ghost's `/users/` endpoint cannot create staff, only invite them, which needs working email. **The
Universal Import endpoint can:** `POST /db/` with a `users` payload creates staff users directly, no
invitation and no acceptance, landing as `status=locked` with the role given. Plus-addressing
(`umngkmr+priya@gmail.com`) satisfies the `users_email_unique` index from one real inbox. This
unblocks A21 and A12 #9 fixtures far earlier than assumed.

### 15j. One `error.hbs` serves every error, and gscan is not advisory at upload

**The error-template hierarchy, read from `core/frontend/services/rendering/templates.js:23-34`:**

```js
getErrorTemplateHierarchy(statusCode)  ->  ['error-' + code, 'error-' + code[0] + 'xx', 'error']
```

So `error.hbs` is Ghost's own final fallback for **every** status. A theme needs no
`error-404.hbs` and no per-status variants unless it wants them.

**Executed on both majors with a single `error.hbs` and no other error template:**

| trigger | status | `error.hbs` rendered |
| --- | --- | --- |
| missing route | **404** | yes |
| a partial missing at render time | **400** | yes |

Helpers work in both cases and on both majors — `{{statusCode}}`, `{{message}}`, `{{meta_title}}`,
`{{@site.title}}`, `{{t}}`, `{{img_url}}` and a live `{{#get}}` returning rows. This closes the half
of item 13's conflict 2 that §15a left open: the docs' "error templates shouldn't use any theme
helpers" is a recommendation on **every** error path, not only on `error-404.hbs`.

**Note the status:** a render failure surfaces as **400, not 500** — Ghost classifies it as an
`IncorrectUsageError`. `{{statusCode}}` therefore carries `400` and `{{message}}` carries the
underlying template error verbatim: `[custom-boom.hbs] The partial boom could not be found`.
**That message is shown to visitors**, so an emitted theme must never rely on a partial it does not
ship — the failure is public, not silent. AD-34's orphan-partial assertion covers the reverse case;
this is the one it does not.

**And a correction to a Round 2 reading.** §13a records that Ghost 5 "activates the theme anyway"
despite a gscan error, and that is true for `GS110`. It is **not** true in general. A theme carrying
`GS005-TPL-ERR` was **rejected at upload**, on both majors:

    HTTP 422  type=ThemeValidationError
    message : Theme "inflozo-probe-all" is not compatible or contains errors.
      error : GS005-TPL-ERR — Templates must contain valid Handlebars
              ref=custom-boom.hbs  The partial this-partial-does-not-exist could not be found

So gscan errors split into **fatal at upload** and **reported but activated**, and FR-J6 cannot
treat "Ghost accepts it anyway" as a general property. This also answers the hard half of item 10:
a theme that fails Ghost's own gscan is **not** always re-uploadable, so FR-J13's snapshot restore
must assume rejection is possible and surface the 422 detail rather than retrying blindly.

---

## 16. Real hosted Supabase · E1's exit criterion, D6's open probe, and F8 · Round 3

Project `adasbmxypwvnxznzzxwp`, PostgreSQL **17.6**, created with Supabase's **post-2026-05-30**
grant default (`authenticated` holds **no** table privileges in `public`). A second, older project
supplies the pre-cutover half. Reproduction:

    psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f SCHEMA.sql -f RLS-TEST.sql

**`PRELUDE.sql` is omitted, and that is not optional.** It is a stand-in for a bare container, and
against a real project its `create or replace function auth.uid()` would **overwrite Supabase's own
implementation with one returning `NULL`** — silently disabling every policy in the schema while the
proof still reported PASS. Read from the live project before anything was applied, the platform's
own function is:

```sql
coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
         (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'))::uuid
```

Its **first branch is the exact setting `RLS-TEST.sql` already sets**, so impersonation is identical
on both targets and the stub was never needed. `RLS-TEST.sql` is now **dual-target rather than
forked** — it tests `has_schema_privilege(current_user, 'auth', 'CREATE')` and installs the
stand-ins only where it owns the schema — because two copies of one proof is the divergence this
project keeps finding.

### 16a. The result

| | container (Round 2) | **hosted (this run)** |
| --- | --- | --- |
| `SCHEMA.sql` | applies clean | **applies clean, `ON_ERROR_STOP`, 0 errors** |
| tables / policies | 30 / 34 | **30 / 34** |
| assertions | 36 PASS | **38 PASS, 0 FAIL, 0 psql errors** |

**Two things confirmed live that were previously only designed.** `auth.users = 2 → entitlements = 2,
profiles = 2`: R1 decision 14's `auth_user_entitlement` trigger fires on the real platform, so
AD-28's "an entitlements row is created at signup" stops being aspirational. And the four buckets of
§12 exist with `public = false`, carrying exactly the three policies the file installs.

### 16b. D6's open probe — answered, and the finding holds

`SCHEMA.sql` §12 printed, during the hosted apply:

    WARNING:  D6 NOT APPLIED: TRUNCATE remains granted on 4 storage grants. The grantor is
              supabase_storage_admin and this role cannot revoke it.

**Hosted `postgres` cannot perform the revoke either.** D6 was written to *attempt and report* rather
than assume, which is the only reason this surfaced as a visible warning instead of a migration that
looks clean and protects nothing. The control that actually holds is the one `RLS-TEST.sql` now
asserts, independently confirmed over HTTP: **`storage` is not a PostgREST-exposed schema** —
`GET /rest/v1/buckets` with the publishable key returns **404**, which also refutes the reachability
half of Round 3's **F3** on the real platform.

### 16c. F8 — CONFIRMED. The only sanitizer in the product is advisory.

Executed with a **real end-user JWT** (publishable key + password grant), never the secret key:

| target | result |
| --- | --- |
| `assets/{own}/evil.svg` | **ACCEPTED — HTTP 200** |
| served back through a signed URL | **`<script>` present: true · `@import` present: true · byte-identical** |
| `assets/{another user}/evil.svg` | denied — *new row violates row-level security policy* |
| `suggestion-images/{own}/evil.svg` | **ACCEPTED — HTTP 200** |
| `deploy-artifacts/{own}/evil.svg` | denied — RLS, no policy |
| `site-snapshots/{own}/evil.svg` | denied — RLS, no policy |

The conventions row says "an uploaded SVG is sanitized with DOMPurify". AD-12 puts that pass **in the
browser**; AD-32 lets the browser write the bucket **directly**. A client that declines to run it
uploads raw bytes and **nothing server-side ever sees the file**. Sanitizer placement is not a
hardening detail — it is the entire property.

**The containment holds, and that bounds the severity.** Folder scoping and the no-policy deny
mechanism both work on real Supabase, so `assets/` is self-XSS on the storage origin rather than a
cross-tenant hole. **`suggestion-images/` is the exception** — FR-M3 approves those onto a public
board, so one user's unsanitized file reaches every visitor. Round 3 decision **D4** already puts
server-side re-sanitization on exactly that bucket; this is the evidence it was the right call
rather than a precaution.

**One unplanned finding, and it needs writing down before E13.** Signing a URL for
`suggestion-images` returns **HTTP 400** while `assets` signs fine: §12 gives that bucket `insert`
and `delete` policies and **no `select` policy**, so the owner can write a file and then cannot read
it back. That is consistent with the design ("write your own; nobody reads directly"), but it means
**the server route that mints the signed URL for the public board must use the service key**, and no
AD says so. E13 builds that reader over this.

---

## 17. Vercel Fluid, executed · closes R1 decision 11 · **AD-11's memory headroom is wrong**

Round 1 finding 5 — *"Vercel Fluid shares one instance across concurrent invocations; `memory: 2048`
is the INSTANCE budget"* — was **read from Vercel's docs and never executed**. R1 decision 11 said to
measure it during E0. This is that measurement, on a real Pro project (`inflozo-probe`, `iad1`).

Probe: a Node function holding a module-scope instance id, an invocation counter, a live concurrency
counter and an optional retained allocation. Two invocations reporting the same id ran in the same
instance — that is the whole experiment. Runtime **Node v24.18.1**, matching the Stack table's pin.
`AWS_LAMBDA_FUNCTION_MEMORY_SIZE` is unset, so Fluid is not classic Lambda.

### 17a. Both halves of Round 1's claim, judged separately

**Half one — "shares one instance across concurrent invocations": TRUE, but not as stated.**

| burst | distinct instances | max co-located on one |
| --- | --- | --- |
| 5 concurrent | **4** | 2 |
| 20 concurrent | **13** | 4 |
| 40 concurrent (300 MB each) | **40** | 1 |

Fluid **does** co-locate — up to **4** concurrent invocations on one instance were observed. But it
also **scales out**, and under a 40-way burst it gave every invocation its own instance. So the
pessimistic reading Round 1's wording invites — *all* concurrency landing on one instance — does not
happen. Co-location is real, bounded, and load-dependent.

**Half two — "`memory: 2048` is the INSTANCE budget": CONFIRMED, decisively.**

Sequential invocations, each allocating 250 MB and **retaining** it at module scope, all landing on
one warm instance:

    invocation #2   RSS   608 MB
    invocation #3   RSS   859 MB
    invocation #4   RSS  1109 MB
    invocation #5   RSS  1359 MB
    invocation #6   RSS  1610 MB
    invocation #7   RSS  1860 MB
    invocation #8   HTTP 500  — killed, between 1860 MB and ~2110 MB

Memory accumulates across invocations on a warm instance, is **not** reclaimed between them, and the
instance dies at the 2 GB line. The platform recovers immediately on a fresh instance (next request:
57 MB, invocation #1), so the failure is one lost request, not a lasting outage.

### 17b. What this does to AD-11 — the headroom is not what §14 says

§14 measures **486 MB peak RSS** for one compile of the 40-section stress fixture, and reads that as
**~4.2× memory headroom** against `memory: 2048`. That number silently assumes one compile per
instance. It is now measured that up to **4 concurrent invocations share one instance's 2 GB**:

    4 concurrent compiles x 486 MB  =  1,944 MB  against a 2,048 MB instance budget  =  95%

**The real headroom against concurrent deploys is roughly 4 compiles, not 4.2x of anything** — and
the fifth co-located compile is an OOM, which §17a shows arrives as an HTTP 500 on a request that
already told the user their deploy started.

This is not hypothetical for this product. Deploys are exactly the bursty path: §4's Definition of
Done runs **30 serialized starter deploys** across T1–T3, FR-J11 permits **10 deploys per hour per
site**, and a Pro user holds **25 projects**. Three or four overlapping compiles is an ordinary
Tuesday, not a stress case.

**What is NOT concluded here:** that AD-11's decision is wrong. `maxDuration: 300` is confirmed as
the real Pro default (`functionDefaultTimeout: 300`, read from the project's own resource config),
Fluid is **on by default** for new projects (`fluid: true`), and §7.1's gscan-boundary split still
buys nothing. What changes is that **memory headroom must be stated per instance under concurrency,
not per compile** — and on that basis the margin is thin enough to need a decision rather than a
footnote.

**Also worth keeping:** memory is retained between invocations on a warm instance unless the code
releases it. AD-1's ban on module-level mutable state in the core is what keeps the compile from
accumulating across invocations — a rule adopted for determinism that turns out to carry a memory
consequence nobody had connected to it.

### 17c. Method note

`peakConcurrentOnThisInstance` in the first probe was a **cumulative** counter and therefore reported
stale peaks from earlier bursts; the co-location figures above are taken from live concurrency and
from RSS, not from that counter. Recorded because the first reading of the 40-way burst looked like
4-way co-location with 300 MB allocations, and it was not.

### 17d. Does 4 GB cost more, and does it buy CPU? Measured.

**It buys no CPU.** Identical CPU-bound work, same code, same region, five runs each:

| memory | median | cores reported |
| --- | --- | --- |
| 2048 MB | **1,992 ms** | 2 |
| 4096 MB | **1,892 ms** | 2 |

~5% apart, inside run-to-run variance, and **both sizes already report 2 cores**. An earlier note in
this session claimed 4 GB brings a second vCPU and would roughly halve compile time; that is **false**
and is corrected here rather than quietly dropped. Node's JavaScript is single-threaded, so a second
core would not have halved it in any case.

**It costs more, and the amount is trivial.** Fluid bills **Active CPU at $0.128/hour — only while
code actually runs, I/O wait is free** — and **Provisioned Memory at $0.0106/GB-hour**
(`vercel.com/docs/functions/usage-and-pricing`, read 2026-08-20). With duration unchanged, only the
memory reservation doubles:

| per compile (~4 s) | 2 GB | 4 GB |
| --- | --- | --- |
| provisioned memory | $0.0000236 | $0.0000471 |
| active CPU | $0.000142 | $0.000142 |
| **total** | **$0.000166** | **$0.000189** |

**+14% of a deploy's compute — about 2 cents per thousand deploys, $2.30 per hundred thousand.**
Against Appendix F's blended **$12.61/month net per Pro customer**, a user deploying ten times a day
pays about **5.7 cents/month** in compile at 4 GB against 5.0 at 2 GB. **No Appendix F break-even
moves**, so G7's 11–15-subscriber cash break-even and the 160–180 payback are unaffected.

---

## 18. The Next 16 CSP, executed · closes R1 decision 5 · deferred through three rounds

NFR-3's per-session CSP and R1 decision 5 — *"two CSP policies: nonce-based on `app.inflozo.com`,
static on `inflozo.com`"* — were carried by Rounds 1, 2 and 3 without ever being run. Round 1
finding 6 stated the hazard: *"Next 16 CSP requires nonce + `strict-dynamic`; nonces force dynamic
rendering"*, which reads as a collision with the marketing site being SSG. This is that test: a real
Next **16.3.1** app, built locally and deployed to Vercel Pro (`iad1`).

**Item 25 confirmed from Next's own source**, not from the blog post it was originally cited to.
`next/dist/lib/constants.js` in 16.3.1 declares **both**:

    MIDDLEWARE_FILENAME = "middleware"      MIDDLEWARE_LOCATION_REGEXP = "(?:src/)?middleware"
    PROXY_FILENAME      = "proxy"           PROXY_LOCATION_REGEXP      = "(?:src/)?proxy"

### 18a. The finding that dissolves the collision

`next build` route manifest, with `proxy.ts` setting a CSP on **every** route:

    ┌ ○ /            <- marketing. STATIC, and it receives a CSP
    ├ ○ /_not-found
    ├ ƒ /editor      <- app. DYNAMIC, because it READS the nonce
    └ ○ /frame       <- STATIC
    ƒ Proxy (Middleware)

**Setting a CSP header in `proxy.ts` does not force dynamic rendering. Reading the nonce does.**
Round 1 finding 6 is correct on both clauses, but the operative distinction is between *emitting* the
header and *consuming* it in the page — and only the second costs prerendering. The marketing site
therefore keeps SSG **and** carries a CSP; it simply carries one without a nonce. R1 decision 5's
split is not a workaround for a collision, it is the shape the framework already wants.

### 18b. Two policies, one deployment — verified on Vercel

| | `/` (marketing branch) | `/editor` (app branch) |
| --- | --- | --- |
| `x-vercel-cache` | **PRERENDER** | MISS |
| `cache-control` | `public, max-age=0, must-revalidate` | `private, no-cache, no-store` |
| `script-src` | `'self'` | `'self' 'nonce-…' 'strict-dynamic'` |
| `connect-src` | *(default-src)* | `'self' https://ghost5… https://ghost6…` |
| `frame-ancestors` | `'self'` | `'self'` |

**`x-vercel-cache: PRERENDER` while serving a CSP** is the whole answer to the SSG question, on the
real platform rather than in a build manifest.

**The nonce is genuinely per-request.** Two consecutive requests to the same deployment:

    nonce="NzFmODdhMTAtNmMxZS00MjY5LTljNjktZjQyMTdlZjY5NTAx"
    nonce="YTUzZTUyM2ItNzNlZC00NGFmLTg0NTItMWJhMTk0NDg5ODlk"

and locally the nonce in the `content-security-policy` header was confirmed to **match the nonce
attribute in the delivered HTML** — the `proxy.ts` → `x-nonce` request header → `headers()` path
works end to end. A nonce that did not match would fail silently: the policy would look correct and
every inline script would be blocked.

**Host routing works from one deployment.** `Host: inflozo.com` returned `x-inflozo-policy:
marketing-static`; `Host: app.inflozo.com` returned `app-nonce`. That is §7.1's "two domains, one
deployment" exercised rather than assumed.

**`frame-ancestors 'self'`** is emitted on the iframe host page, which is what AD-21's same-origin
editing canvas needs and why NFR-3 chose it over `'none'`.

### 18c. What this does NOT prove — stated because the gap is the interesting part

The probe is a minimal app: three routes, one inline script. It establishes the **mechanism** —
two policies, one deployment, per-request nonce, SSG preserved, Node runtime. It does **not**
establish that the real editor runs under `script-src 'self'` with **no `'unsafe-eval'`**. That
claim rests on §7.1's "there is no Handlebars runtime in the browser" and on nothing in the editor
calling `new Function`, and it stays unproven until E5 has a canvas to test. The conventions row
should be read as a requirement on E5, not as a verified property.

---

## 19. Dodo, executed in test mode · closes VERIFY 6 · **FR-L2 refuted, and AD-7 has a hole**

Real Dodo test-mode account, real API, real webhooks delivered to a Vercel receiver that writes into
the **actual `billing_events` table** — deliberately, so FR-L2's schema meets genuine payloads rather
than invented ones. Base URL `https://test.dodopayments.com`.

### 19a. The event catalogue — 47, not 7

Read from the registered endpoint's own `filter_types`:

| group | n | group | n |
| --- | --- | --- | --- |
| `subscription.*` | **11** | `credit.*` | 9 |
| `dispute.*` | 7 | `payout.*` | 5 |
| `payment.*` | 4 | `entitlement_grant.*` | 4 |
| `abandoned_checkout.*` | 2 | `dunning.*` | **2** |
| `refund.*` | 2 | `license_key.*` | 1 |

**All seven events FR-L2 names exist.** The problem is the other forty.

### 19b. ⚠️ `subscription.cancelled` EXISTS. FR-L2 says it does not.

FR-L2 states, as normative text:

> *"There is **no documented `subscription.cancelled`**: cancellation is detected from
> `subscription.updated` plus a direct read of the subscription, never inferred from an event name
> that does not exist."*

Executed — a real subscription cancelled through the API, and Dodo delivered, signature-verified:

    subscription.cancelled   sig_ok=true
    subscription.updated     sig_ok=true

**This is the project's named failure mode, fifth instance:** an unverified claim about an external
platform entering as normative text, with a confident *reason* attached that stops anyone
re-examining it. FR-L2's cancellation path does an extra API read it does not need, and the sentence
asserting why must be struck rather than softened.

### 19c. Three more gaps in FR-L2's state machine

1. **`dunning.started` / `dunning.recovered` exist.** FR-L2 infers the 7-day grace and `pro_past_due`
   from `payment.failed`. Explicit dunning events are a better signal, and `dunning.recovered` maps
   directly onto the `pro_past_due → pro_active` transition currently derived by inference.
2. **Five `subscription.*` events are unhandled:** `expired`, `paused`, `unpaused`, `plan_changed`,
   `update_payment_method`. **`paused`/`unpaused` is the one that matters** — AD-28's resolver has
   `free | pro_active | pro_past_due` and **no state for a paused subscription**, so a paused customer
   resolves to whatever the last event left behind.
3. **`dispute.*` has seven events, FR-L2 uses one.** It moves `pro_active → free` on dispute opened
   and leaves restoration manual (`restored_by`, `restored_reason`). **`dispute.won` exists** and
   could drive that restoration instead of a human.

### 19d. ⚠️ AD-7's server-only tables are unreachable by the service role

The receiver's write was refused with the **secret key**:

    ERROR: permission denied for table billing_events   (42501)
    HINT:  GRANT SELECT, INSERT ON public.billing_events TO service_role;

    billing_events -> service_role:  REFERENCES, TRIGGER, TRUNCATE      <- no SELECT/INSERT

AD-7 says these tables are *"reachable **only by the service role** inside a server route."* On real
Supabase the service role **cannot reach them at all**. `SCHEMA.sql` §11a(7) grants AD-7's tables
"NOTHING", and that "nothing" landed on `service_role` as well as on `anon`/`authenticated`.
**FR-L2's webhook handler cannot store the payload it exists to store**, so the `entitlements` state
machine has no input.

Invisible until now because `PRELUDE.sql` never creates a `service_role`. Note RLS was never the
obstacle — `service_role` carries `bypassrls = true`; the missing **table grant** was. Same shape as
Round 1's "a view is not access control while the table grant stands", arriving from the other side.
Fix applied to the live project and required in `SCHEMA.sql`:
`grant select, insert on public.billing_events, public.site_credentials to service_role;`

### 19e. A webhook handler that returns 200 on a failed store loses the event forever

The receiver was written to always return 200 so Dodo would not retry indefinitely. Consequence:
when 19d's grant error hit, `payment.succeeded` and `subscription.active` were **acknowledged and
discarded**, and Dodo never redelivered them. Only the later cancellation was captured, after the
grant was fixed.

**Binding on E12:** FR-L2's handler must return a **non-2xx** when it cannot persist, so the
provider retries. Idempotency is what makes that safe, and `billing_events.dodo_event_id` is already
the unique key for it — the design was right and the handler's error path was wrong.

### 19f. Merchant-of-record tax handling, observed

A product priced **1500 USD** with a GB billing address was charged as:

    recurring_pre_tax_amount  1100 GBP        tax  220 GBP        total  1319 GBP
    settlement_amount         1319 GBP        settlement_currency GBP

Dodo converted the currency **and computed 20% UK VAT itself** — 1100 x 0.20 = 220, exactly. That is
FR-L1's "Dodo as merchant of record, taxes handled by Dodo", observed rather than assumed.
**`settlement_amount` equals `total_amount` here, so the API does not expose Dodo's own fee at the
payment level** — item 5's fee schedule is a dashboard/agreement fact, not an API one.

### 19g. No renewal-reminder event exists

Nothing among the 47 matches `remind`, `upcoming` or a pre-renewal notice; the nearest are
`subscription.renewed` (after the fact) and the two `dunning.*` events (after a failure).
**This is suggestive, not conclusive** — an email need not have a webhook. VERIFY item 6's statutory
half still needs a written answer from Dodo support, and if the answer is no, FR-P1 grows a sixth
email that E12 must build.
