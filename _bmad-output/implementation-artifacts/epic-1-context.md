# Epic 1 Context: Foundations & Design System

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Stand up everything every later epic lands inside: the monorepo with its pure/shell package split, CI/CD to production Vercel on both production domains, the whole schema with row-level security proven by a gate, tokens and components lifted from the Claude Design export, magic-link sign-in over Resend, and a dashboard where a signed-in user can create, rename, duplicate and delete projects. Exit: sign in on production; the dashboard exactly as cut below; RLS verified on every table the schema story creates.

## Stories

- Story 1.1: The repository, the package split and CI/CD to production
- Story 1.2: The whole data model and its row-level security
- Story 1.3: Design tokens and the app component kit, taken from the export
- Story 1.4: Sign in with a magic link
- Story 1.5: The app shell and the dashboard skeleton

## Requirements & Constraints

- Sign-in is magic link only: Supabase Auth email OTP link on a branded template, routed through Resend SMTP. No password field exists anywhere. Sessions persist 30 days rolling. This epic owns the magic-link and email-change-verification emails, two of the product's six.
- Dashboard cut line. IN: the authenticated shell (top bar, account menu, navigation); project cards with name, updated-at and a static placeholder derived from the project's Style Pack tokens (never a captured thumbnail); create blank, rename, duplicate, delete behind type-the-name confirm; the plan cap at creation (Free 1 project, Pro 25) with a contextual upgrade prompt; one linked site per project, and an unlinked project renders the bundled sample dataset. OUT, for later epics: linked-site badges, deploy-status chips, the other three creation paths, the connected-sites strip, asset quota meter, changelog popover, notifications bell.
- The schema story is whole-model: every table the functional requirements imply, explicitly including `notifications`, `edit_locks`, `entitlements`, `deploy_jobs`, `asset_usages`, `site_snapshots`, `project_site_bindings`, theme-settings definitions, translation overrides, the export record, routes state on `sites` and the per-deploy variant manifest. A `profiles` row and an `entitlements` row are created at signup.
- Security floor: RLS on every table keyed to `auth.uid()`; secrets never in `NEXT_PUBLIC_*`; CSP with no `'unsafe-eval'` and `frame-ancestors 'self'`, `connect-src` composed per session — a nonce policy on the app host, a static one on marketing.
- Zero axe-core violations at WCAG 2.1 AA on every app surface; one focus ring everywhere; reduced motion honoured. No analytics or telemetry in the app; Sentry on app and server; logs carry no user content or credentials.

## Technical Decisions

