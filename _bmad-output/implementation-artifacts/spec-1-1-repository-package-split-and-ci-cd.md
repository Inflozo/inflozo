---
title: 'Story 1.1 — The repository, the package split and CI/CD to production'
type: 'feature'
created: '2026-09-04'
status: 'in-review'
review_loop_iteration: 1
baseline_commit: '686749c3d822548125d383d06d6dbe8273794877'
owner_test: pending
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md', '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md']
---

## In plain English

After this story, typing inflozo.com or app.inflozo.com into a browser shows an Inflozo page instead of the "404" error both show today, and every time code is saved to the main branch the live site rebuilds itself within a few minutes. Behind the scenes the code now has its permanent shape: four building blocks plus the website, with automatic checks that fail loudly if anyone wires them together the wrong way. There is nothing to look at yet beyond one line of plain text on each address; the real screens arrive in the next stories.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Nothing exists yet: no repository structure, no build, no deployment, and the production domains return 404. Every later story needs the mandated package shape and a push-to-main deploy to land inside.

**Approach:** Create the pnpm workspace (four `@inflozo/*` packages plus `apps/web`) at the spine's pinned versions, enforce the one-way dependency arrows with a lint rule that fails the build, and put a minimal host-routed Next app live on `inflozo.com` and `app.inflozo.com` from one Vercel deployment built on every push to `main`.

## Boundaries & Constraints

