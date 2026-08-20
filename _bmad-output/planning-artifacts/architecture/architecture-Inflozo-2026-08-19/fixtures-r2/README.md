# Round 2 fixtures — the two-checker gate

Captured 2026-08-20. Recorded per AD-23: a runnable probe, its command, and its capture date.

`gate.js` is the Ghost-major → gscan-version map AD-34 now mandates, and the smallest thing that
fails if the pairing regresses.

    npm install                 # gscan4 = gscan@4.49.7, gscan6 = gscan@6.4.2
    node gate.js  <themeDir>    # both verdicts
    node bench.js <themeDir>    # 5 runs each, medians

Ghost images the pairing was read from:

    ghost:5-alpine  ghost@sha256:a0506f3f05f5bdc6c950c5113cdcdb1e1f96fbf15f6dc0a39fc093c25348bdb5  -> 5.130.6, gscan 4.49.7
    ghost:6-alpine  ghost@sha256:c917e2a3bda19fee4074bf300c141fb9f87a6722756f8010c8e318962a70a3f2  -> 6.58.0,  gscan 6.4.2

    docker exec <c> cat /var/lib/ghost/versions/*/node_modules/gscan/package.json | grep version

Verdicts to reproduce are in `MEASUREMENTS.md` §13. When the product repo exists this moves to
`fixtures/gscan/` and the harness becomes the gate's own test.
