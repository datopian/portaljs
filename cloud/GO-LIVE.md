# PortalJS Arc — production go-live runbook

Staging is live and verified. This is the checklist to take Arc to production at
`*.arc.portaljs.com`. Prod wrangler configs live in each worker's `[env.production]` block
(deploy with `--env production`).

## Already done (by prep)
- ✅ R2 bucket `portaljs-arc` created.
- ✅ D1 database `portaljs-arc` created (`ce13c71f-d039-45f3-95d0-f8005ed986e4`) + migrations applied (`users`, `tokens`, `projects`, `deployments`, `device_codes`).
- ✅ ACM certs cover `*.arc.portaljs.com`, `arc.portaljs.com`, `*.staging.arc.portaljs.com`, `portaljs.com`.
- ✅ `[env.production]` blocks in `cloud/{worker,api,auth}/wrangler.toml` (names `arc-router` / `arc-api` / `arc-auth`, prod bucket/DB/routes).

## Human steps remaining

### 1. DNS records (proxied) on the `portaljs.com` zone
Workers routes need a matching proxied DNS record. Add:
- `*.arc.portaljs.com` → e.g. `AAAA 100::` **proxied** (mirrors the staging `*.staging.arc` record). Covers tenant sites via the router.
- `arc.portaljs.com` → `AAAA 100::` **proxied** (dashboard/auth).
- `api.arc.portaljs.com` → `AAAA 100::` **proxied** (deploy API).

### 2. Production GitHub OAuth app
Create a NEW OAuth app (separate from staging):
- Homepage: `https://arc.portaljs.com`
- Callback: `https://arc.portaljs.com/auth/callback`
- Scope used: `read:user`

Put its **client ID** into `cloud/auth/wrangler.toml` → `[env.production.vars] GITHUB_CLIENT_ID`
(replacing `REPLACE_WITH_PROD_OAUTH_CLIENT_ID`). Client ID is not a secret.

### 3. Deploy the three workers
```bash
cd cloud/worker && npx wrangler deploy --env production   # arc-router → *.arc.portaljs.com
cd ../api       && npx wrangler deploy --env production   # arc-api    → api.arc.portaljs.com
cd ../auth      && npx wrangler deploy --env production   # arc-auth   → arc.portaljs.com
```

### 4. Production secrets (auth worker)
```bash
cd cloud/auth
npx wrangler secret put GITHUB_CLIENT_SECRET --env production   # from the prod OAuth app
npx wrangler secret put SESSION_SECRET --env production         # openssl rand -hex 32
npx wrangler secret put RESEND_API_KEY --env production         # passwordless email sign-in (po-e6j)
```
(Router + API need no secrets.)

### 4b. Email sign-in prerequisites (po-e6j)
Passwordless email needs a Resend-verified sender and the shared-D1 migration applied:
- Verify the `arc.portaljs.com` sending domain in Resend; confirm `[env.production.vars] EMAIL_FROM`
  in `cloud/auth/wrangler.toml` matches a verified address.
- Apply the new migration to the prod D1 (adds `users.email`/`auth_provider`/… + `email_logins`):
  ```bash
  cd cloud/api && npx wrangler d1 migrations apply portaljs-arc --remote
  ```

### 5. Smoke test (mirror the staging verification)
```bash
curl -s https://api.arc.portaljs.com/healthz                 # {"ok":true}
curl -s -o /dev/null -w "%{http_code}\n" https://api.arc.portaljs.com/v1/whoami   # 401
curl -s -o /dev/null -w "%{http_code}\n" https://arc.portaljs.com/auth/login      # 302 → github
```
Then a real end-to-end deploy (prod defaults, no `PORTALJS_ARC_*` overrides):
```bash
cd /tmp && npm create portaljs@latest prod-smoke && cd prod-smoke
/portaljs-deploy        # sign in → authorize → live at https://<slug>.arc.portaljs.com
```
Clean up the smoke portal afterwards (delete its R2 objects under `sites/<slug>/` + its D1 rows).

## Notes
- The `/portaljs-deploy` skill already defaults to prod (`arc.portaljs.com` / `api.arc.portaljs.com`); no override env vars needed once prod is live.
- Staging stays as-is — bare `wrangler deploy` (no `--env`) still targets the `-staging` workers.
