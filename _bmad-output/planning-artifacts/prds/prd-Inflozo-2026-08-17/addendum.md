---
title: Inflozo PRD — Addendum
status: normative-companion
role: mechanism of record for FR-D9/FR-D10 (§AD1) and FR-D18 (§AD2), which cite this file normatively; architectural depth for the areas it covers
created: 2026-08-17
updated: 2026-08-19
---

# Addendum

**Normative force.** §AD1 and §AD2 are **normative mechanism**. FR-D9 and FR-D10 cite `addendum.md` §AD1, and FR-D18 cites §AD2, as the mechanism of record — so where those sections state a behaviour, that behaviour is required, and an implementation that contradicts them is wrong even if `prd.md` is silent on the detail. This file is **not normative for scope**: it introduces no requirement, no surface and no user-visible capability that the citing FRs do not already carry, and on any conflict with `prd.md` the PRD wins. §AD3 is a decision record, not a requirement. §AD4 marks the constants that are **defaults with rationale** rather than requirements — the Architect owns those numbers and may tune them.

## AD1. Local-first persistence mechanism (supports FR-D9/FR-D10)

Owner intent: editing speed must never be affected by saving; changes must survive reloads; cloud writes are infrequent.

Sketch for the architect:

- **Op-log in IndexedDB** *(default — §AD4)*. Every user action appends a small operation record (section id, op type, payload, transaction id) to an IndexedDB journal, written asynchronously off the interaction path. localStorage is not suitable (synchronous, size-limited); IndexedDB writes are ~instant and non-blocking. The **requirement** is: local writes never block the interaction path, and the journal survives a reload. The storage engine and record shape are the Architect's.
- **Undo = the journal tail.** The persisted op-log doubles as the undo/redo stack, which is what makes undo survive reloads for free — one mechanism, two features. Undo of a section delete replays its inverse op, restoring the instance with all control/content values.
- **Ops vs edits — one gesture, one undo step.** Ops are the *replay* unit; **edits** are the *user-perceived* unit and the only one that ever reaches a screen. Every user gesture opens one **transaction**; all ops it emits carry that transaction id; one transaction = one undo step = **one edit**. A Variant Shuffle rewrites every prop of a section — several ops, **one** edit. Likewise a Style Pack change, a drag-reorder, a paste, and a section delete. FR-D9's 100-step history counts **edits**, not ops. `unsyncedEdits = count(distinct transaction ids in the journal not represented in the last synced snapshot)`. Nothing in the product ever displays an op count (§AD2).
- **Cloud sync = snapshot upsert.** Every few minutes (default 3, user-toggleable), on tab close (`visibilitychange`/`sendBeacon`), on lock release, and before deploy/export, the current doc jsonb snapshot upserts to `project_templates` (not the op-log — the server stores state, not history). Retry queue with backoff when offline.
- **Autosave OFF** means: periodic timer disabled; local journal still always on; ⌘S and the event-driven flushes (close, lock release, deploy/export) still fire. Data can live locally between flushes but never crosses a deploy/export/lock boundary while unsynced (deploy/export additionally require holding the edit lock — FR-D18).
- **Risk accepted:** work that exists only locally is lost if the browser profile is wiped before a flush. Mitigated by event-driven flushes; surfaced honestly by the "Saved locally / Synced" indicator split.

### AD1.1 Journal invalidation on a *superseding* hydrate

The journal is cleared only when the hydrate **supersedes** the local doc — not on every hydrate, and not on every lock acquisition. Replaying an inverse op against a doc it was not derived from is the corruption FR-D9 forbids; a hydrate that returns the *same lineage* the local doc already sits on carries no such risk, and clearing there would kill undo-after-reload, which FR-D9 promises two sentences earlier.

**The doc carries a `base_revision`** — the revision of the cloud snapshot it was last hydrated from or last synced to. Every hydrate resolves against exactly one of three outcomes:

| Trigger | Cloud revision vs local `base_revision` | Local doc | Journal |
|---|---|---|---|
| Lock acquisition (**includes an ordinary reload** — same device, no other editor) | **equal** | **Kept.** Same lineage; the local doc is the cloud doc plus this device's unsynced edits, so replacing it would destroy work no one else has. Its unsynced edits flush on the next sync. | **Kept.** Undo survives the reload. |
| Lock acquisition | **differs** | **Replaced** by the cloud snapshot — another session wrote since this device last synced. | **Cleared.** |
| **Takeover** (this device lost the lock, in either direction) | any | **Replaced.** | **Cleared** — unconditionally. A lock that changed hands is a supersession event in its own right; the taker was already told these edits would be lost (§AD2), so they must be lost. |

A device detects the takeover case from the lock record: the lock has changed holder since this device last held it. That test is independent of the revision comparison, which is why a takeover whose new holder has not yet written anything still clears the journal — the revisions would otherwise match.

