---
title: Apply Round 2 decisions — the PRD and library-rule batch
type: implementation prompt, self-contained
covers: R2-14, R2-15
run: independent of the other three — no file overlap
created: 2026-08-19
---

# Apply the PRD / library-rule batch

Two decisions, both resolved by execution against a real Ghost. Neither is a large edit; both close a
question that has been open on reasoning alone.

Base path: `/home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/`

| File | Role |
|---|---|
| `prd.md` | **never read whole** — 366 KB. FR-Q8 is at line ~366; FR-H6 in §5. Use `sed -n` |
| `research-ghost-binding-contexts.md` | one half of the tiers contradiction |
| `research-ghost-membership-pages.md` | the other half |
| `appendix-h1-string-catalog.md` | V9/V10, FR-Q8's compile-time backstop |
| `sections-inventory.md` | where the library authoring rule lands |
| `../../architecture/.../VERIFY-AT-BUILD.md` | item 14b — the tracked contradiction you are closing |

**This directory is not a git repository.** Back up anything you edit.

## The one rule that governs this project

Cite or execute. Never assert. Both items below are **executed**, and the transcripts are quoted so
you do not have to re-run them — though re-running is cheap and welcome.

---

## R2-14 — FR-Q8: give the validator decision 1's escaping mechanic

### What FR-Q8 says today

> Ghost's translation layer parses each string with an ICU MessageFormat constructor that throws
> **outside** its own error handling, so a single unbalanced brace in one override escapes into the
> page renderer and returns a **whole-page 500 across the entire site**.

That premise is **confirmed**. What FR-Q8 does not say is that there is no valid input either.

### What was executed, 2026-08-19

Run inside the Ghost 6.58.0 container against its own bundled `intl-messageformat` **5.4.3**:

```
  THROW  ICU literal-brace escape   "Save '{' off"            -> Expected "'", ",", or any character…
  THROW  ICU both braces escaped    "Use '{'name'}' here"     -> Expected [ ,\t,\n,\r,,,.,+,=,{,},#]…
  OK     ICU doubled apostrophe     "It''s fine"              -> "It's fine"
  OK     plain apostrophe           "It's fine"               -> "It's fine"
  THROW  unbalanced open            "You have {count posts"   -> Expected "," but "p" found.
  THROW  unbalanced close           "You have count} posts"   -> …
  THROW  handlebars-looking         "{{title}}"               -> Expected "'", ",", or [0-9] but "{" found.
  OK     percent sign               "Save 50% today"          -> "Save 50% today"
  OK     hash outside plural        "Total: # items"          -> "Total: # items"
  OK     nested plural OK           "{n, plural, one {# post} other {# posts}}"  -> "2 posts"
  THROW  nested plural broken       "{n, plural, one {# post other {# posts}}"   -> …

  OK     escaped-entity form        "You have &#123;count&#125; posts"
                                    -> "You have &#123;count&#125; posts"
```

**The finding:** the *standard ICU escape for a literal brace* — `'{'` — throws on the version Ghost
ships. So a user who legitimately wants a brace in a UI label has **no valid input to type**. FR-Q8
says the validator's error should "name the problem in the user's own string", which implies a fixable
input. There is none. The validator can currently only refuse.

**The convergence:** the one form that parses cleanly is `&#123;` / `&#125;` — the exact numeric-entity
mechanic Round 1 decision 1 already mandates for user text in the compiler.

### What to change

1. Amend **FR-Q8** so the validator **transforms** user braces to numeric entities rather than
   refusing them, matching decision 1. One escaping rule then covers both the compiler path and the
   translation path.
2. Verify the round trip end to end before you commit to it: confirm what Ghost emits for a
   translated string containing `&#123;` — whether the helper HTML-escapes it (in which case the user
   sees a literal `&#123;` and the fix is wrong) or emits it raw (the user sees `{` and the fix is
   right). **This was not verified in Round 2.** If it escapes, fall back to refusing braces with a
   clear message and record that as the reason.
3. Update `appendix-h1-string-catalog.md` V9/V10 so the compile-time backstop applies the same
   transform, not a different rule.
4. Record the transcript above as an AD-23 fixture with its capture date, the Ghost image digest and
   the `intl-messageformat` version. Ghost may change that dependency; the fixture is what detects it.

