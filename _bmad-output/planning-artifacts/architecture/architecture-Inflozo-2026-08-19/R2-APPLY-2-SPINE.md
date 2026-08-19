---
title: Apply Round 2 decisions — the architecture spine batch
type: implementation prompt, self-contained
covers: R2-5, R2-6, R2-7, R2-8, R2-9, R2-10, R2-12, R2-13, R2-16
run: after R2-APPLY-1-SCHEMA.md, or in parallel — no file overlap
created: 2026-08-19
---

# Apply the Round 2 spine batch

You are editing **one file**: `ARCHITECTURE-SPINE.md`. Nine decisions, each a small amount of prose
in an existing AD. Everything you need is quoted here — do not go hunting for the Round 2 report.

Base path: `/home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/`

| File | Role |
|---|---|
| `ARCHITECTURE-SPINE.md` | the only file you edit — 35 invariants, AD-1..AD-35 |
| `ROUND-2-DECISIONS.md` | the decision record this prompt implements |
| `STRESS-TEST-R2.md` Part 3 | Round 1's 33 decisions — two of which you are amending |

**This directory is not a git repository.** Copy the file to `.bak` before your first edit.

## House style — match it, do not invent one

Every AD in this file has the same three-part shape: **Binds** (epics · FRs), **Prevents** (the
concrete failure, named), **Rule** (what must be true). Amendments go *inside* the existing AD in
that voice. Two things this spine does consistently and you must keep doing:

- **Name the failure, not the virtue.** "Prevents X" where X is a specific thing that breaks, not
  "ensures quality".
- **Say why the intuitive form is wrong**, where there is one. Several ADs already do this
  (AD-31's silent-no-op REVOKE, AD-21's rect-tracked overlays). Three of the changes below are
  exactly that shape.

Do not add a new AD unless a change genuinely has no home. Prefer amending.

---

## The nine changes

### R2-8 — AD-4: the theme renderer never puts marks markup into the DOM

**This is the most important sentence in the batch.** It is the difference between Round 1's
decision 1 working and quietly failing.

AD-4 currently says a text prop is `{text, marks[]}` over `strong|em|u|a`, that
`packages/section-runtime/marks.ts` is the single serializer, and that **both renderers call it**.
That wording naturally reads as "each renderer puts the serializer's output into the DOM" — and that
is the broken form.

**Executed 2026-08-19.** The serializer's correctly-escaped output, set as `innerHTML`, is decoded by
the HTML parser back to a live `{{`:

```
serializer output : &#123;&#123;<strong>title</strong>&#125;&#125;
after innerHTML   : {{<strong>title</strong>}}
LIVE HANDLEBARS?  : true
```

The canvas renderer *must* insert it (it needs live DOM, and decoding to `{` is correct there — the
user sees their literal text). The theme renderer must **not**: its marks output is spliced into the
emitted string **after** serialization, so no DOM ever touches it.

Add that distinction to AD-4's Rule, and say why — the intuitive reading reintroduces the exact
defect AD-5 exists to prevent.

### R2-5 — amend Round 1 decision 6: substitute over the file tree, not "the template"

Round 1 decisions **2 and 6 are jointly incoherent as written.** Decision 2 says fill user text in
*before* extracting the repeat body; decision 6 says substitute user text *last*. Both are correct
alone; together they name two different pipeline positions for one operation.

**Executed 2026-08-19**, with both applied exactly as written:

```
=== partial post-card ===
<article class="post-card">
      <span class="eyebrow">{§01§}</span>       <-- the marker shipped
      <h3>{{title}}</h3>
    </article>

marker survives into partial : true
user text present in partial : false            <-- the user's words are gone
```

The marker is planted before the repeat body is lifted into a partial, and the final substitution
pass runs over the main template only, because the partial is a separate string with its own token
table. Note this is a **new** leak of the class decision 2 was written to close.