**Always:**
- The Structural Seed's paths exactly: `apps/web`, `packages/library`, `packages/section-runtime`, `packages/ghost-shim`, `packages/theme-compiler`. Packages are `@inflozo/<dir>`; the app is `@inflozo/web`, private, never published.
- Arrows one way: library → core (section-runtime, ghost-shim, theme-compiler — may depend on library and on each other) → `apps/web`. The lint rule fails `pnpm check`, and therefore the Vercel build, when a core package imports `next`, `next/*`, `@supabase/*`, any Node built-in (bare or `node:`), `@inflozo/web` or a path into `apps/`, or touches `process`, `fetch`, `window`, `document`, `Date.now`, `Math.random`, `Intl`, `localeCompare`, `toLocaleUpperCase`/`toLocaleLowerCase`, or `.toString()`/`.getHours()` on a Date.
- Installed versions equal the spine's Stack table, pinned exactly (no carets): Node 24.x, TypeScript 7.0.2, Next 16.3.1, React and React DOM 19.2.8 (explicit, moved together), pnpm 11.22.0 via `packageManager`, Tailwind 4.x, `gscan` 6.4.2 and `handlebars` 4.7.9 as devDependencies of `packages/theme-compiler` only. What this story does not use (zod, supabase-js, jsdom, resend, dodopayments) is not installed; each later story adds its own at the table's pin.
- Tailwind styles `apps/web` only; `packages/library` is never scanned (`@source not`).
- Host routing lives in `apps/web/proxy.ts` (Next 16's name; never `middleware.ts`): the app host rewrites to the internal `/app` prefix, the apex serves marketing, and `www` stays the 308 Vercel already holds.
- Commit and push after every phase as `Story 1.1 - <Phase> - <one line>`; the gate runs before every commit.

**Ask First:**
- The two questions under `## Questions for the owner` decide how deploys happen and where secrets live. Never run `vercel --prod` and never write a secret anywhere until they are ruled; the tasks assume the recommended answers and change if he rules otherwise.
- Linking `Inflozo/inflozo` to the Vercel project needs the Vercel GitHub App installed on the `Inflozo` GitHub organisation with this repo selected. If the link call fails for that reason, stop and ask the owner in R-83 shape to grant it (one click in the Vercel dashboard); do not work around it.
- Any Vercel project change beyond: the Git link, `rootDirectory` `apps/web`, `framework` `nextjs`, `ENABLE_EXPERIMENTAL_COREPACK=1`.

**Never:**
- No screens, tokens, components, sign-in, schema or CSP — those are stories 1.2 to 1.5 (CSP arrives with the first page that needs it; `tools/probe/csp/proxy.ts` is its executed shape). The two pages carry one line of plain unstyled text each so nothing here can be mistaken for design (R-74).
- No Turborepo, no build cache, no test framework (Node's built-in runner), no ESLint preset beyond the boundary rules, no `src/` folder in `apps/web`.
- Never touch the `inflozo-probe.vercel.app` alias, the `www` redirect, DNS, the project's existing env vars, or the old probe deployments. Never a `vercel.app` URL in the owner's test. Never print a key.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Marketing host | `GET https://inflozo.com/` | 200 from `app/(marketing)/page.tsx` — the text "Inflozo" | N/A |
| App host | `GET https://app.inflozo.com/` | 200 from `app/(app)/app/page.tsx` — "Inflozo · app"; URL unchanged (rewrite, not redirect) | N/A |
| www | `GET https://www.inflozo.com/` | 308 → `https://inflozo.com/` (Vercel's existing rule, untouched) | N/A |
| App path on the apex | `GET https://inflozo.com/app/x` | 308 → `https://app.inflozo.com/x` | N/A |
| Local dev | `localhost:3000/` and `localhost:3000/app` | marketing and app, no host tricks | N/A |
| Boundary violation | a core package file imports `next/server` or reads `process.env` | `pnpm check` exits non-zero; the Vercel build fails; nothing deploys | ESLint names the rule and the file |
| Wrong Node | `node` 22 in the shell | `pnpm install` refuses | `engine-strict` message names 24.x |

</frozen-after-approval>

## Code Map

Greenfield — nothing under `apps/` or `packages/` exists. Read-only evidence to build from:

- `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md` -- §Stack (every pin), §Structural Seed (the tree), §Consistency Conventions "Package naming" and "Styling", AD-1's rule (the full ban list). The contract.
- `tools/probe/csp/proxy.ts` -- the executed Next 16 `proxy.ts` host-routing pattern (MEASUREMENTS.md §18, verified on Vercel). Copy its shape, not its CSP.
- `tools/probe/csp/package.json` -- Next 16.3.1 + React 19.2.8 + TypeScript 7.0.2 proven to build together.
- `tools/stress/test-ad36.js` -- the project's zero-framework test style (plain asserts); `node --test` continues it.
- `tools/doc-audit.py` `BASES` -- the gate walks only four documentation roots, so `apps/`, `packages/` and `.github/` need no catalogue row. `.gitignore` already covers `.env*` and `node_modules/`.
- `tools/probe/.env` (never printed) -- `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`. Live state read 2026-09-04 by API: project `inflozo`, id `prj_ptauaY2o7FQckRDk31b7hdl06FSb`, `nodeVersion` 24.x, **no Git link**, `rootDirectory` null, `framework` null; domains `inflozo.com` and `app.inflozo.com` verified, `www.inflozo.com` 308 → apex, `inflozo-probe.vercel.app` alias still attached; env vars `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `DODO_WEBHOOK_SECRET` already present; five old `inflozo-probe` deployments, all CLI-uploaded. `curl` the same day: apex 404, app 404, www 308.
- `git remote` -- `git@github.com:Inflozo/inflozo.git`; `main` is the production branch. `gh` is not installed.
- Local toolchain -- Node 24.18.1 exists under nvm (`nvm use 24`; the shell defaults to 22); `corepack` 0.34.6 supplies pnpm 11.22.0 from `packageManager`. Registry check 2026-09-04: every pin above resolves.
- `tools/hooks/commit-msg` -- the commit shape; `tools/hooks/pre-commit` -- the gate and the secret scan.

## Tasks & Acceptance

**Execution:**
- [x] `.nvmrc`, `.npmrc`, `pnpm-workspace.yaml`, `package.json` -- `24` · `engine-strict=true` · `packages: [apps/*, packages/*]` · root `private`, `packageManager: pnpm@11.22.0`, `engines.node: 24.x`, scripts `lint` (`eslint .`), `typecheck` (`pnpm -r typecheck`), `test` (`pnpm -r test`), `check` (`pnpm lint && pnpm typecheck && pnpm test`), `build` (`pnpm --filter @inflozo/web build`) -- the workspace and its pins
- [x] `tsconfig.base.json` -- `strict`, `erasableSyntaxOnly`, `allowImportingTsExtensions`, `rewriteRelativeImportExtensions`, `module: nodenext`, `noEmit` -- one config every package extends; erasable syntax is what lets `node --test` run `.ts` directly
- [x] `packages/library/package.json` -- `@inflozo/library`, private, no dependencies, no scripts -- data only, the root of the arrow
- [x] `packages/{section-runtime,ghost-shim,theme-compiler}/{package.json,tsconfig.json,src/index.ts,src/index.test.ts}` -- `@inflozo/<name>`, private, `dependencies: { "@inflozo/library": "workspace:*" }` (plus each other only where used); scripts `typecheck` (`tsc --noEmit -p .`) and `test` (`node --test 'src/**/*.test.ts'`); `index.ts` exports the package name, the test asserts it -- three pure packages with a green suite from day one
- [x] `packages/theme-compiler/package.json` -- `devDependencies: { "gscan": "6.4.2", "handlebars": "4.7.9" }` -- pinned, dev-only, never shipped
- [x] `eslint.config.js` -- flat config with `typescript-eslint`'s parser; one block scoped to `packages/{section-runtime,ghost-shim,theme-compiler}/**`: `no-restricted-imports` (patterns `next`, `next/*`, `@supabase/*`, `node:*`, `@inflozo/web`, `**/apps/**`, and the bare built-in names derived from `node:module`'s `builtinModules` — never a hand list), `no-restricted-globals` (`process`, `fetch`, `window`, `document`), `no-restricted-properties` (`Date.now`, `Math.random`, `Intl.*`), `no-restricted-syntax` on `localeCompare`/`toLocaleUpperCase`/`toLocaleLowerCase`/`toString`/`getHours` member calls -- AD-1's ban as a rule, not a review
- [x] `apps/web/{package.json,tsconfig.json,next.config.ts,postcss.config.mjs,app/globals.css,app/layout.tsx,app/(marketing)/page.tsx,app/(app)/app/page.tsx,proxy.ts}` -- `@inflozo/web` private; deps `next 16.3.1`, `react`/`react-dom 19.2.8`; dev `typescript 7.0.2`, `tailwindcss` 4.x, `@tailwindcss/postcss`, `@types/react`, `@types/node`; `transpilePackages` for the three core packages; `globals.css` = `@import "tailwindcss"; @source not "../../../packages/library";`  (three levels — the file sits in `apps/web/app/`); layout `<html lang="en">`; two pages, one line of text each; `proxy.ts` per Design Notes -- the only deployable
- [x] `apps/web/vercel.json` -- `"buildCommand": "node --version && pnpm --version && pnpm -w check && next build"` -- lint, types and tests fail the deploy, and the build log proves the pins on the platform
- [x] `.github/workflows/ci.yml` -- on push to `main`: `pnpm/action-setup` (reads `packageManager`), `actions/setup-node` with `node-version-file: .nvmrc`, `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build` -- the green check
- [x] `.gitignore` -- add `.next/`, `.vercel/`, `*.tsbuildinfo` -- build output stays out
- [x] Vercel project `inflozo` (API, token read only into the command's environment, recorded by name) -- `PATCH /v9/projects/{id}` `rootDirectory: "apps/web"`, `framework: "nextjs"`; env `ENABLE_EXPERIMENTAL_COREPACK=1` (production, preview, development); `POST /v9/projects/{id}/link` `{ "type": "github", "repo": "Inflozo/inflozo" }` with production branch `main` (fallback: the dashboard's *Connect Git*, by the owner) -- push-to-main deploys; assumes Question 1's recommended answer

### Review Findings

Code review 2026-09-04, five layers over `686749c3..66a86ca4`. Everything below was **executed**, not
read: the four routing defects were reproduced against production and against a running `next start`,
and every lint escape was run through `pnpm lint` with a passing control either side.

**Decisions — these two are the owner's, and they are questions 5 and 6 below (R-83).**

- [ ] [Review][Decision] The root workspace installs a second TypeScript (6.0.3) against a frozen "installed versions equal the spine's Stack table" constraint — the spine's table still says one version. Question 5.
- [ ] [Review][Decision] `inflozo-probe.vercel.app` now serves the production site; the spec's Never list forbids touching that alias, so leaving or removing it is not mine to choose. Question 6.

**Patches — all applied in this phase.**

- [x] [Review][Patch] The query string was dropped by both proxy branches; `?token=` and `?next=` never arrived [apps/web/proxy.ts]
- [x] [Review][Patch] `/app` was matched as a string prefix, so `https://inflozo.com/apply` 308'd to `https://app.inflozo.com/ly` on the live site [apps/web/proxy.ts]
- [x] [Review][Patch] The app host rewrote unconditionally, so `app.inflozo.com/app/x` became `/app/app/x` and 404'd [apps/web/proxy.ts]
- [x] [Review][Patch] Hosts were matched by `startsWith`/`endsWith` and the 308 target built from the header, sending `www.inflozo.com/app/x` to the nonexistent `app.www.inflozo.com`; a port or capitals matched nothing [apps/web/proxy.ts]
- [x] [Review][Patch] `proxy.ts` had four branches and no test, because `next/server` does not resolve under bare `node --test` — the decision moved to a dependency-free module with a suite over all four defects [apps/web/routing.ts, apps/web/routing.test.ts, apps/web/package.json]
- [x] [Review][Patch] `await import('node:fs')` walked through the whole import ban — `no-restricted-imports` never visits `import()` [eslint.config.js]
- [x] [Review][Patch] `globalThis.process` walked through the globals ban — `no-restricted-globals` sees unqualified identifiers only [eslint.config.js]
- [x] [Review][Patch] `new Date()`, `performance.now()` and `crypto.randomUUID()` were unbanned while `Date.now` and `Math.random` were banned — the same clock and the same entropy [eslint.config.js]
- [x] [Review][Patch] The locale date formatters were unbanned while `toLocaleUpperCase` was banned [eslint.config.js]
- [x] [Review][Patch] `CORE` was a hand-written, `.ts`-only, three-package list — a fourth package, any `.tsx` and any `.js` linted with no ban at all; membership is now derived from the directory, as the file's own comment four lines below demands [eslint.config.js]
- [x] [Review][Patch] `ignores: ['**/*.test.ts']` exempted test files from *every* ban, not from the two modules that needed exempting; a core test could import `next/server` [eslint.config.js]
- [x] [Review][Patch] False positive that would have blocked real code: a core package could not import its own `./util/index.ts`, because the derived built-in patterns matched the relative specifier [eslint.config.js]
- [x] [Review][Patch] The CI workflow had no `permissions:` block, so its own token took the repository default — in the one story that spent two owner questions on token scope [.github/workflows/ci.yml]
- [x] [Review][Patch] A count was written into code ("the library's 484 flat stylesheets") against the standing rule that counts are derived, and the library holds none today [apps/web/app/globals.css]
- [x] [Review][Patch] The ticked task described `@source not "../../packages/library"`; the code correctly uses three levels [this spec, Tasks]
- [x] [Review][Patch] Verification pinned a deployment id that R-81's per-phase pushes make stale immediately; it now names `HEAD` [this spec, Verification]

**Deferred — real, not this story's, and recorded so they are not lost.** Full entries in
`deferred-work.md`.

- [x] [Review][Defer] `packages/library` declares no entry point, so `@inflozo/library` cannot resolve for the three packages that depend on it [packages/library/package.json] — deferred, the shape is a guess until story 1.3 has a consumer (DW-1)
- [x] [Review][Defer] `apps/web` does not depend on the core packages, so `transpilePackages` is inert [apps/web/next.config.ts] — deferred, the story that imports adds its own dependency (DW-2)
- [x] [Review][Defer] `@types/node@26.4.1` types two majors past the pinned Node 24.x [apps/web/package.json] — deferred, changing it moves the lockfile and wants its own install-and-verify (DW-3)
- [x] [Review][Defer] `.toString()` is banned on every receiver, not only on a Date as AD-1 says [eslint.config.js] — deferred, errs safe; narrow it when there is real code to narrow against (DW-4)
- [x] [Review][Defer] The GitHub token expires 2027-09-05 and no register row carries the date [tools/probe/.env.example] — deferred, needs the project's dated-deadline convention (DW-5)
- [x] [Review][Defer] `node --test` prints a MODULE_TYPELESS_PACKAGE_JSON warning on every `apps/web` run [apps/web/package.json] — deferred, the fix is a claim about Next that wants executing (DW-6)

**Acceptance Criteria:**
- Given a fresh clone on Node 24, when `pnpm install --frozen-lockfile && pnpm check && pnpm build` runs, then every step exits 0 and `pnpm ls -r --depth 0` shows exactly the pinned versions
- Given a core package file that imports `next/server`, when `pnpm lint` runs, then it exits non-zero naming the rule, and deleting the file makes it exit 0 again (the control)
- Given `pnpm why -r handlebars` and `pnpm why -r gscan`, when run at the root, then each resolves only under `@inflozo/theme-compiler`'s devDependencies
- Given a push to `main`, when CI and Vercel run, then the workflow is green, the newest production deployment is `READY`, its `meta.githubCommitSha` is the pushed commit, and its build log shows `v24.` and `11.22.0`
- Given that deployment, when `inflozo.com`, `app.inflozo.com` and `www.inflozo.com` are requested, then 200 · 200 · 308→apex, and no production domain returns 404 any more
- Given this story has no frame, when the two pages are read, then each is one line of plain unstyled text and nothing else — no tokens, components or invented vocabulary; R-74 holds by absence and the frames arrive with 1.3 to 1.5

## Spec Change Log

Five things the plan could not know until they were executed. None changes what the owner sees;
each is recorded here and beside the code it governs.

- **The linter's parser runs on the TypeScript 6 API.** `typescript-eslint` **refuses to load**
  against `typescript@7.0.2` — executed 2026-09-04, and its own error names the remedy
  ("Please see … running-side-by-side-with-typescript-6.0"; issue 10940 tracks TS ≥ 7.1). The
  project's compiler is still **7.0.2**: `apps/web` and all three core packages declare it and
  typecheck and build with it. The **root** workspace package declares `typescript@6.0.3` and owns
  nothing but `eslint .`. The pin the spine states is intact; a second copy exists so ESLint can
  read a `.ts` file at all. The reason is a comment at the top of [eslint.config.js](../../eslint.config.js).
- **Test files are exempt from the AD-1 ban block.** `node --test` needs `node:test` and
  `node:assert`, which the derived built-in ban would forbid. AD-1 governs what the compiler and
  the canvas run, not what proves them, so the block carries `ignores: ['**/*.test.ts']`. The
  negative control (`src/bad.ts`) is not a test file and is still caught.
- **`@types/node` is a devDependency of the three core packages** and `tsconfig.base.json` carries
  `"types": ["node"]`. Without it `tsc` 7.0.2 does not resolve `node:test` in the test files
  (TS2591, executed). Types only — nothing is imported at runtime, and the ESLint ban is unchanged.
- **`engine-strict` alone did not refuse the wrong Node.** pnpm 11 read `engines.node` and only
  **warned** on Node 22 (executed). `engineStrict: true` in `pnpm-workspace.yaml` is what refuses;
  `.npmrc` keeps `engine-strict=true` for npm's readers. The matrix row now holds.
- **`pnpm-workspace.yaml` carries `allowBuilds: dtrace-provider: false`.** pnpm 11 fails the install
  (`ERR_PNPM_IGNORED_BUILDS`) until every build script is ruled on; `dtrace-provider` is bunyan's
  optional native DTrace binding reached through `gscan`. Its script is denied, not approved.
  `eslint` is pinned at **10.9.1**, not the same-day 10.10.0, because pnpm 11's 24-hour
  minimum-release-age policy rejected the newer one — the policy is left on rather than excluded from.

## Design Notes

`apps/web/proxy.ts` — host routing only; the CSP comes with the first story that has a page to protect (`tools/probe/csp/proxy.ts` is its shape):

```ts
import { NextResponse, type NextRequest } from 'next/server'
export function proxy(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const { pathname } = req.nextUrl
  if (host.startsWith('app.')) return NextResponse.rewrite(new URL(`/app${pathname}`, req.url))
  if (pathname.startsWith('/app') && host.endsWith('inflozo.com'))
    return NextResponse.redirect(new URL(pathname.slice(4) || '/', `https://app.${host}`), 308)
  return NextResponse.next()
}
export const config = { matcher: ['/((?!_next/|favicon.ico).*)'] }
```

The app's routes live under `app/(app)/app/`: `(app)` is the route group that will carry the authenticated layout; `app/` is the internal prefix the rewrite targets. It never appears in a user-facing URL, and on `localhost:3000` `/app` reaches it directly. Two route groups cannot both own `/`, which is why the prefix exists.

Tests run with `node --test` on erasable-syntax TypeScript and no framework — the pattern `tools/stress/test-*.js` already uses. ponytail: add vitest only when a test needs mocking or a DOM; jsdom is injected explicitly in this codebase, so that may never come.

## Verification

Executed 2026-09-04 on Node 24.18.1 locally and on Vercel's builder, against the real Vercel API and
the three production domains (R-82). Keys were read only into a command's environment and are recorded
here by variable name — `VERCEL_TOKEN`, `VERCEL_TEAM_ID` — never by value.

**Ran locally, on the workspace:**

| Command | Result |
|---|---|
| `corepack pnpm install --frozen-lockfile` | exit 0 · `node --version` `v24.18.1` · `pnpm --version` `11.22.0` |
| `pnpm ls -r --depth 0` | `next 16.3.1`, `react`/`react-dom 19.2.8`, `typescript 7.0.2` in `apps/web` and all three core packages, `tailwindcss`/`@tailwindcss/postcss 4.3.3`, `gscan 6.4.2` + `handlebars 4.7.9` under `@inflozo/theme-compiler` only. Root: `eslint 10.9.1`, `@typescript-eslint/parser 8.69.0`, `typescript 6.0.3` (see Spec Change Log) |
| `pnpm check` | exit 0 — lint clean, four `tsc --noEmit` projects Done, three `node --test` suites 1 pass / 0 fail each |
| `pnpm build` | exit 0 — route manifest `○ /`, `○ /app`, `ƒ Proxy (Middleware)` |
| `pnpm why -r handlebars` · `pnpm why -r gscan` | one version each, reached only from `@inflozo/theme-compiler` devDependencies |

**Negative controls — a result whose control did not pass is not a result:**

| Control | Result |
|---|---|
| `echo "import 'next/server'" > packages/ghost-shim/src/bad.ts && pnpm lint` | **exit 1** — `'next/server' import is restricted from being used by a pattern  no-restricted-imports` |
| a file reaching for `node:fs/promises`, `Math.random`, `Date.now`, `process`, `localeCompare` | **exit 1** — five errors, one per ban class (`no-restricted-imports`, `no-restricted-properties` ×2, `no-restricted-globals`, `no-restricted-syntax`) |
| `rm packages/ghost-shim/src/bad.ts && pnpm lint` | **exit 0** — the control passes, so the failures above were the rule and not a broken run |
| a `.vercel/cache/**/worker.js` fixture reproducing the first deploy's failure, then `pnpm lint` | **exit 0** after the ignore fix; the same fixture failed before it |
| `pnpm install --frozen-lockfile` on Node **22.23.2** | **exit 1** — *"Your Node version is incompatible … Expected version: 24.x, Got: v22.23.2"*. `.npmrc`'s `engine-strict` alone only **warned**; `engineStrict: true` in `pnpm-workspace.yaml` is what refuses (Spec Change Log) |

**Host routing, exercised against a running `next start` before deploying:**
`/` → 200 `<p>Inflozo</p>` · `/app` → 200 `<p>Inflozo · app</p>` · `Host: app.inflozo.com` `/` → 200 `<p>Inflozo · app</p>` (rewrite, URL unchanged) · `Host: inflozo.com` `/app/x` → **308** `https://app.inflozo.com/x`.

**Vercel — `api.vercel.com`, project `inflozo` `prj_ptauaY2o7FQckRDk31b7hdl06FSb` (real service):**

| Call | Returned |
|---|---|
| `PATCH /v9/projects/{id}` | `rootDirectory: apps/web` · `framework: nextjs` |
| `POST /v10/projects/{id}/env` | created `ENABLE_EXPERIMENTAL_COREPACK` = `1`, targets `production, preview, development`, type `plain` |
| `POST /v9/projects/{id}/link` | `link.org` `Inflozo` · `link.repo` `inflozo` · `productionBranch` `main` — the Vercel GitHub App was already granted on the organisation, so no owner action was needed |
| `GET /v6/deployments?limit=1` | the newest production deployment is **READY**, `target: production`, and its `meta.githubCommitSha` equals `HEAD`. Read as `dpl_EQuk6rYKWKyzPwQkWkdVYbMF6z83` / `d36b0095` when this was written — R-81 pushes on every phase, so the id is re-read each time rather than pinned |
| `GET /v3/deployments/{id}/events` | the build log prints `v24.19.0` then `11.22.0`, runs `pnpm -w check` green (lint, four typechecks, three suites), then `next build` → `○ /`, `○ /app`, `ƒ Proxy (Middleware)`, `Build Completed in /vercel/output [23s]` |

**Deployment:** `inflozo-7vsfd74vy-umangkagathara.vercel.app` (`dpl_EQuk6rYKWKyzPwQkWkdVYbMF6z83`), production, from `d36b0095`.

**The production domains (real, live):**

| Request | Returned |
|---|---|
| `GET https://inflozo.com/` | **200**, body contains `Inflozo` |
| `GET https://app.inflozo.com/` | **200**, body contains `Inflozo · app`, no redirect |
| `GET https://www.inflozo.com/` | **308** → `https://inflozo.com/` (Vercel's existing rule, untouched) |
| `GET https://inflozo.com/app/x` | **308** → `https://app.inflozo.com/x` |

No domain returns 404 any more. The first deployment on this story, `dpl_BoS2pAq9xkoP4rL7v1Wxt7AT4Ujw` (commit `190fc972`), **failed** — `eslint .` walked `.vercel/cache/`, Vercel's restored build cache, and reported 60 errors from the vendored pnpm bundle inside it. That is the failure the ignore fix and its fixture above close, and it is recorded rather than quietly overwritten.

**Real services hit (R-82):** Vercel only — `api.vercel.com` (project read, `PATCH` project, `POST` env, `POST` link, deployment list, deployment events) and the three production domains. No Supabase, Resend, Dodo or Ghost call belongs to this story, and none was made.

**GitHub Actions (real service), read with `GITHUB_TOKEN` after the owner added it 2026-09-04.**
Unauthenticated the API returned **404** (private repository, `gh` not installed, no credential helper — the push is SSH-key only), which is why question 3 exists. With the token, `GET /repos/Inflozo/inflozo/actions/runs`:

| Commit | Workflow | Status | Conclusion |
|---|---|---|---|
| `20932eb3` | CI | completed | **success** |
| `67953297` | CI | completed | **success** |
| `d36b0095` | CI | completed | **success** |
| `190fc972` | CI | completed | **success** |

All four green, so *"the workflow is green"* holds and every acceptance criterion is now verified.

**A finding the token bought, and it is worth more than the tick.** `190fc972` is **green on GitHub and
failed on Vercel** — the deploy whose `eslint .` walked `.vercel/cache/`. The two checks run the same
commands and disagreed, because that directory exists only on Vercel's builder. So the GitHub check is
**not** a redundant second opinion, and neither is it a superset: each has a blind spot the other
covers, and only the Vercel build gates what goes live. Any later story that reads "CI is green" as
"the deploy will succeed" is reading it wrong.

**Negative controls on the token itself** (standing rule 2 — a permission claim is a hypothesis too):
`PUT /repos/Inflozo/inflozo/contents/…` → **403**, `POST /repos/Inflozo/inflozo/issues` → **403**. It
cannot write. It is a fine-grained token (`github_pat_` prefix, no `x-oauth-scopes` header),
`github-authentication-token-expiration: 2027-09-05`. **It reads more than the row in
`tools/probe/.env.example` describes**, though: `contents`, `issues`, `pulls`, `actions/secrets` (names
only — GitHub never returns a secret's value), `actions/variables`, `collaborators`, `hooks` and
`orgs/Inflozo/members` all return **200**. Read-only, but repository-wide. That is question 4 below.

### Review phase — 2026-09-04, re-executed rather than re-read (R-82)

Every claim above was re-executed against the same real services, plus the cases the matrix did not
cover. Keys were read only into a command's environment and are recorded by variable name —
`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `GITHUB_TOKEN` — never by value.

**Held, unchanged:** `api.vercel.com` project `inflozo` — `rootDirectory apps/web`, `framework
nextjs`, git link `Inflozo/inflozo` on `main`, `ENABLE_EXPERIMENTAL_COREPACK=1` on all three targets,
the three pre-existing encrypted env vars untouched; the newest production deployment READY at
`meta.githubCommitSha` = `HEAD`; its build log prints `v24.19.0` then `11.22.0`, runs `pnpm -w check`
green and `next build`. The three domains 200 · 200 · 308→apex and `/app/x` → 308. Every GitHub
Actions run on `main` `completed success`. `pnpm why -r` puts `gscan` and `handlebars` under
`@inflozo/theme-compiler` only. `pnpm install --frozen-lockfile` on Node 22 refuses.
**Controls:** wrong bearer → 403; real token, nonexistent project → 404; GitHub unauthenticated →
404; apex paths that are not the app prefix (`/about`, `/pricing`, `/ap`) → 404 with no `Location`,
so the 308s were the rule firing and not a blanket redirect.

**Four routing defects found on the live site, and fixed in this story (R-80: findings are fixed
inside the story).** The I/O matrix tested `/` and `/app/x` with no query string, and every one of
these passed underneath it:

| Executed against production | Was | Now |
|---|---|---|
| `GET https://inflozo.com/apply` | **308 → `https://app.inflozo.com/ly`** — `startsWith('/app')` matched any path merely beginning `app`, and `slice(4)` ate four characters | passes through to marketing |
| `GET https://inflozo.com/app/signin?next=%2Fdashboard` | **308 → `https://app.inflozo.com/signin`** — the query string was dropped by both branches, which is the shape story 1.4's magic link needs | `…/signin?next=%2Fdashboard` |
| `GET https://app.inflozo.com/app/x` | **404** — the app host rewrote unconditionally, so an already-prefixed path became `/app/app/x` | 308 → `https://app.inflozo.com/x` |
| `Host: www.inflozo.com` `/app/x` | **308 → `https://app.www.inflozo.com/x`**, a host that does not exist — `endsWith('inflozo.com')` matched every subdomain and the target was built from the header | passes through |

The decision moved into `apps/web/routing.ts`, which imports nothing, because `next/server` does not
resolve under bare `node --test` (executed) and so `proxy.ts` could not be tested at all — which is
why four defects in four branches met no check. `apps/web/routing.test.ts` now pins all four plus
localhost dev and a host carrying a port or capitals; `apps/web` gained the `test` script that
`pnpm -r test` needs to reach it. Re-executed against a running `next start`: `/apply` → 404 (no
longer hijacked) · `/app/x?token=T` → 308 with the token · `/app` → 308 → `/` · `app.…/app/x` → 308 →
`/x` · `www.` and `ghost5.inflozo.com` → not routed · `localhost:3000/` and `/app` → 200 and 200.

**Five holes in the AD-1 boundary lint, executed as escapes and closed.** The recorded control —
five errors, one per ban class — kept passing through all of them, which is what made the ban look
wider than it was:

| Escape, run in a core package | Was | Now |
|---|---|---|
| `await import('node:fs')` | **exit 0** — `no-restricted-imports` never visits `import()` | `no-restricted-syntax` on `ImportExpression` |
| `(globalThis as …).process` | **exit 0** — `no-restricted-globals` sees unqualified identifiers only | `globalThis` is itself banned |
| `new Date()`, `performance.now()`, `crypto.randomUUID()` | **exit 0** — only `Date.now` and `Math.random` were named | zero-arg `new Date` banned; `performance` and `crypto` are restricted globals |
| `new Date(0).toLocaleDateString()` | **exit 0** — the list held `toLocaleUpperCase`/`toLocaleLowerCase` but no date formatter | `toLocaleString`, `toLocaleDateString`, `toLocaleTimeString`, `getTimezoneOffset` added |
| a `.tsx`, a `.js`, or a fourth package under `packages/` | **exit 0** — `CORE` was a hand-written three-glob `.ts`-only list, in the file whose own comment four lines below forbids hand lists | `packages/*/**/*.{ts,tsx,mts,cts,js,mjs,cjs}` minus `library` — derived from the directory |
| a `.test.ts` importing `next/server` or calling `Math.random()` | **exit 0** — `ignores: ['**/*.test.ts']` exempted tests from *every* rule, though only `node:test` and `node:assert` needed exempting | tests keep every ban; only those two modules are relaxed |

**And one false positive, which would have blocked real code.** A core package could not import its
own `./util/index.ts`: the derived built-in patterns matched the relative specifier (`'./util/index.ts'
import is restricted from being used by a pattern`, executed). `util`, `path`, `url`, `stream`,
`events`, `assert` and `test` are all built-in names and all plausible subdirectories of
`section-runtime`. Closed with trailing `!./**` and `!../**` negations.

**Controls on the new rules** — ten errors across eight fixtures, one per new ban plus the new
package and the `.tsx`; `./util/index.ts` produced none; deleting every fixture returned `pnpm check`
to **exit 0** and `pnpm build` to the same route manifest (`○ /`, `○ /app`, `ƒ Proxy (Middleware)`).
The controls passed, so the exit-0s above were the open rules and not a broken run.

**The fixes were verified in production, not only locally.** The review commit `02c44887` deployed as
`dpl_DqQjmbVW9GcSxeVjesTx9ZCrTWHy` — **READY**, `target: production` — and its GitHub check is
`completed success`. Re-read live afterwards: `inflozo.com/` **200** `<p>Inflozo</p>` ·
`app.inflozo.com/` **200** `<p>Inflozo · app</p>` · `www.inflozo.com/` **308** → apex ·
`inflozo.com/app/x` **308** → `https://app.inflozo.com/x`. Every frozen matrix row still holds, and
the four defects are closed on the live site: `inflozo.com/apply` → **404** (a missing page, no
longer 308'd to `/ly`) · `inflozo.com/app/signin?next=%2Fdashboard` → **308** →
`https://app.inflozo.com/signin?next=%2Fdashboard`, the parameter intact ·
`app.inflozo.com/app/x` → **308** → `https://app.inflozo.com/x` instead of 404.

**One state change nobody made, recorded rather than left to be discovered.** Linking Git moved the
`inflozo-probe.vercel.app` alias onto the new production deployment: it now serves the live site, and
`MEASUREMENTS.md` §18's CSP probe is no longer reachable in place — story 1.5 must re-execute it
rather than cite it. Nothing touched the alias; it moved. That is question 6 below.

### Deploy phase — 2026-09-04, confirmed on the one pre-launch stack (PRD §4, AD-26)

Nothing was deployed by hand: question 1 was ruled option 1, so the push of the Review phase's last
commit built itself. This phase read the result. Keys were read only into a command's environment and
are recorded by variable name — `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `GITHUB_TOKEN` — never by value.

**Deployment:** `dpl_D1yUsvbQw7oVy1oyhZYTrqHAeC1t` · `inflozo-7sr4u8619-umangkagathara.vercel.app` ·
`READY` · `target: production` · `meta.githubCommitSha` `dacfa5bc`, which equals `HEAD` and
`origin/main` at this phase. Read with
`GET /v6/deployments?projectId=prj_ptauaY2o7FQckRDk31b7hdl06FSb&target=production`. Every production
deployment on this story before it — `aa65c107` (`dpl_7iWXMixjX1TVvbRYRDVfMKcEUHR4`), `7861f2af`,
`03521443`, `02c44887`, `66a86ca4` — is READY too, so no push on this story left a red build behind.
R-81 pushes on every phase, so a later phase re-reads the newest deployment rather than trusting this
id: it is the record of what was live when the owner was asked to test, not a pin.

**The production domains, re-read live against that deployment** (never a `vercel.app` URL in the
owner's test):

| Request | Returned |
|---|---|
| `GET https://inflozo.com/` | **200**, body `Inflozo` |
| `GET https://app.inflozo.com/` | **200**, body `Inflozo · app`, no redirect |
| `GET https://www.inflozo.com/` | **308** → `https://inflozo.com/` |
| `GET https://inflozo.com/app/x` | **308** → `https://app.inflozo.com/x` |
| `GET https://inflozo.com/app/signin?next=%2Fdashboard` | **308** → `https://app.inflozo.com/signin?next=%2Fdashboard` — query intact |
| `GET https://app.inflozo.com/app/x` | **308** → `https://app.inflozo.com/x` |
| `GET https://inflozo.com/apply` | **404** — a missing marketing page, not hijacked to `/ly` |

The last three are the review's routing fixes, still closed on the live site at this deployment.

**GitHub Actions at `HEAD`** (`GET /repos/Inflozo/inflozo/actions/runs`): `dacfa5bc` CI `completed
success`, and `aa65c107` before it likewise.

No schema and no migration belong to this story, so `RLS-TEST.sql` is not in scope here; story 1.2
owns it. No tooling change to deploy.

**Real services hit (R-82):** `api.vercel.com`, `api.github.com`, and the three production domains.

## Owner's manual test

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | https://inflozo.com/ | Plain page | Open the address in your browser | — | The word "Inflozo" on an otherwise empty page — not the 404 error from before |
| 2 | https://app.inflozo.com/ | Plain page | Open the address | — | The words "Inflozo · app"; the address bar still says app.inflozo.com |
| 3 | https://www.inflozo.com/ | — | Open the address | — | The address bar changes to inflozo.com and shows the same page as step 1 |

There is nothing to judge as design yet — each page is one line of plain text. The real screens arrive with stories 1.3 to 1.5.

## Questions for the owner

### 1. How should the site get deployed when code is pushed?

Every time a story's code is saved to the main branch on GitHub, something has to build it and put it live on inflozo.com. Example: when story 1.4 is finished, you should be able to open app.inflozo.com a few minutes later and see the sign-in page without anyone running a command.

1. **Vercel watches GitHub and builds every push to `main` by itself; the Vercel key in `tools/probe/.env` is only ever used to read whether a build succeeded (RECOMMENDED)** — no manual step, one source of truth, and the checks run inside the build so a broken push never goes live.
2. A Claude session deploys by running `vercel --prod` from this machine after each story — someone must remember to do it, and the key gains the power to write.

**Ruled:** "i am okay with the recommended options for both questions" *(owner, 2026-09-04)* — option 1.

### 2. Where should the app's secret keys live?

The app will need keys (Supabase, Resend, Dodo) to run in the cloud, and a copy on this machine to run locally. Example: story 1.4 sends sign-in emails through Resend, so the live site needs `RESEND_API_KEY` and so does a local test.

1. **Vercel's project environment variables are the master copy; local development copies them down with `vercel env pull`; `tools/probe/.env` keeps the verifier's set under the same names (RECOMMENDED)** — the live site and the checks always read the same names, and nothing secret is ever in the repository.
2. One shared file kept by hand on this machine, copied into Vercel whenever it changes — simpler to picture, but two copies drift and one of them is invisible.

**Ruled:** "i am okay with the recommended options for both questions" *(owner, 2026-09-04)* — option 1.

Story 1.1 itself needs no secrets. Questions 1 and 2 were ruled on 2026-09-04 with answer 1; the tasks stand as written. Question 3 came out of the Dev phase and is open.

### 3. How should we see whether the GitHub safety check passed?

Two things now build the site on every save to `main`: Vercel (which puts it live) and GitHub's own
checker (a second opinion that runs the same tests). Vercel's result can be read from this machine —
the token for it is already in `tools/probe/.env`. GitHub's cannot: the repository is private, and no
GitHub key exists here, so the tick or cross next to each commit on github.com is invisible to a
Claude session. Example: if a future story breaks a test in a way Vercel happens to skip, GitHub would
show a red cross that nobody in the session would ever see.

1. **Leave it as is — you glance at github.com after a story, and Vercel stays the gate that actually
   blocks a bad deploy (RECOMMENDED)** — nothing new to create or keep secret, and the check that
   matters (Vercel's) already refuses to publish a broken build, because the same tests run inside it.
2. You create a read-only GitHub token and paste it into `tools/probe/.env` as `GITHUB_TOKEN`, and
   every future story's verification reads the tick automatically — one more key to make and guard,
   for a second opinion on a check the deploy already enforces.
3. Drop the GitHub checker entirely and rely on Vercel alone — fewer moving parts, but no second
   opinion at all, and no tick on github.com.

**Ruled:** "give me step by step guide on how to add the Github token and I will add it" *(owner, 2026-09-04)* — **option 2**. `GITHUB_TOKEN` is now a row in `tools/probe/.env.example` (fine-grained, resource owner `Inflozo`, repository `inflozo`, **Actions: Read-only** and nothing else — a classic token's `repo` scope is read *and* write and is deliberately not used). Once the owner has pasted it into `tools/probe/.env`, this story's last acceptance criterion is read with:

```
env $(grep -E '^GITHUB_TOKEN=' tools/probe/.env | xargs) sh -c 'curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "https://api.github.com/repos/Inflozo/inflozo/actions/runs?per_page=5"' | python3 -c 'import json,sys; [print(r["head_sha"][:8], r["status"], r["conclusion"]) for r in json.load(sys.stdin)["workflow_runs"]]'
```

expected: a row per push to `main`, each `completed success`. Every later story's `## Verification` reads the check the same way.

### 4. The GitHub token you made can read the whole repository, not just the check. Leave it or narrow it?

I asked for a key that could read one thing: whether the safety check passed. The one now in
`tools/probe/.env` reads that, and also every file, issue, pull request, webhook, collaborator and the
list of who is in the Inflozo organisation. It **cannot change or delete anything** — I tried to write
a file and to open an issue and GitHub refused both — and it cannot see the *value* of any secret,
because GitHub never hands those out. It expires on 5 September 2027. Example: if that file were ever
copied off your machine, whoever had it could read all of Inflozo's source code, but could not alter a
line of it or deploy anything.

Worth knowing before you choose: this machine already holds an SSH key that can **write** to the same
repository — that is how the code got pushed. So the token is weaker than something already here.

1. **Leave it as it is, and I correct the note in `tools/probe/.env.example` to describe what the key
   actually does (RECOMMENDED)** — no risk that is not already present, nothing for you to redo, and
   the written record stops being wrong, which is the part that actually matters.
2. Narrow it to the check only — about two minutes: open
   https://github.com/settings/personal-access-tokens, click `inflozo-ci-read`, under **Repository
   permissions** set everything except **Actions** back to **No access**, and **Update**. The key in
   your file keeps working; nothing needs re-pasting.
3. Delete it and go back to glancing at github.com yourself — undoes the thing you just did, and every
   later story loses the automatic tick.

**Ruled:** "leave it" *(owner, 2026-09-04)* — **option 1**. The token stays repository-wide read-only; the row in `tools/probe/.env.example` now describes what it actually does rather than what was asked for, so the record is true. It is strictly weaker than the SSH key already on this machine, which can write.

### 5. The project now has two copies of TypeScript. Should the architecture say so?

TypeScript is the language the code is written in, and the architecture document says this project
uses exactly one version of it: 7.0.2. Everything that gets built and shipped does use 7.0.2. But the
tool that enforces the safety rule — the one that stops a building block from reaching out to the
machine it is running on — **refuses to start** against 7.0.2 and needs the older 6.0.3. So a second
copy of 6.0.3 now sits at the top of the repository doing nothing except powering that checker.

Example: if you listed the installed packages you would see `typescript 7.0.2` five times and
`typescript 6.0.3` once — and the architecture's version table, which says there is only one, would
be quietly wrong. This project has been bitten before by a document that stopped being true without
anyone noticing.

1. **Leave the code alone, and I add one line to the architecture's version table saying the checker
   holds a second, older copy and why (RECOMMENDED)** — nothing changes in what gets built or
   shipped, and the highest-authority document stops disagreeing with the machine. The disagreement
   is the actual risk here, not the second copy.
2. Leave the code alone and change nothing — the explanation stays only in this story's change log,
   where a future story is unlikely to look, and the architecture keeps saying something untrue.
3. Switch the safety checker off until its makers support 7.0.2 — no second copy, but the rule that
   stops a building block reaching the host machine stops being enforced, and that rule is the main
   thing this story built.

*Asked back by the owner 2026-09-04: which version does the project need, and why is an older one
in use? Answer: the project needs and uses **7.0.2** for everything it builds and ships — all four
packages and the app compile with it and nothing about that changes. The older 6.0.3 is used by
**one tool only**, `typescript-eslint`, which reads the code to enforce the AD-1 boundary rule and
refuses to start against 7.0.2; its own error names the remedy and its issue 10940 tracks support
for TypeScript 7.1. It compiles nothing and ships nothing. This question is only about whether the
architecture's version table should say so.*

**Ruled:** "Leave the code alone, and I add one line to the architecture's version table saying the
checker holds a second, older copy and why" *(owner, 2026-09-04)* — **option 1**. No code changed.
`ARCHITECTURE-SPINE.md`'s Stack table, TypeScript row, now carries it, so the highest-authority
document and the machine agree.

### 6. A leftover test address now shows the real site. Leave it, or take it down?

Before this story, `inflozo-probe.vercel.app` was a scratch address used to try things out on Vercel.
Connecting the repository to Vercel **moved it by itself** — nobody touched it — and it now serves
the live Inflozo site. So three public addresses show your product instead of two.

Example: type `inflozo-probe.vercel.app` into a browser today and you get the same page as
`inflozo.com`. Nothing is broken. But it is a leftover name from the testing phase, and one earlier
measurement that story 1.5 was going to build on used to live at that address and no longer does.

1. **Leave it (RECOMMENDED)** — harmless before launch, costs nothing, and nobody knows the address.
   I have already recorded that story 1.5 must re-run that measurement rather than cite the old one.
2. Remove the address from the project — one call, about a minute, and `inflozo.com` and
   `app.inflozo.com` are unaffected. Choose this if you would rather nothing but your two real
   addresses ever answers.

**Ruled:** "Leave it" *(owner, 2026-09-04)* — **option 1**. The alias stays attached and keeps
serving production. Story 1.5 must **re-execute** `MEASUREMENTS.md` §18's CSP probe rather than cite
it, because the deployment it measured no longer sits at that address.