Orphaned unsynced ops from a lost takeover are never merged, replayed, or recovered — no merge path exists in v1.

## AD2. Edit-lock protocol (supports FR-D18)

- **Lock record** per project (holder session id, lock generation, heartbeat timestamp) in Postgres; heartbeat every ~15 s *(default — §AD4)*.
- **Signaling** via Supabase Realtime channel per project: nudge ("release requested"), release, takeover events. BroadcastChannel additionally covers same-browser tabs at zero cost.
- **Nudge flow:** requester (read-only tab) sends nudge → holder sees prompt → accept triggers flush-to-cloud → lock released → holder flips to read-only, requester flips to editable and hydrates from the fresh server snapshot.
- **The heartbeat field is `unsynced_edits`** (snake_case as the stored column and wire field; `unsyncedEdits` in §AD1 is the same value in its JS form). **Edits is canonical**, everywhere — the field name, the heartbeat payload, FR-D18's prose, and every user-visible string. It is the count defined in §AD1: distinct unsynced transaction ids, one per user gesture. A shuffle is several ops but **one edit**. The user-visible string promises edits ("That session had 14 unsaved edits"), so reporting ops would make the number disagree with what the user did, in the one message whose entire job is telling them what they lost. **No op count is ever surfaced, stored in the heartbeat, or logged for display.**
- **Stale lock / unanswered nudge:** heartbeats carry `unsynced_edits`, so other clients can display "X unsaved edits there". Nudge unanswered past ~30 s, or heartbeat older than ~60 s *(defaults — §AD4)* ⇒ requester is notified and may take over from the last synced snapshot (refresh + hydrate). A revived former holder finds the lock generation advanced past its own: it flips read-only and is told its unsynced journal was not included.
- **Takeover loss accounting:** the takeover prompt and the revived-holder message both state the loss concretely from the heartbeat's `unsynced_edits` ("That session had 14 unsaved edits; they were not included"). The two messages quote the same number from the same field, so they can never disagree. Consistent with §AD1: a takeover is an unconditional superseding hydrate on the losing device, so on its next hydrate its doc is replaced and its journal is cleared regardless of how the revisions compare — the edits the prompt said would be lost **are** lost, by design, and are not recoverable. (This is the *only* path on which a device loses its journal without another session having written; ordinary reloads keep it — §AD1.)

## AD3. Rejected alternatives (for the record)

- Per-change cloud autosave (2 s debounce) — rejected by owner as the *default* mechanism: too chatty, perceived risk to editor speed. Replaced by local-first + periodic sync. The design survives solely as FR-D10's no-local-storage fallback, which is exempt from NFR-1's latency clause.
- Live-site theme preview surfacing — rejected: would require a working Ghost installation solely for previews.
- Public deploy-quality badges and a free theme-checkup tool — rejected: a new tool's badge carries no authority; gscan already exists free.
- Brand extraction from arbitrary URLs — rejected: manual brand selection is a few clicks.
- Per-project library-version pinning — rejected in favor of always-latest compiles: simplest to implement and operate.

## AD4. Defaults, not requirements

Everything in this table is a **starting point with a rationale**, owned by the Architect. Changing a value here is a tuning decision, not a spec change, and needs no PRD amendment. Everything *not* in this table — the behaviours in §AD1 and §AD2 — is required.

| Constant / choice | Default | Rationale | Change it when |
|---|---|---|---|
| Local store engine (§AD1) | IndexedDB | Async and non-blocking; localStorage is synchronous and size-capped, which would violate NFR-1 | A better non-blocking store exists, or the doc outgrows IndexedDB's practical quota |
| Journal record shape (§AD1) | op record = section id, op type, payload, transaction id | Smallest record that supports both inverse-replay and the transaction grouping edits are counted from | The undo model changes; the transaction id is load-bearing for the edit count and must survive any reshape |
| Journal retention (§AD1) | last 100 **edits** (FR-D9) | Matches FR-D9's stated history depth | FR-D9's depth changes — this one tracks the PRD, not the Architect |
| Heartbeat interval (§AD2) | ~15 s | Cheap enough to run always-on; ~4 beats inside the stale window, so one dropped beat never orphans a live session | Realtime cost or connection churn says otherwise |
| Unanswered-nudge threshold (§AD2) | ~30 s | Long enough for a human to notice a prompt, short enough not to strand the requester | Usability testing shows people need longer |
| Stale-heartbeat threshold (§AD2) | ~60 s | 4× the heartbeat interval — tolerates transient network loss without declaring a live editor dead | The heartbeat interval moves (keep the ~4× ratio) |

**Load-bearing by contrast** — do not tune these: the `base_revision` comparison and the lock-generation test that decide journal clearing (§AD1); `unsynced_edits` as the sole surfaced count (§AD2); the one-transaction-per-gesture rule that defines an edit (§AD1).