State in the spine that user-text substitution is one final pass over the emitted **file tree** —
the template *and every emitted partial*. Where the compile pipeline is described (AD-14 and the
"compile pipeline" section), make the ordering explicit and unambiguous:
marks → escape → serialize → unwrap markers → resolve Handlebars tokens → substitute user text last,
across all emitted files.

### R2-6 — AD-34: widen the quality gate's assertion

**Executed 2026-08-19.** A complete, well-formed theme carrying *four* defects at once — the leaked
`{§01§}` marker, the lost user text, a literal `data-repeat="tags"` directive attribute, and an
orphan partial no template references — scored **0 errors / 0 warnings on both the v5 and v6 gscan
specs**. gscan cannot see any of it. AD-34's gate is the only thing that can.

Round 1 decision 7 names the directive attributes (`data-repeat|bind|prop|partial|empty`) and "no
compiler token". Widen it in AD-34 to:

1. cover **every emitted file**, partials included — not "the emitted tree" read as one template;
2. name the `{§N§}` user-text marker shape explicitly, because it was introduced *by* decision 6 and
   postdates decision 7's wording;
3. add **"every emitted partial is referenced by at least one template"** — an orphan partial is
   neither a directive nor a token, so nothing currently looks for it.

### R2-7 — the compiler's own token needs an unforgeable shape too

Round 1 found two ways the opaque token `__HBS_0__` collides. Decision 6 closed one and left its twin.

**Executed 2026-08-19:**

```
user types "__HBS_0__" in a text prop  -> "<h1>I like __HBS_0__ tokens</h1>"    FIXED
section author writes <!--__HBS_0__--> -> the entire {{#foreach}} block emitted TWICE   STILL BROKEN
```

Decision 6 protects user text because user text is now substituted last. Section-author source is not
user text, so it never goes behind a marker, and an authored comment matching the token shape is
still indistinguishable from one the compiler inserted. This is the "fixed in one place, not
propagated to its siblings" shape.

Record in the spine (AD-2 owns the authoring contract; §7.3 owns the token mechanic — pick the one
that fits) that the compiler's token carries a shape a section author's HTML comment cannot contain,
**or** that the library's authoring lint rejects any comment matching the token shape. Prefer the
shape — a lint is a rule people must remember. This will bite once 484 designs have many authors.

### R2-9 — AD-1: four more bans

AD-1 forbids `next/*`, `@supabase/*`, `node:fs`, `node:net`, `process.env`, `fetch`, `Date.now`,
`Math.random` and undeclared DOM globals, enforced by a CI dependency-boundary check.

It does **not** forbid `localeCompare`, `toLocaleUpperCase`, `Intl.*` or `new Date(x).toString()` —
all of which read machine locale or timezone and would void AD-14's byte-identical guarantee.

**Latent, not live.** The current spike is byte-identical across four LANG/TZ combinations including
`tr_TR.UTF-8` and `Pacific/Kiritimati`. But:

```
localeCompare en: ["Ähnlich","äpfel","apple","Apple","Zebra"]
localeCompare sv: ["apple","Apple","Zebra","Ähnlich","äpfel"]   <-- different order
toLocaleUpperCase('tr') of "title": TİTLE
```

Add the four to AD-1's banned list. The CI check already exists; this costs nothing.

### R2-10 — §7.4 / AD-14: specify the slug function and its collision rule

A conventional slug maps `Hero` and `HERO` to the same `hero` — three distinct layer names produced
two slugs in test. The spike names partial files from layer names, so one section's partial silently
overwrites another's.

*Suspected, not confirmed:* the slug function Inflozo will actually use is not specified anywhere in
the tree; a conventional one was tested. **Verify what the intended function is before writing the
rule** — and if none is specified, that absence is itself the finding.

Specify the function and its collision rule (numeric suffix, or reject) beside the existing rule
binding filename to layer name. This compounds with R2-12 below.

### R2-12 — AD-19 / AD-31: the deploy zip filename IS the Ghost theme identity

