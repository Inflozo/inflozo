---
title: Inflozo — the pre-deploy backup gate
status: specified 2026-08-21 by owner decision; Ghost paths cited, NOT yet executed against T1/T3
owner: E3 (the connect/deploy surface) · E7 (the block) · E15 (verify the paths at the launch gate)
supersedes: the open half of register item 38 — Inflozo does not back up customer data
---

# The backup gate

> **THE MENU PATHS BELOW ARE GHOST 5's, AND GHOST 6 DOES NOT HAVE THEM** *(executed 2026-08-31 against
> both servers — `MEASUREMENTS.md` §33, register 41)*. Read from each server's built admin bundle:
> Ghost 5.130.6 carries `Advanced`, `Labs`, `Import/Export` and `Export`. **Ghost 6.58.0 carries none
> of them** — there is no `settings/advanced` route and no `settings/labs` route; Ghost 6 has
> `settings/migration`, and its export UI sits behind a lab flag (`selfServeArchives`) whose own
> description says it *"replaces the individual export buttons with a single Export data flow"*.
>
> **So the gate must not hard-code a path for either major.** The Ghost 6 surface is flag-dependent,
> which means a path baked in today is wrong for some customers immediately — and it would drift again
> at the next release, which is how this item arose. **E3 builds the gate to link to Ghost's own help
> for the connected site's version, and to describe what the customer is looking for rather than the
> clicks to reach it.** The paths below are kept as the Ghost 5 reference and as the record of what was
> documented on 2026-08-21; they are not the specification for the gate's copy.
>
> The one fact that must survive whatever the menu looks like: **Ghost's JSON content export does not
> include images**, and Ghost(Pro) customers cannot bulk-download theirs at all.

**Owner decision, 2026-08-21: Inflozo is not a backup tool and does not undertake to be one.**
It does not copy, keep or restore the customer's Ghost data. Instead, before Inflozo changes anything
on a connected site, the customer is **blocked** until they confirm they hold their own backup, and
is shown exactly how to take one.

## Where it fires, and why there

**At first deploy to a site, not at connect.** Connecting changes nothing on the customer's site —
it only reads. The first deploy is the first moment anything is overwritten, so it is the first
moment consent is meaningful. Putting it at connect would also cost G1's under-ten-minutes
onboarding target for no safety gained.

**Once per site, not once per deploy.** It is re-shown if the site is disconnected and reconnected.

## The honest part, and it is stated first

The gate opens by saying what Inflozo actually changes, because a warning that overstates gets
clicked through, and a gate everybody clicks through is not a gate.