- **Hosting shape.** Next.js 16 App Router on Vercel Pro. **One deployment, host-routed in `proxy.ts`** (Next 16's rename of `middleware.ts`, Node runtime), serves `inflozo.com` (marketing, SSG, `app/(marketing)/`) and `app.inflozo.com` (the app, `app/(app)/`). Supabase supplies Postgres 17, Auth, Storage and Vault; Resend sends every email; Dodo handles billing behind a swappable adapter in `server/billing/`.
- **Production domains, status today.** The owner attached them to the production Vercel project on 2026-09-04 and deleted the predecessor stack; they **return 404 until Story 1.1 deploys** — expected, not a fault. The apex is canonical and `www.inflozo.com` 308-redirects to it. `admin.inflozo.com` was retired and is out of scope. Pre-launch there is one stack on the production domains; at go-live it becomes the permanent Test environment.
- **Package split (pnpm workspaces, no Turborepo).** `packages/library` (data only, depends on nothing) → pure core `packages/section-runtime`, `packages/ghost-shim`, `packages/theme-compiler` (depend on library and each other; import nothing from Next.js, Supabase, Node or `apps/web`) → shell `apps/web`, the only deployable. Arrows point one way; a lint rule fails the build when a core package imports the shell. Packages are `@inflozo/*`; the app is unpublished. Tailwind styles `apps/web` only, with content globs excluding `packages/library`.
- **Pinned versions are the installed versions** (with one exception the spine's Stack table now names: the root workspace also holds `typescript@6.0.3` for `typescript-eslint`, which refuses to load against 7 — it compiles and ships nothing): Node 24, TypeScript 7.0.2 strict, Next 16.3.1, React and React DOM 19.2.8 pinned together, pnpm 11.22.0, Tailwind 4, supabase-js 2.112.3, zod 4.4.3, `gscan` 6.4.2, `handlebars` 4.7.9 dev-only and never shipped, `resend` 6.20.0, `dodopayments` 2.47.0.
- **CI/CD.** `pnpm build` and the test suite green in CI; push to `main` deploys to production Vercel. Core packages get pure offline unit tests; the shell gets Playwright against the running stack. The RLS harness is a CI gate keyed on its exit code.
- **Schema and RLS.** `supabase/migrations` is the only way the schema changes. Every RLS table denormalises `user_id`, every policy is `user_id = (select auth.uid())`, every project-child table also carries a restrictive `owns_project(project_id)` policy, and every RLS table has an index whose first key is `user_id`. Server-only tables (`site_credentials`, `billing_events`) live in a `private` schema PostgREST never exposes, RLS on with zero policies. Server-asserted tables (`deploys`, `entitlements`, `subscriptions`, `site_snapshots` and their kin) are select-only to `authenticated` on both INSERT and UPDATE with full grants to `service_role` — asserted as a class derived from the catalogue, never a hardcoded list. Mixed tables use column-level GRANT plus a guard trigger (revoke the table grant, grant the columns back); immutable columns are frozen by `BEFORE UPDATE` triggers that hold against the service role. `PRELUDE.sql` → `SCHEMA.sql` → `RLS-TEST.sql` on PostgreSQL 17; every assertion aborts with `raise exception`, never a notice. A migration adding a table ships its policy and its harness row in the same commit.
- **Conventions.** snake_case plural tables, `{table}_id` keys, Postgres enums, uuid v4 defaulted server-side, `timestamptz` UTC; one zod schema per boundary; error envelope `{ code, message, detail?, action? }`; mutation is client → server action → service-role write. Feature flags are rows in `feature_flags`, never env vars.
- **`notifications` is created here** so later epics write to it before any reader exists; `data` and `link` carry a per-`kind` shape validated on write. **Plan state** comes from one server-side `resolveEntitlement(userId)` with the plan table expressed once as data; the dashboard cap check calls it.

## UX & Interaction Patterns

- **The design export is the design authority.** Never edit `_bmad-output/planning-artifacts/design/claude-design-export/`. Tokens, type scale, spacing and colour roles come from `Calibration Set.dc.html`; every control, panel, badge and state from `Editor Sidebar Kit.dc.html`; the collapse ladder from `R Responsive System.dc.html`. `DESIGN.md` transcribes the token names; the export wins wherever they disagree. A surface with no frame is extrapolated from the nearest one. Every story with a screen names its frame and carries a "matches the frame" criterion.
- Frames: Sign In is `S1 Sign In.dc.html` S1a, S1b, S1c (S1c draws the page behind the OS passkey sheet and nothing of the sheet). Dashboard is `S3 Dashboard.dc.html` S3a, S3b empty, S3c Free, S3d account menu.
- Magic Link Sent echoes the typed address, states 15-minute validity, counts down to resend without blocking anything, and always offers "Use a different email".
- Every empty state is designed: the empty dashboard is "Every great site starts somewhere…" plus New project; loading is skeletons, never a spinner. Typed confirm only for project and account delete, with no wit on those surfaces.
- A greyed control shows its reason as one sentence in the helper-caption slot, never a tooltip; a control that could never act here is absent and the panel says why (`P0-0 Greyed Control Pattern.dc.html`).
- Widths 1440 / 834 / 390; Sign In and Dashboard fully usable at 390. Read font sizes off the frame, never round to a scale step. One coral action per surface; the Pro badge is ✦ plus the word "Pro"; plan limits are shown, never implied; library size is "hundreds of gorgeous sections", never a number.

## Cross-Story Dependencies

- 1.1 first: workspace, CI and the live domains. 1.2 before 1.4 and 1.5 (`profiles`, `entitlements`, `projects`, `notifications`). 1.3 before 1.4 and 1.5 — both screens are built from the kit; 1.3 ships an internal component gallery route in light and dark, not a product screen. 1.4 before 1.5.
- Owner tests on the production domains: 1.1 (the domains answer), 1.4 and 1.5; none for 1.2 and 1.3. Review and test phases hit the real Supabase, Resend and Vercel — keys in `tools/probe/.env`, read into a command's environment and never printed.
- Process rulings binding every story: commit and push to `main` after every phase with the one-line message `Story 1.<n> - <Phase> - <one line about the story>`; `python3 tools/doc-audit.py --check` before every commit, never pushed red; every UI story carries `## Owner's manual test` with URLs on the production domains, never a `vercel.app` preview; owner questions go under `## Questions for the owner` in plain English with an example, numbered options and a (RECOMMENDED) mark; BMAD stays on 6.11.0.
