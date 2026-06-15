# PortalJS Cloud — infra handoff (Datopian)

What needs to exist on the Cloudflare side for PortalJS Cloud to run. I build the Workers,
API, and skill against the contract in `SPEC.md` and test locally; this is what you
provision so we can go to staging → production.

Nothing here blocks local development — the Workers run on Miniflare with a mock R2/D1
until these exist.

## 1. Cloudflare account + zone
- A Cloudflare account for PortalJS Cloud (the existing Datopian one is fine).
- The **`portaljs.com` zone** managed in that account (it already is, for the marketing site).

## 2. DNS
- A **wildcard** `*.portaljs.com` record (proxied) pointed at the **Router Worker** (via a
  Workers route `*.portaljs.com/*`). Existing hosts (`www`, `docs`, `api`, etc.) keep their
  own records and are excluded by the Worker's reserved-list.
- For staging: `*.staging.portaljs.com` → the staging Router Worker.

## 3. R2
- One **R2 bucket** (e.g. `portaljs-cloud`) for tenant static files. A separate
  `portaljs-cloud-staging` bucket for staging.

## 4. D1
- One **D1 database** (e.g. `portaljs-cloud`) for `users`/`tokens`/`projects`/`deployments`
  (schema in `SPEC.md`). Staging counterpart.

## 5. Workers
- Two Workers (or one with routes): **router** (`*.portaljs.com`) and **deploy API**
  (`api.portaljs.com/v1/*` or `deploy.portaljs.com`). I author `wrangler.toml` with the R2
  + D1 bindings; you confirm the route + binding names.

## 6. GitHub OAuth app (for auth)
- A GitHub OAuth app for `cloud.portaljs.com` (callback `https://cloud.portaljs.com/auth/callback`).
- Hand me the **client ID**; keep the **client secret** in the Worker secret store.

## Secrets I'll need (via `wrangler secret put`, not in the repo)
- `CLOUDFLARE_API_TOKEN` (account-scoped: Workers + R2 + D1 edit) — for deploys from CI/me.
- `CLOUDFLARE_ACCOUNT_ID`.
- `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET`.
- A signing secret for API tokens (`TOKEN_SIGNING_KEY`).

## Suggested order
1. R2 bucket + D1 db (staging) → unblocks API/Worker staging tests.
2. Wildcard `*.staging.portaljs.com` → staging router → end-to-end staging.
3. GitHub OAuth app → real auth.
4. Production R2/D1 + flip `*.portaljs.com` wildcard.

Give me account ID + a scoped API token + the staging bucket/db names and I can wire and
deploy to staging.
