# PortalJS Arc — infra handoff (Datopian)

What needs to exist on the Cloudflare side for PortalJS Arc to run. I build the Workers,
API, and skill against the contract in `SPEC.md` and test locally; this is what you
provision so we can go to staging → production.

Nothing here blocks local development — the Workers run on Miniflare with a mock R2/D1
until these exist.

## 1. Cloudflare account + zone
- A Cloudflare account for PortalJS Arc (the existing Datopian one is fine).
- The **`portaljs.com` zone** managed in that account (it already is, for the marketing site).

## 2. DNS
- A **wildcard** `*.arc.portaljs.com` record (proxied) pointed at the **Router Worker** (via
  a Workers route `*.arc.portaljs.com/*`). **Scoped to `arc.portaljs.com` on purpose** — it
  does NOT cover bare `<prefix>.portaljs.com`, so existing/legacy PortalJS Cloud customer
  subdomains are unaffected (different name level, outside the wildcard).
- For staging: `*.staging.arc.portaljs.com` → the staging Router Worker.
- Legacy `<prefix>.portaljs.com` records stay exactly as they are — no changes needed.

## 2b. TLS — Advanced Certificate Manager (REQUIRED)

**Universal SSL is not enough.** Cloudflare's free Universal SSL covers only `portaljs.com`
and the single-label wildcard `*.portaljs.com` — it does **not** cover `*.arc.portaljs.com`
(two labels deep) or `*.staging.arc.portaljs.com` (three deep). Without a matching cert the
edge returns a TLS handshake failure (confirmed on staging: `hello.staging.arc.portaljs.com`
→ `sslv3 alert handshake failure`).

Enable **Advanced Certificate Manager (ACM)** on the `portaljs.com` zone (~$10/mo) and order
advanced certificates (or turn on **Total TLS**) covering:
- `*.arc.portaljs.com` (production tenants) — plus `arc.portaljs.com` for the dashboard.
- `*.staging.arc.portaljs.com` (staging).

Certs take a few minutes to issue. (Alternative if you want to avoid ACM: a single-label
scheme like `arc-<slug>.portaljs.com` is covered by Universal SSL — but it gives up the clean
`arc.` namespace and reintroduces legacy-collision risk. ACM is the recommended path.)

## 3. R2
- One **R2 bucket** `portaljs-arc` for tenant static files (objects under `sites/<slug>/`),
  plus `portaljs-arc-staging` for staging.

## 4. D1
- One **D1 database** `portaljs-arc` for `users`/`tokens`/`projects`/`deployments` (schema in
  `SPEC.md`), plus `portaljs-arc-staging`.

## 5. Workers
- Three Workers (or one with routes): **router** (`*.arc.portaljs.com/*`), **deploy API**
  (`api.arc.portaljs.com/v1/*`), and the **auth app / dashboard** (`arc.portaljs.com` apex —
  GitHub OAuth + token issuance, bead po-5vk; the router + API are live first, auth lands
  with po-5vk). I author each `wrangler.toml` with the R2/D1 bindings; you confirm the
  routes + binding names.
- **Avoid `cloud.portaljs.com` and `api.portaljs.com`** — both are used by the legacy
  PortalJS Cloud app. The new system lives entirely under `arc.portaljs.com`
  (dashboard/auth at the `arc.portaljs.com` apex, API at `api.arc.portaljs.com`).

## 6. GitHub OAuth app (for auth — bead po-5vk)
The `cloud/auth` worker is built + deployed to staging; it just needs a GitHub OAuth app to
complete the live sign-in. Create one (Settings → Developer settings → OAuth Apps):
- **Staging** callback: `https://arc-auth-staging.datopian.workers.dev/auth/callback`
  (or a second app); **Production**: `https://arc.portaljs.com/auth/callback`.
- Hand me the **client ID** — I set it as the `GITHUB_CLIENT_ID` var and the
  **client secret** + a `SESSION_SECRET` (auto-generated) via `wrangler secret put`
  (`SESSION_SECRET` is already set on staging).
- Scope needed: `read:user` (just to identify the GitHub account).

## Secrets (via `wrangler secret put`, not in the repo)
- Deploys: I authenticate with `wrangler login` (OAuth) — **no `CLOUDFLARE_API_TOKEN` needed**.
  Only needed for headless CI, and then via a local gitignored env file, never in chat.
- `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET` (auth worker).
- A signing secret for API tokens (`TOKEN_SIGNING_KEY`).

## Suggested order
1. R2 bucket + D1 db (staging) → unblocks API/Worker staging tests. ✅ done
2. Wildcard `*.staging.arc.portaljs.com` (proxied) → staging router. ✅ done
3. **Enable ACM + order a `*.staging.arc.portaljs.com` cert** → unblocks HTTPS on staging
   tenant URLs (currently blocked by the TLS handshake failure). ← **next**
4. (+ `api.staging.arc.portaljs.com` → staging deploy API) → end-to-end staging.
5. GitHub OAuth app (`arc.portaljs.com`) → real auth.
6. Production: R2/D1 (`portaljs-arc`) + ACM cert for `*.arc.portaljs.com` + flip the
   `*.arc.portaljs.com` wildcard → router, and `api.arc.portaljs.com` → deploy API.

Auth: I use `wrangler login` (OAuth) for deploys — no API token needed. If a token is ever
required (CI), provide it via a local gitignored env file, never in chat.
