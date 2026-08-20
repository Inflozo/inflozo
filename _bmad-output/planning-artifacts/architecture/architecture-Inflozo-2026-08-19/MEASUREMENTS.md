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
- **34** policies across **26** tables
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
