# tools/probe/csp — NFR-3's two CSP policies, runnable

Closes **R1 decision 5**, carried unexecuted through Rounds 1, 2 and 3.

    npm install && npx next build          # read the route manifest: / is ○, /editor is ƒ
    npx next start -p 3111
    curl -H 'Host: inflozo.com'     -D - localhost:3111/        # marketing-static, no nonce
    curl -H 'Host: app.inflozo.com' -D - localhost:3111/editor  # app-nonce, per-request

`proxy.ts` is the whole subject: Next 16 renamed `middleware.ts` and runs it on the Node
runtime, which is what a session-aware `connect-src` needs.

The finding: **setting a CSP header does not force dynamic rendering — reading the nonce
does.** So the marketing site keeps SSG and still carries a policy. Numbers, the Vercel
verification and the stated limits are in `MEASUREMENTS.md` §18.