**Inflozo writes exactly two things to a Ghost site** (AD-10's P8 allowlist): the **theme**, and
**`routes.yaml`**. It never writes posts, pages, members, tags, settings or redirects.

The recommendation is still a *full* backup, and the reason is given rather than implied: a theme
change is reversible only if you can put the old theme back, and the cheapest insurance against
every other surprise is the backup you already have.

## What the customer is asked to confirm

Each item is its own checkbox, because a single "I have a backup" invites a single reflex. The two
Inflozo actually touches are marked; the rest are recommended.

### Self-hosted — one command covers everything

> **`ghost backup`**
>
> Run it on the server. It produces one archive containing the content JSON, a full member CSV, **all
> installed themes including the active one**, images, files and media, and copies of `routes.yaml`
> and `redirects.yaml`/`redirects.json`.

☐ **I have run `ghost backup` and saved the archive somewhere off the server.**

Ticking this checks all the boxes below, because the archive genuinely contains all of it. The
individual list stays visible so the customer can see what they now hold.

### Every item, individually

| | Item | Where in Ghost Admin | Format | ⚠️ |
|---|---|---|---|---|
| ☐ | **Theme** — *Inflozo replaces this* | Settings → Design & branding → Change theme → Installed → Options → **Download** | `.zip` | **The one thing that makes rollback possible.** |
| ☐ | **`routes.yaml`** — *Inflozo may overwrite this* | Settings → Advanced → **Labs** | `.yaml` | Download before upload; Inflozo's routes manager replaces the whole file. |
| ☐ | **Content** — posts, pages, tags, settings, staff | Settings → Advanced → Import/Export → **Export** | `.json` | **Does NOT include your images.** See the images row. |
| ☐ | **Members** | Members → settings icon → **Export all members** | `.csv` | Includes `stripe_customer_id`, so it round-trips to another Ghost. |
| ☐ | **`redirects.yaml`** | Settings → Advanced → Labs → **Beta features** tab | `.yaml` | Inflozo never touches this. Listed because losing redirects breaks existing links. |
| ☐ | **Images, files and media** | **No Ghost Admin export exists.** Self-hosted: copy `content/images/`, `content/files/`, `content/media/` from the server. | folders | **The gap most people miss.** The content JSON does not carry them. |
| ☐ | **Database** | Self-hosted, via shell or `ghost backup`. | — | Ghost's own docs: for disaster recovery or exact replication, back up the database and content folder directly — the JSON export is for moving content, not for restoring a site. |

### Ghost(Pro) — say the awkward part plainly

Ghost(Pro) customers have **no shell access**, so:

- Theme, content, members, routes and redirects all download normally from Ghost Admin, as above.
- **Images and media cannot be bulk-downloaded.** There is no admin export for them and no server to
  copy them from. Ghost's documentation does not offer a route; it says to contact your host's
  support if you cannot get shell access.
- Ghost(Pro) takes its own platform backups. That is a Ghost service, not an Inflozo one, and
  the customer should confirm with Ghost what it covers and how to request a restore.

**This is not something Inflozo can fix, and the gate should not pretend otherwise.** It should say
it, and let the customer decide.

### Then, and only then

☐ **I confirm I have a complete backup of my site and understand Inflozo will replace my theme.**

Disabled until every item above is either ticked individually or covered by the `ghost backup`
checkbox. The deploy button stays disabled until this is ticked.

## What this is, and what it is not

**It is a consent gate, not a technical control.** It moves responsibility; it does not reduce risk.
A customer who ticks the box without having backed up still loses their theme — they simply had a
fair chance not to. That is a deliberate trade and it is the industry norm, but it is recorded here
as a decision rather than left to be discovered as a side effect.

**What it buys:** Inflozo holds none of the customer's Ghost data, so there is nothing to lose, leak,
or be asked to produce. Register item 38's storage-backup question is closed for customer data.

**What it does not cover**, and these stay Inflozo's problem:

- **Compiled themes kept for rollback** — Inflozo's own build output, which the customer never sees
  and could not back up. Kept, versioned, and bounded — see below.
- **Images uploaded into Inflozo before they are deployed.** Once deployed they ship *inside* the
  theme package and therefore exist on the customer's own Ghost; before that they exist only in
  Inflozo. The exposure is minutes of work, and it is accepted rather than solved.

## Rollback retention — owner decision, 2026-08-21

**At most 10 stored versions per project for Pro, 3 for Free. Pinned versions count against that
total.** Stated in the UI rather than implied, because a history list that silently drops its oldest
entry reads as complete when it is not.

- A version can be **pinned** to survive pruning — "keep this one, it was good".
- **At most N−1 may be pinned** (9 of 10 on Pro, 2 of 3 on Free). *This part was not specified and
  is an engineering call, flagged for the owner:* without it, a customer who pins every slot has
  nowhere to store their next deploy, and the only alternatives are refusing the deploy or silently
  unpinning something they asked to keep. Reserving one slot for the newest build means deploying
  can never be blocked by pinning.
- **The deploy history must never show a version it cannot restore.** A dead Restore button is worse
  than a shorter list.
- These artifacts are **not regenerable** (AD-29, decision D10): rebuilding an old design against
  today's section library produces a *different* theme, which is why rollback replays a stored file
  rather than recompiling. So the retention limit is the true bound on how far back a customer can
  go, and the UI says so.

## ⚠️ Verify before this ships

**The Ghost Admin menu paths above are cited from Ghost's documentation, not executed.** Under this
project's standing rule that is a hypothesis, not a fact — and there is a specific reason to doubt
it: **the docs describe current Ghost, and Inflozo supports 5.x as well as 6.x.** Labs moved under
Settings → Advanced at some point in that range, so the paths may differ between the two supported
majors.

**E15 must confirm every path above against both T1 (Ghost 6.58.0) and T3 (Ghost 5.130.6) before the
gate ships**, and the gate must either show version-appropriate paths or link to Ghost's own help
pages rather than hard-coding a menu path that will drift.

### Sources
- Exporting content and data — <https://ghost.org/help/exports/>
- Ghost-CLI, `ghost backup` — <https://docs.ghost.org/ghost-cli/>
- Manual backups, content directories — <https://docs.ghost.org/faq/manual-backup/>
- Redirects — <https://ghost.org/help/redirects/>
