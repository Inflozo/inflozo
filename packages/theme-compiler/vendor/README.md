# `gscan-4.49.7.tgz` — Ghost 5's checker, installable on Node 24

The gate (`gate/gscan.ts`, Story 7.7) judges a Ghost 5 site by gscan **4.49.7**, the version Ghost 5.130.6 pins (AD-34,
R2-2). The registry's tarball declares `engines.node` `^14.18.0 || ^16.13.0 || ^18.12.1 || ^20.11.1 || ^22.13.1`, and
pnpm refuses it on the project's Node 24 because the workspace is `engineStrict` (`pnpm-workspace.yaml`). Executed
2026-10-09, before the copy existed — the control:

```
pnpm install    # with "gscan4": "npm:gscan@4.49.7" in packages/theme-compiler/package.json, Node 24.18.1, pnpm 11.22.0
[ERR_PNPM_UNSUPPORTED_ENGINE] Unsupported environment (bad pnpm and/or Node.js version)
Your Node version is incompatible with "gscan@4.49.7".
Expected version: ^14.18.0 || ^16.13.0 || ^18.12.1 || ^20.11.1 || ^22.13.1
Got: v24.18.1
```

So this directory holds a copy whose **only** change is that range, widened by ` || ^24.0.0`. Nothing else differs
from upstream. gscan 4.49.7 already ran on Node 24 before this (Story 7.6's review), and the gate's test runs it there on
every commit.

- **Upstream:** `https://registry.npmjs.org/gscan/-/gscan-4.49.7.tgz`
- **Its `dist.integrity`:** `sha512-4JRW8X42QBehztb+I77Lz0HU9V2zJLLp7ACCXuxDLo/DOMNviSptuQzkKioB5n+PUAGW6fkFycrOVT3U9XgjYQ==`
- **Made:** 2026-10-09
- **The copy's sha256:** `53cfdc8046069dff66291952aa4c8cc066137de0b302d18f1614b52186080c98`

## The command that makes the copy

Run in an empty directory (GNU tar and gzip). It checks the upstream integrity, widens the one range with an exact text
edit, and repacks with sorted names, npm's fixed date, a numeric owner and no gzip timestamp, so the bytes are
reproducible and `pnpm-lock.yaml`'s integrity for the `file:` dependency holds on every machine.

```sh
curl -sfL https://registry.npmjs.org/gscan/-/gscan-4.49.7.tgz -o upstream.tgz
echo "sha512-$(openssl dgst -sha512 -binary upstream.tgz | base64 -w0)"   # must print the dist.integrity above
mkdir copy && tar -xzf upstream.tgz -C copy
sed -i 's/\("node": "^14.18.0 || ^16.13.0 || ^18.12.1 || ^20.11.1 || ^22.13.1\)"/\1 || ^24.0.0"/' copy/package/package.json
(cd copy && find package -type f | LC_ALL=C sort \
  | tar --no-recursion -T - --mtime=1985-10-26T08:15:00Z --owner=0 --group=0 --numeric-owner --mode=go-w --format=ustar -cf -) \
  | gzip -9n > gscan-4.49.7.tgz
sha256sum gscan-4.49.7.tgz                                                 # must print the copy's sha256 above
```

The command is GNU tar, gzip, sed and coreutils on Linux — CI's runner and this machine; macOS's BSD tar and `sed -i` give other bytes, so run it in a Linux container there (Review, 2026-10-09).

**A review re-runs it and compares:** the sha256 matches, and unpacking both tarballs, `diff -r` reports
`package/package.json`'s `engines.node` line alone.

Moving Ghost 5's pin re-makes this copy by the same command at the new version — step 1 of the bump procedure in
`../fixtures/gscan/README.md`.