**Executed 2026-08-19 against real Ghost 6.58.0.** Four byte-identical zips uploaded under four
filenames produced **four separate themes**; `package.json.name` (`inflozo-probe` in all four) is
ignored for identity:

```
uploaded "inflozo-site.zip"     -> theme name: 'inflozo-site'
uploaded "inflozo-site-v2.zip"  -> theme name: 'inflozo-site-v2'
uploaded "MyTheme.zip"          -> theme name: 'MyTheme'
```

The filename is also the key used to **activate** and to **delete**. So whether a deploy *replaces*
the user's existing theme or *adds another beside it* is decided entirely by the zip filename
Inflozo chooses. Unstable naming means every deploy accumulates a dead theme in the customer's Ghost.

AD-31 already mentions freezing `projects.slug` "after a theme name is frozen" — this is the
mechanism that makes that freeze load-bearing, and no AD currently states it. Write it down: the
deploy filename is the theme identity, derives from one frozen column, and is stable for the life of
the site binding.

### R2-13 — AD-32: name `storage.buckets`

AD-32 opens with **"no bucket is public"** and then governs only `storage.objects` with three
policies. The `public` flag lives in `storage.buckets`, which the rule never mentions.

*Suspected:* real Supabase's default RLS state on `storage.buckets` was **not** verified — the test
prelude has RLS off there, but that prelude is a stand-in. **Verify against Supabase before asserting
anything about its default**, per the standing rule. Then extend AD-32 to name the table explicitly
and add it to `VERIFY-AT-BUILD.md`.

### R2-16 — drop Round 1 decision 25

Round 1 decision 26 names `project_treatments.pagination_design_id` as *"already in the schema —
nothing to build."* Round 1 decision 25 splits that table into one per owning epic. Whichever lands
second falsifies the other's cost.

The table today holds `paywall_design_id` (A32), `card_treatment_id` and `card_designs` (A33), and
`pagination_design_id` (A34) — three owners, three nullable text columns plus one jsonb. Splitting it
turns one table with one RLS policy into three, each needing its own policy, its own `rls.sql` row
(AD-26) and its own denormalized `user_id` (AD-6), permanently.

*Suspected:* no concrete driver for the split was found in the tree. **If you find one, stop and say
so** — that would make this decision wrong on new evidence, which is in scope.

Otherwise: record decision 25 as dropped, and note that decision 26's "nothing to build" therefore
stands.

---

## Acceptance

There is no runnable test for prose. Instead:

1. **Every change lands inside an existing AD** in that AD's own voice, or you state why a new AD was
   unavoidable.
2. **Each amendment names the failure it prevents**, concretely, in the spine's existing style.
3. **The three "the intuitive form is wrong" cases (R2-8, R2-6, R2-7) each say so explicitly** — that
   is what stops an implementer doing the natural, broken thing.
4. **Round 1 decisions 6 and 25 are marked as amended / dropped** where the spine references them, so
   no future session reads the superseded form as current.
5. Re-read AD-1, AD-4, AD-14, AD-19, AD-31, AD-32 and AD-34 end to end after editing and confirm each
   still reads as one coherent rule rather than a rule with a patch stapled on.

## Do not

- Do not touch `SCHEMA.sql` or `PRELUDE.sql` — `R2-APPLY-1-SCHEMA.md` owns them.
- Do not restate numbers from `MEASUREMENTS.md`; Round 1 decision 24 says quote it verbatim.
- Do not re-litigate a decision to re-argue it. **Do** stop and say so if you find one wrong on new
  evidence — R2-10, R2-13 and R2-16 are explicitly flagged as suspected rather than confirmed, and
  two of them ask you to verify something first.
- Do not implement R2-2 (the gscan version split) here — `R2-APPLY-3-GSCAN.md` owns it, and it will
  change AD-17, AD-18 and AD-34 as well. Coordinate if both run at once.

## Report

Each decision, the AD it landed in, and the sentence you added. Flag anything you verified that
changed a suspected item to confirmed or refuted it.