---

## R2-15 — close the tiers contradiction, and add one library rule

### The contradiction you are closing

`VERIFY-AT-BUILD.md` item **14b** tracks a live contradiction between two normative research
companions: `research-ghost-binding-contexts.md` and Ghost's docs say the tiers endpoint filters by
visibility; `research-ghost-membership-pages.md` read the code and believes both wrong.

### What was executed, 2026-08-19 — identical on Ghost 5.130.6 and 6.58.0

One paid tier set to `visibility: none`, one public Free tier:

```
A-NOFILTER      {{#get "tiers" limit="all"}}
  LEN:[2]                                   <-- count INCLUDES the hidden tier
  ROW:[idx=0|Free|vis=public]               <-- only ONE row iterates

B-FILTER-PUBLIC {{#get "tiers" limit="all" filter="visibility:public"}}
  LEN:[1]   ROW:[idx=0|Free|vis=public]     <-- consistent

C-FILTER-NONE   {{#get "tiers" limit="all" filter="visibility:none"}}
  LEN:[1]                                   <-- matches the hidden tier
  (no ROW lines)                            <-- yields ZERO rows

D-TYPE-PAID     {{#get "tiers" limit="all" filter="type:paid"}}
  LEN:[1]   (no ROW lines)                  <-- same
```

**The reconciliation: both companions were half right.** The visibility filter is applied to the
**serialized rows**, after the count is taken. `tiers.length` is the pagination total and does not
respect it. One companion read the row behaviour, the other read the count behaviour, and each
generalised to the whole endpoint.

**FR-H6 is safe.** Its explicit `visibility:public` filter makes count and rows agree.

### What to change

1. **Close `VERIFY-AT-BUILD.md` item 14b** with the transcript, its capture date, and both Ghost
   versions.
2. **Correct each research companion for the half it got wrong** — not by deleting one, but by
   stating the split behaviour in both, since both are normative and both will be read again.
3. **Add a library authoring rule** to `sections-inventory.md`, in the same place other cross-design
   authoring constraints live: *emptiness is tested on a filtered `{{#get}}`, never on
   `tiers.length`.* The concrete failure it prevents: a design using `{{#if tiers.length}}` around a
   pricing section, on a site whose only paid tier is hidden, renders a **heading with no cards**.
4. Sweep the **A34** and membership-related categories in `sections-inventory.md` for designs that
   already imply a count-based emptiness test, and list them. This rule is worth little if the
   designs that need it are not identified.
5. Record both transcripts as AD-23 fixtures.

### One thing to check while you are in there

`GS090-NO-LIMIT-ALL-IN-GET-HELPER` is a **warning on the v6 spec** — `limit="all"` in a `{{#get}}` is
flagged. The probe above used `limit="all"`. If any shipped design emits it, that is a standing
warning against FR-J6's 0/0 target. Confirm whether the library needs `limit="all"` anywhere, and if
so, how the warning is handled.

---

## Acceptance

1. FR-Q8's amended text names the transform, **and** the Ghost round-trip check in step 2 has actually
   been run — with its output quoted. If it refutes the transform, the fallback is recorded with the
   evidence.
2. `VERIFY-AT-BUILD.md` item 14b is closed with a transcript, not a paraphrase.
3. Both research companions state the split behaviour.
4. The library rule exists in `sections-inventory.md` and the affected designs are listed.
5. The `GS090` question is answered either way.

## Do not

- **Never read `prd.md` whole.** Use `sed -n` by section: §5 FRs are lines 170–455, §6 NFRs 456–481,
  §7 architecture 482–700, appendices from 802.
- Do not touch `SCHEMA.sql`, `PRELUDE.sql` or `ARCHITECTURE-SPINE.md` — the other three prompts own
  those.
- Do not pick a winner between the two research companions. Execution showed **both** were partly
  right; flattening that into "X was wrong" loses the actual mechanism and will be re-litigated.
- If you find another pair of normative documents that contradict each other, **stop and say so**
  rather than resolving it yourself.

## Report

The FR-Q8 round-trip result (this is the one genuinely open question in this batch), the closed 14b
entry, the list of designs affected by the tiers rule, and the `GS090` answer.
