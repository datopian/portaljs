# PortalJS Cloud — managed static hosting + `/deploy`

Status: **design** (epic `po-x8x`). Architecture locked 2026-06-15.

PortalJS Cloud is Datopian-managed static hosting for PortalJS portals. The `/deploy`
skill has **one target** — PortalJS Cloud. A user runs `/deploy`, authenticates once, and
gets a live `https://<slug>.portaljs.com` serving their static build. Users who want their
own host (Vercel, their own Cloudflare, Netlify, …) self-serve; the skill does not cover
that.

Static export only for now (no SSR). Cloudflare-native throughout, so every piece is
locally testable with `wrangler dev` / Miniflare before real DNS is involved.

## User experience

```
$ /deploy
→ first run: "Sign in to PortalJS Cloud" → cloud.portaljs.com → paste token (or device code)
→ next build (static export) → out/
→ uploading to PortalJS Cloud…
✓ Live at https://my-portal.portaljs.com
```

Re-running `/deploy` updates the same site (idempotent, keyed on the project slug).

## Architecture

```
  /deploy skill ──tar(out/)+token──▶  Deploy API (Worker)  ──put──▶  R2: portals/<user>/<slug>/…
   (in portal repo)                     POST /v1/deploy                       │
                                        validate token (D1)                   │
                                        record deployment (D1)                │
        browser ◀── https://<slug>.portaljs.com ◀── Router Worker ◀──get──────┘
                         (wildcard *.portaljs.com → Worker, serves from R2)
```

Two Workers (or one Worker with two route groups), one R2 bucket, one D1 database.

- **R2** — object store for all tenants' static files: `portals/<user>/<slug>/<path>`.
- **Router Worker** — bound to `*.portaljs.com`; resolves the hostname's `<slug>` to a
  tenant and streams assets from R2.
- **Deploy API (Worker)** — `POST /v1/deploy`; authenticates, writes the upload to R2,
  records the deployment.
- **D1** — relational state: `users`, `tokens`, `projects`, `deployments`.
- **Auth app** — `cloud.portaljs.com`: GitHub OAuth sign-up + API-token issuance.

### Why R2 + Worker (not Pages-per-project)
Wildcard `*.portaljs.com` → one Worker means **zero per-tenant DNS/provisioning** and scale
to many thousands of portals, with no Cloudflare Pages project/custom-domain limits. Pages
becomes an implementation detail we've wrapped away.

## URL & namespace scheme

- Public URL: `https://<slug>.<cloud-zone>` where `<cloud-zone>` is **TBD** — see *Legacy
  coexistence* below. Either bare `portaljs.com` (with safeguards) or a dedicated namespace
  like `app.portaljs.com` / a separate `portaljs.cloud` zone.
