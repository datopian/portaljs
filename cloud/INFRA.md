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
- A **wildcard** `*.app.portaljs.com` record (proxied) pointed at the **Router Worker** (via
  a Workers route `*.app.portaljs.com/*`). **Scoped to `app.portaljs.com` on purpose** — it
  does NOT cover bare `<prefix>.portaljs.com`, so existing/legacy PortalJS Cloud customer
  subdomains are unaffected (different name level, outside the wildcard).
- For staging: `*.staging.app.portaljs.com` → the staging Router Worker.
- Legacy `<prefix>.portaljs.com` records stay exactly as they are — no changes needed.

## 3. R2
- One **R2 bucket** (e.g. `portaljs-cloud`) for tenant static files. A separate
  `portaljs-cloud-staging` bucket for staging.

## 4. D1
- One **D1 database** (e.g. `portaljs-cloud`) for `users`/`tokens`/`projects`/`deployments`
  (schema in `SPEC.md`). Staging counterpart.

## 5. Workers
- Two Workers (or one with routes): **router** (`*.app.portaljs.com/*`) and **deploy API**
  (`api.app.portaljs.com/v1/*`). I author `wrangler.toml` with the R2 + D1 bindings; you
  confirm the route + binding names.
- **Avoid `cloud.portaljs.com` and `api.portaljs.com`** — both are used by the legacy
  PortalJS Cloud app. The new system lives entirely under `app.portaljs.com`
  (dashboard/auth at the `app.portaljs.com` apex, API at `api.app.portaljs.com`).

## 6. GitHub OAuth app (for auth)
- A GitHub OAuth app for `app.portaljs.com` (callback `https://app.portaljs.com/auth/callback`).
- Hand me the **client ID**; keep the **client secret** in the Worker secret store.

## Secrets I'll need (via `wrangler secret put`, not in the repo)
- `CLOUDFLARE_API_TOKEN` (account-scoped: Workers + R2 + D1 edit) — for deploys from CI/me.
- `CLOUDFLARE_ACCOUNT_ID`.
- `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET`.
- A signing secret for API tokens (`TOKEN_SIGNING_KEY`).

## Suggested order
1. R2 bucket + D1 db (staging) → unblocks API/Worker staging tests.
2. Wildcard `*.staging.app.portaljs.com` → staging router (+ `api.staging.app.portaljs.com`
   → staging deploy API) → end-to-end staging.
3. GitHub OAuth app (`app.portaljs.com`) → real auth.
4. Production R2/D1 + flip `*.app.portaljs.com` wildcard → router, and
   `api.app.portaljs.com` → deploy API.

Give me account ID + a scoped API token + the staging bucket/db names and I can wire and
deploy to staging.
