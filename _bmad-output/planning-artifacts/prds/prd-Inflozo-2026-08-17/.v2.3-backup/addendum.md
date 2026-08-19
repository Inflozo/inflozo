---
title: Inflozo PRD — Addendum
purpose: Depth that belongs downstream (architecture / solution design), captured during PRD refinement. Not normative for scope; normative for intent when the architect designs these areas.
---

# Addendum

## AD1. Local-first persistence mechanism (supports FR-D9/FR-D10)

Owner intent: editing speed must never be affected by saving; changes must survive reloads; cloud writes are infrequent.

Sketch for the architect:

- **Op-log in IndexedDB.** Every user action appends a small operation record (section id, op type, payload) to an IndexedDB journal, written asynchronously off the interaction path. localStorage is not suitable (synchronous, size-limited); IndexedDB writes are ~instant and non-blocking.
- **Undo = the journal tail.** The persisted op-log doubles as the undo/redo stack (last 100 ops), which is what makes undo survive reloads for free — one mechanism, two features. Undo of a section delete replays its inverse op, restoring the instance with all control/content values.
- **Cloud sync = snapshot upsert.** Every few minutes (default 3, user-toggleable), on tab close (`visibilitychange`/`sendBeacon`), on lock release, and before deploy/export, the current doc jsonb snapshot upserts to `project_templates` (not the op-log — the server stores state, not history). Retry queue with backoff when offline.
- **Autosave OFF** means: periodic timer disabled; local journal still always on; ⌘S and the event-driven flushes (close, lock release, deploy/export) still fire. Data can live locally between flushes but never crosses a deploy/export/lock boundary unsynced (deploy/export additionally require holding the edit lock — FR-D18).
- **Risk accepted:** work that exists only locally is lost if the browser profile is wiped before a flush. Mitigated by event-driven flushes; surfaced honestly by the "Saved locally / Synced" indicator split.
- **Journal invalidation on hydrate.** Whenever the editor hydrates from the authoritative cloud snapshot (lock acquisition or takeover — FR-D10/FR-D18), the local op-log/undo journal is cleared before editing resumes: its ops reference a superseded doc, and replaying an inverse op against the wrong doc is exactly the corruption FR-D9 forbids. Orphaned unsynced ops from a lost takeover are not merged, replayed, or recovered — no merge path exists in v1.

## AD2. Edit-lock protocol (supports FR-D18)

- **Lock record** per project (holder session id, heartbeat timestamp) in Postgres; heartbeat every ~15 s.
- **Signaling** via Supabase Realtime channel per project: nudge ("release requested"), release, takeover events. BroadcastChannel additionally covers same-browser tabs at zero cost.
- **Nudge flow:** requester (read-only tab) sends nudge → holder sees prompt → accept triggers flush-to-cloud → lock released → holder flips to read-only, requester flips to editable and hydrates from the fresh server snapshot.
- **Stale lock / unanswered nudge:** heartbeats carry the holder's unsynced-op count, so other clients can display "X unsaved edits there". Nudge unanswered past ~30 s, or heartbeat older than ~60 s ⇒ requester is notified and may take over from the last synced snapshot (refresh + hydrate). A revived former holder finds the lock gone: it flips read-only and is told its unsynced journal was not included.
- **Takeover loss accounting:** the takeover prompt and the revived-holder message state the loss concretely from the heartbeat's unsynced-op count ("That session had 14 unsaved edits; they were not included"). On the former holder's next hydrate its journal is cleared (AD1) — the lost ops are unrecoverable by design.

## AD3. Rejected alternatives (for the record)

- Per-change cloud autosave (2 s debounce) — rejected by owner as the *default* mechanism: too chatty, perceived risk to editor speed. Replaced by local-first + periodic sync. The design survives solely as FR-D10's no-local-storage fallback, which is exempt from NFR-1's latency clause.
- Live-site theme preview surfacing — rejected: would require a working Ghost installation solely for previews.
- Public deploy-quality badges and a free theme-checkup tool — rejected: a new tool's badge carries no authority; gscan already exists free.
- Brand extraction from arbitrary URLs — rejected: manual brand selection is a few clicks.
- Per-project library-version pinning — rejected in favor of always-latest compiles: simplest to implement and operate.