- `<slug>` is unique within the cloud zone (it's a hostname). On collision at deploy time,
  the API suffixes (`<slug>-2`) or namespaces under the user — final scheme TBD, see Open
  questions.
- **Reserved subdomains** (never assignable): `www docs app api cloud blog status
  staging admin assets cdn` (+ **every existing host in the `portaljs.com` zone** — built
  from a live inventory, not a guess).

## Legacy `*.portaljs.com` coexistence (must resolve before prod DNS)

Legacy PortalJS Cloud customers already deploy at `<prefix>.portaljs.com`. A wildcard
`*.portaljs.com` → Router Worker must not break them.

**Cloudflare precedence (the safety net):** a specific DNS record always wins over a
wildcard, and Workers match the most specific route. So a legacy customer with an explicit
`customer.portaljs.com` record/route is **not** shadowed by our wildcard — the wildcard
only catches hostnames with no explicit record.

**Residual risks:** (a) legacy customers served *by* a wildcard/router rather than explicit
per-customer records; (b) informal/unclaimed names; (c) a new user's slug colliding with an
existing customer's prefix.

**Plan (in order of safety):**
1. **Dedicated namespace (recommended).** Point the wildcard at a namespace legacy never
   used — `*.app.portaljs.com` or a separate zone `*.portaljs.cloud` — so new deploys cannot
   collide with anything on bare `portaljs.com`. Still presented as "PortalJS Cloud."
2. **Inventory + reserved-list.** Before any wildcard, enumerate every existing
   `portaljs.com` subdomain in the Cloudflare zone; bake them into the Worker reserved list
   and confirm each has an explicit record (so DNS specificity protects it).
3. **Staging-first.** Validate on `*.staging.portaljs.com`; never flip the bare
   `*.portaljs.com` wildcard until 1–2 are confirmed.

If bare `<slug>.portaljs.com` is required (not a dedicated namespace), then **(2) + (3) are
mandatory** and the deploy API must reject any slug already present in the zone inventory.

## R2 layout

```
portals/<user_id>/<slug>/
  index.html
  _next/static/…            # hashed assets, immutable
  data/…                    # /public/data files (download-mode portals)
  …                         # everything from out/
```

Object metadata carries `content-type` (from extension) and a `deployment_id` for cache
busting. A small `manifest.json` per deploy lists files for atomic switchover and cleanup
of the previous deployment.

## Components

### 1. Router Worker (`cloud/worker/`) — bead `po-2xm`
- Bound to `*.portaljs.com`. Extract `<slug>` from `Host`.
- Reserved/marketing hostnames → pass through / 404 (not served from R2).
- Look up `<slug>` → `<user_id>` (D1, cached in the Worker's in-memory/KV cache).
- Resolve the request path in R2:
  - exact key → serve;
  - directory (`/` or no extension) → `…/index.html`;
  - miss → `404.html` if present, else a default 404.
- Headers: correct `content-type`; long-lived immutable cache for `_next/static/*`;
  `no-cache`/short TTL for HTML.
- Unknown slug → branded "portal not found" page.
- **Local test:** `wrangler dev` + Miniflare R2; seed a fake portal, assert routing,
  index resolution, content-types, 404s.

### 2. Deploy API Worker (`cloud/api/`) — bead `po-bn9`
- `POST /v1/deploy` — multipart/tar body + `slug`; `Authorization: Bearer <token>`.
  1. Validate token (D1 `tokens` → `user_id`); 401 on failure.
  2. Resolve/allocate `<slug>` for this user; reject reserved slugs.
  3. Unpack the bundle; `put` each file to `portals/<user>/<slug>/…`; write `manifest.json`.
  4. Record a `deployments` row (status, file count, bytes, timestamp).
  5. Delete the prior deployment's orphaned objects (atomic-ish switch).
  6. Return `{ url: "https://<slug>.portaljs.com", deployment_id, status }`.
- `GET /v1/deploy/:id` — status (for the skill to poll, if upload is async).
- Limits: max bundle size, file count, per-user project cap (configurable).
- **Local test:** `wrangler dev`; POST a sample `out/`; assert R2 contents + D1 row + URL.

### 3. Auth — `cloud.portaljs.com` (`cloud/auth/`) — bead `po-5vk`
- GitHub OAuth → create `users` row; UI to generate/revoke API tokens.
- Client login: `npx portaljs login` (or folded into the skill) → device-code or
  paste-token → write `~/.portaljs/credentials` (`{ token, api }`). `PORTALJS_TOKEN` env
  overrides (CI).
- API tokens are opaque, hashed at rest in D1.

### 4. `/deploy` skill rewrite (`.claude/commands/deploy.md`) — bead `po-4yq`
- Single target. Steps: ensure `output: 'export'` in `next.config.js` → `next build` →
  verify `out/` → ensure auth (run login if no creds) → tar `out/` → `POST /v1/deploy` →
  poll → print `https://<slug>.portaljs.com`. Never report success on a failing build.
- Slug defaults to the project slug (from `package.json`/dir), overridable with a flag.
- Drop the Vercel/static-host branching; add a one-line "to self-host elsewhere, run
  `next build && next export` and upload `out/` to any static host."

### 5. Docs (`site/content/docs/…`) — bead `po-xqq`
- Rewrite the `/deploy` skill page to the single target; add a PortalJS Cloud concept page.

## D1 schema (draft)

```sql
users(id TEXT PK, github_id INTEGER UNIQUE, login TEXT, created_at)
tokens(id TEXT PK, user_id TEXT, hash TEXT UNIQUE, label TEXT, created_at, revoked_at)
projects(id TEXT PK, user_id TEXT, slug TEXT UNIQUE, created_at)        -- slug = hostname label
deployments(id TEXT PK, project_id TEXT, status TEXT, files INT, bytes INT, created_at)
```

## Build / test plan

1. **Worker (po-2xm)** + **API (po-bn9)** built and tested **locally** (wrangler/Miniflare,
   mock R2 + D1) against this contract — no real Cloudflare needed.
2. **Skill (po-4yq)** built against the API contract; tested against the local API.
3. **Auth (po-5vk)** — GitHub OAuth needs a real app; can stub token validation locally.
4. **Staging**: deploy to the real Cloudflare account on a staging subdomain
   (`*.staging.portaljs.com`), end-to-end test.
5. Flip `*.portaljs.com` wildcard to the Router Worker.

## Infra handoff (Datopian-provisioned)

See `cloud/INFRA.md`.

## Open questions

- **Slug scheme** — global-unique with suffixing, or always per-user namespace? (Affects
  URL aesthetics vs collision UX.)
- **Custom domains** — let users map their own domain to a portal later? (Cloudflare for
  SaaS / CNAME.) Out of scope for v1, but the data model should not preclude it.
- **Quotas/pricing** — free tier limits (projects, bytes, bandwidth)? Ties into the pricing
  page.
- **Auth UX** — device-code flow vs paste-token for v1. Paste-token is simplest to ship.
- **Repo location** — keep `cloud/` in the monorepo, or extract to `datopian/portaljs-cloud`
  once it stabilizes? (Defaulting to monorepo for now.)
