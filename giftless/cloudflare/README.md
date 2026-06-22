# Giftless on Cloudflare Containers — live staging host

Runs the [`giftless/`](../) LFS-on-R2 image as a live HTTPS endpoint on **Cloudflare
Containers**, with a thin Worker in front for TLS + routing. This is the infra
handoff from phase 2 (po-g9y.1, which produced the deployable image) made live
(po-g9y.10).

**Live staging endpoint:** `https://giftless-staging.datopian.workers.dev`

```
git-lfs client ──JWT──> Worker (edge TLS) ──> GiftlessContainer (:5000) ──presigned──> R2
                                                       │
                                          bytes go client <──────────────────────> R2 directly
```

The Worker forwards every request to a single warm container; Giftless brokers LFS
metadata and signs presigned R2 URLs. **File bytes never transit the Worker or the
container** — the client PUT/GETs R2 directly — so this is a light, low-bandwidth,
scale-to-zero workload.

## Why Containers (not a Worker)

Giftless is a long-running uwsgi/WSGI Python service; it can't run on the Workers
runtime. Cloudflare Containers run the Docker image as-is, fronted by a Worker for
hostname/TLS/edge. One account, one bill, one creds story with Arc (Workers + R2 are
already in CF account `83025b28472d6aa2bf5ae59f3724aa78`). Decision locked in
po-g9y.10; fallback is Fly.io (same image, the statelessness makes it portable).

## What's here

| File | Purpose |
|------|---------|
| `wrangler.jsonc` | Worker + container config: `[[containers]]` → `../Dockerfile.cloudflare`, DO binding, `v1` migration, `basic` instance, `workers_dev`. |
| `src/index.ts` | `GiftlessContainer` (port 5000, `sleepAfter=10m`, R2/JWT secrets → container env) + the fronting Worker (singleton route). |
| `../Dockerfile.cloudflare` | The CF image: extends `datopian/giftless:latest`, reuses `r2storage.py`+`giftless.yaml` (shared build context `..`), adds the entrypoint. |
| `container-entrypoint.sh` | Materializes `/etc/giftless/jwt_key` from `$GIFTLESS_JWT_KEY` (Containers have no secret-file mounts), then execs uwsgi. |
| `scripts/deploy.sh` | Push the 3 secrets, build the image, deploy the Worker. |
| `scripts/smoke-remote.sh` | Live JWT-secured push/pull round-trip + cold-start probe against the deployed endpoint. |

## Deploy

```bash
cd giftless && ./scripts/gen-key.sh        # writes ../giftless/jwt_key (the staging signing key)
cd cloudflare && npm install
./scripts/deploy.sh                         # secrets + build + deploy
```

`deploy.sh` reads R2 creds from `~/.config/portaljs/giftless-r2.env` and the JWT key
from `../jwt_key`, pushes them as Worker secrets (`R2_ACCESS_KEY_ID`,
`R2_SECRET_ACCESS_KEY`, `GIFTLESS_JWT_KEY`), then `wrangler deploy` builds the image,
pushes it to the CF registry, and rolls the Worker. **Secrets and `jwt_key` are never
committed** — `R2_ENDPOINT`/`R2_REGION` are the only non-secret values (in `[vars]`).

## Verify (live)

```bash
./scripts/smoke-remote.sh https://giftless-staging.datopian.workers.dev
```

Mints a client token, runs a full push → R2 → fresh-clone pull, asserts byte-exact,
asserts a no-token request is rejected (401), and prints cold vs warm latency.

**Verified 2026-06-22:** push+pull byte-exact (3 MB random), no-token → 401,
**cold start ≈ 3.4 s, warm ≈ 0.8 s.** Authenticating a git-lfs client is unchanged
from [`../README.md`](../README.md#authenticating-a-git-lfs-client) (mint a token,
`_jwt` Basic piggyback) — just point `lfs.url` at the endpoint above.

## Cold start (the bead's open CAVEAT — answered)

The container scales to zero after `sleepAfter` (10 m). The **first request after
idle wakes it: ≈ 3.4 s** (container boot + uwsgi); subsequent requests ≈ 0.8 s. This
matches Cloudflare's documented 2–3 s typical cold start. A git push/pull after idle
pays this once, then runs warm. **Acceptable for staging.** For production, trade cost
for latency via a longer `sleepAfter`, a keep-warm ping, or a minimum instance.

## Go-live handoff (remaining for production)

Mirrors [`../../cloud/INFRA.md`](../../cloud/INFRA.md) — staging runs on `workers.dev`;
these are the prod prerequisites:

1. **Custom hostname** — e.g. `lfs.staging.portaljs.com` / `lfs.portaljs.com`. Add a
   proxied DNS record + a Workers route (uncomment in `wrangler.jsonc`), and an **ACM**
   cert covering it (Universal SSL does not cover multi-label subdomains — see
   `cloud/INFRA.md` §2b). Until then the `workers.dev` URL is the endpoint.
2. **RS256 split keys** — staging uses HS256 (one shared secret in the
   `GIFTLESS_JWT_KEY` secret). For prod, give Giftless only the public key to verify
   client tokens and hold the private signer in the issuer (Arc API/CI), with a
   separate keypair for Giftless's own verify callbacks. See
   [`../README.md`](../README.md#jwt-model-staging-vs-production). Flip `algorithm` +
   key paths in `giftless.yaml`.
3. **Prod R2 bucket + CORS** — provision `portaljs-giftless` (prod) and apply
   `../r2-cors.json` (`../scripts/set-r2-cors.sh`). CORS for browser range fetch is
   already verified on the staging bucket (po-g9y.2).
