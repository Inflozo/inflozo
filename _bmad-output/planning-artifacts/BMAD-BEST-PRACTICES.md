---
title: How to get the best out of BMAD on Inflozo
status: live
created: 2026-09-04
purpose: what the method's own documentation and its practitioners say gives the best results, checked against what this project already does, and turned into the "before you paste it" briefings that sit above every remaining prompt
sources: read 2026-09-04 — docs.bmad-method.org (Build a Change · Review a Change · Test Completed Work · Walk Through a Change · Autonomous Development Loops · Break Work into Stories and Track It · Set and Maintain Project Context · The Theory of Project Context · Run Multi-Agent Discussions · Finish an Epic) · the installed skills' own text (bmad-build workflow.md, sprint-status-template.yaml, bmad-code-review) · dev.to "BMAD Method + Claude Code: How I Actually Ship Projects" · architectureforgrowth.com "My Experience Using the BMAD Framework on a Personal Project" · BMAD-METHOD discussion #1233
---

# How to get the best out of BMAD on Inflozo

The installed method is BMad v6 (`_bmad/bmm/config.yaml`), the skills-based one. Its documentation
is short and opinionated; this page keeps the ten rules that matter for this project, says where
Inflozo already follows each, and where it changed something today. Every quotation is from the
source named in the front matter; nothing here is asserted from memory.

## The ten rules, and where Inflozo stands

| # | What the method says | Where it comes from | Inflozo |
|---|---|---|---|
| 1 | **One goal per session, in a fresh chat.** "A typical session is one goal: about 500 lines of code added or changed"; "start a fresh session rather than reusing previous chats." A spec targets a single user-facing goal within 900–1600 tokens (roughly the words the AI can hold at once without losing the thread); above that "risks context-rot in implementation agents" — the AI forgetting the start of the plan before it reaches the end. | Build a Change; `bmad-build/workflow.md` | Step 7 makes every phase its own run; the briefings above each prompt in `build-sequence.md` say **new chat every time**. A category story (PRD §8: one story per category) will be larger than one session — see the open question at the end. |
| 2 | **Approve the plan, do not skip it.** The planning checkpoint is the human's moment: "Approve the plan when it describes the right thing to build. Push back if it does not." Human attention is scarce; "that extra time and inference is worth it." | Build a Change | The Create phase stops exactly there, and the owner reads `## In plain English` and `## Owner's manual test` before approving. |
| 3 | **Review in fresh context, ideally with a different model.** "Dev moves story to 'review', then runs code-review (fresh context, different LLM recommended)"; "run several blind-hunter lenses [reviewers told to find what is missing] … one on every LLM you have access to." And: "it is a bad idea to let teammates look at unreviewed LLM-generated code," worse to deploy it. | `sprint-status-template.yaml`; Review a Change | Review is a separate run of `/bmad-code-review` whose layers are independent subagents, plus this project's Real-infra verifier (R-82). Nothing deploys before it. |
| 4 | **Keep repeating review until the findings are low-value; if they keep being substantial, the spec is the problem.** "Stop when the findings are mostly low-value notes about exotic corner cases." | Review a Change | The Fix → Review loop in step 7; a loopback (sending the story back to planning because the plan itself was wrong) is capped at five. |
| 5 | **Stories a developer can build without inventing decisions**, each "carrying acceptance criteria a developer can implement against", one session each; then the readiness gate (step 6b's first half) reads them "as a skeptical senior developer reading a handoff" and answers PASS / CONCERNS / FAIL — ready, ready with reservations, not ready. | Break Work into Stories and Track It | Step 6 then 6b, in that order. The step-6 prompt says which of the skill's instincts (a separate design epic; removing a story's dependence on a later story) this project has already decided against. |
| 6 | **The project-context block — the short rules file every session reads first — is short, verified, and only what code cannot say**: policy, conventions that differ from defaults, observed pitfalls. Refresh after code changes, record a mistake the moment an agent makes one, audit for bloat. "A working rule erases the evidence that it is still needed" — never delete a rule because nothing broke lately. | Set and Maintain Project Context; The Theory of Project Context | `docs/project-context.md`, loaded as persistent facts by every skill in the loop. When a session makes a mistake worth a line, add the line the same day (R-81's commit carries it). |
| 7 | **Right-size the ceremony.** Small, clear changes go straight to `bmad-build`; the full path is for work that "affects multiple systems" or where "clarifying the intent keeps surfacing contradictions". The 3-point story that generated pages of architecture is the canonical failure. | home page; Build a Change; discussion #1233 | A change that belongs to no story is a `Hotfix` commit through `bmad-build` directly, never a story. |
| 8 | **Party mode is for decisions with real trade-offs, not for verified findings**, and "one model voicing five personas tends to make them agree" — use subagent independence when it matters. It "can burn context and credits fast". | Run Multi-Agent Discussions; the personal-project account | The Ghost Build Room stays for §8's owner gates and any genuinely contested ruling; reviews use the review skill. |
| 9 | **Finish an epic with an evidence-based retrospective**; "it reads evidence, it doesn't invent it", the verdict gates the next epic, "the skill proposes; you decide what runs." The practitioner who was stuck for six hours got unstuck by stopping to retrospect. | Finish an Epic; the personal-project account | `Epic <N> - Retro` at E1's close, the E4/E7 gate and E9's close; any time the loop stops converging. |
| 10 | **Run unattended only when the ground is proven.** The autonomous loop halts `blocked` when "unattended execution would be unsafe"; read the spec's status line, its blocking reason and its follow-up-review flag "rather than inferring success from chat output alone". | Autonomous Development Loops | The first stories run attended. `bmad-build-auto` is for later, on stories whose shape the first ones proved, and it halts on any question for the owner (R-83). |

## Three practitioner lessons worth more than the rules

- **The set-up is the work.** One account counts "12 to 16 hours before the first line of code" and calls the method "front-loading thinking rather than accelerating execution". Inflozo has spent that already; the pay-off is that "once you have good stories, execution becomes much more mechanical".
- **Contradicting instructions are the silent killer.** "Conflicting instructions cause Claude Code to pick whichever instruction appeared last." That is why today's rulings were bound in one place the skills load (`docs/project-context.md`) and the skill overrides, and why the documentation gate greps for old wording.
- **Supervise, do not translate.** The owner's job in the loop is three moments: approve the plan, test the deployed screen, rule on a question. Everything else is the session's, and the boards exist so those three moments are the only ones he has to find.

## The one open question the research raises — a decision for you

Section 8 says one category of designs is one story. But a story is meant to fit one AI session,
and a category — every Hero design on one content model and one stylesheet, plus its behaviour —
is bigger than that.

*Example:* Heroes planned as a single job is several thousand words of plan, and the AI loses track
of the start before it reaches the end.

1. **Keep one story per category on the board and for your test, but let the planning session split
   the work into an ordered set of smaller plans under that one story; you test once, at the end, as
   now.** Nothing in section 8 changes. **(RECOMMENDED)**
2. Split each category into several stories in step 6 — more stories for you to test, and section 8
   changes.
3. One big plan per category; accept the risk.

Nothing waits on this: step 6 writes one story per category either way, and it matters only at the
first category story. **To answer:** reply in any chat `Ruled: option 1` (or 2, or 3); the session
records it as the next ruling in `reconcile-designs-decisions.md` §A14 and saves.
