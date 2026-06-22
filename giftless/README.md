# Giftless on Cloudflare R2 — staging deployment

A deployable [Giftless](https://github.com/datopian/giftless) (Datopian's pluggable
Git LFS server) configured to stream LFS objects to a **Cloudflare R2** bucket over
its S3-compatible API, authenticated with **JWT**. This is the LFS endpoint behind
the PortalJS data-scaling epic (po-g9y): large files are tracked by Git LFS, the
bytes land in R2, and only a tiny pointer stays in git.

The S3⇄R2 round-trip was de-risked in spike **po-e24** (119 MB CSV, byte-exact).
This phase swaps the spike's anonymous auth for the bundled JWT provider and
packages everything as deployable artifacts.

## What's here

| File | Purpose |
|------|---------|
| `Dockerfile` | Extends `datopian/giftless:latest`, bakes in the R2 backend + config. |
| `r2storage.py` | 3-line `AmazonS3Storage` subclass that points boto3 at the R2 endpoint (the stock 0.5.0 adapter can't take a custom endpoint — see po-e24). |
| `giftless.yaml` | Config: JWT auth (no anon), `basic` transfer → `R2Storage`, JWT-signed verify callbacks. |
| `docker-compose.yml` | One-command run; reads R2 creds from `.env`, key from `./jwt_key`. |
| `mint-token.py` | Mint a client JWT for a repo (HS256, stdlib only — no deps). |
| `r2-cors.json` | CORS policy for the data bucket — browser range fetch (phase 3). |
| `scripts/gen-key.sh` | Generate the HS256 signing key (`./jwt_key`). |
| `scripts/smoke-test.sh` | Build → run → JWT-secured LFS round-trip to R2 → assert no-token is rejected. |
| `scripts/set-r2-cors.sh` | Apply `r2-cors.json` to an R2 bucket (via wrangler). |
| `scripts/verify-r2-cors.py` | Prove a browser CORS ranged GET works against R2. |

`jwt_key` and `.env` are gitignored — **never commit them**.

## Why these choices (from po-e24)

- **Docker image, not `pip install giftless`** — giftless 0.5.0 breaks on modern deps
  (marshmallow 4 dropped `missing=`, Flask 3, …). The image pins a working set.
- **`R2Storage` subclass** — the bundled botocore (1.20.54) is too old to honor
  `AWS_ENDPOINT_URL`, so we rebuild the boto3 clients with `endpoint_url` +
  path-style + SigV4.
- **`basic` transfer (presigned, direct-to-R2)** — sufficient for files < ~5 GB
  (R2 single-PUT limit). `multipart-basic` deferred until individual files exceed that.
- **`--http`, not the image's default uwsgi socket** — so a reverse proxy / LB fronts it.

## Run it locally (against the real R2 staging bucket)

```bash
cd giftless
cp .env.example .env            # fill in R2 creds, or:
                                # set -a && . ~/.config/portaljs/giftless-r2.env && set +a
./scripts/gen-key.sh            # writes ./jwt_key (the JWT signing secret)
docker compose up --build -d    # serves on http://localhost:8080
```

Verify end-to-end (build, round-trip, teardown):

```bash
./scripts/smoke-test.sh
```

## Authenticating a Git LFS client

Giftless authorizes each request from the `scopes` claim in the JWT. Mint a token
scoped to one repo, then point Git LFS at the server.

```bash
TOKEN=$(python3 mint-token.py --org datopian --repo my-catalog --ttl 3600)
```

The JWT provider accepts the token two ways:

- **HTTP Basic piggyback** (recommended for git-lfs): username `_jwt`, password = token.
  Keep the committed `.lfsconfig` clean and put the credentialed URL in **local**
  config only:

  ```bash
  git config -f .lfsconfig lfs.url https://giftless.example/datopian/my-catalog   # committed, no secret
  git config           lfs.url https://_jwt:$TOKEN@giftless.example/datopian/my-catalog  # local only
  ```

- **Bearer header**: `Authorization: Bearer <token>`.

> **Gotcha:** do **not** use a broad `http.extraHeader = Authorization: …`. git-lfs
> would replay it onto the presigned R2 PUT (R2 → `400`, conflicting auth) and onto
> the verify callback (clobbers Giftless's own verify token). The `_jwt` Basic
> piggyback is scoped by git-lfs to the LFS API host only, which avoids both.

### Scope format

```
obj:{org}/{repo}/{oid}:{actions}      # actions: read,write,verify  (or *)
```

`mint-token.py` grants `obj:<org>/<repo>/*:read,write,verify` (all objects in one
repo). Use `--actions read` for a read-only (pull) token.

## JWT model: staging vs production

**Staging (this config): HS256, one shared secret** in `jwt_key`. Giftless uses it
to both verify client tokens and sign its own short-lived "verify" callbacks
(`PRE_AUTHORIZED_ACTION_PROVIDER`). Fine while we are the only token issuer.

**Production hardening: RS256, split keys.** Give Giftless only the **public** key
to verify client tokens (`public_key_file`), and hold the **private** signing key
in the token issuer (the Arc API / CI). Giftless still needs a private key to sign
its own verify callbacks — use a separate dedicated keypair for
`PRE_AUTHORIZED_ACTION_PROVIDER`. This way a Giftless host compromise can't mint
client tokens. Set `algorithm: RS256` and the `*_key_file` paths in `giftless.yaml`.

## Deploying to a live staging host (infra handoff)

> **Live (po-g9y.10):** this image now runs on **Cloudflare Containers** at
> `https://giftless-staging.datopian.workers.dev`. The deploy (Worker + container
> config, secret wiring, runbook) lives in [`cloudflare/`](cloudflare/) —
> `cd cloudflare && ./scripts/deploy.sh`, verify with `./scripts/smoke-remote.sh`.
> The remaining go-live items (custom hostname, RS256) are tracked in
> [`cloudflare/README.md`](cloudflare/README.md#go-live-handoff-remaining-for-production).
> The generic checklist below is retained for reference / alternative hosts.

Giftless is a long-running Python/uwsgi container — it does **not** run on
Cloudflare Workers (unlike the Arc workers in `cloud/`). A live
`giftless.staging.portaljs.com` needs, mirroring `cloud/INFRA.md`:

1. **A container host** — Cloudflare Containers, Fly.io, Render, or a small VM.
   Run the image from this `Dockerfile`.
2. **R2** — bucket `portaljs-giftless-staging` already exists (account
   `83025b28472d6aa2bf5ae59f3724aa78`); scoped token creds at
   `~/.config/portaljs/giftless-r2.env`.
3. **Secrets on the host** — R2 creds as `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`
   + `R2_ENDPOINT`; the JWT key mounted at `/etc/giftless/jwt_key` (a platform secret,
   not the repo).
4. **DNS + TLS** — a hostname pointed at the container, HTTPS terminated (LB or the
   platform's edge). Giftless serves plain HTTP on `:5000` behind it.
5. **R2 bucket CORS** — required for **browser** range fetches in the later
   DuckDB-over-Parquet tier. **Verified** in phase 3 (po-g9y.2) — see below.

Until a host is provisioned, the smoke test stands the server up locally against the
real R2 bucket and proves the full JWT-secured round-trip.

## R2 CORS for browser range fetch (phase 3, po-g9y.2)

The query tier (DuckDB-Wasm over Parquet) has the browser issue cross-origin HTTP
**range** requests straight at R2. That needs CORS on the bucket, exposing the
range-response headers. The policy lives in [`r2-cors.json`](r2-cors.json):
`GET`/`HEAD` from any origin, `range` allowed on the request, and
`Content-Range` / `Accept-Ranges` / `Content-Length` / `ETag` / `Content-Type`
exposed to the page.

```bash
./scripts/set-r2-cors.sh              # apply r2-cors.json to the bucket (uses wrangler)
python3 scripts/verify-r2-cors.py     # prove a real ranged GET + preflight works
```

> **Why wrangler, not the R2 token?** Bucket-level CORS (`PutBucketCors`) is an
> account operation; the object-scoped R2 token Giftless uses gets `AccessDenied`.
> `set-r2-cors.sh` uses wrangler (account-authenticated). The verify script only
> needs the object token — it presigns a GET (exactly what Giftless's `basic`
> transfer hands the browser) and checks the CORS + range response.

**Verified against `portaljs-giftless-staging` (2026-06-21):** OPTIONS preflight →
`204` with `Access-Control-Allow-*`; ranged `GET` → `206 Partial Content`,
`Content-Range: bytes 0-9/200`, `Accept-Ranges: bytes`, `Access-Control-Allow-Origin`
and `Access-Control-Expose-Headers` present. The spike's open question — *does
browser range fetch work against R2?* — is answered: **yes.**

Apply this same policy to any data bucket a deployed portal serves from
(`./scripts/set-r2-cors.sh <bucket>`).
