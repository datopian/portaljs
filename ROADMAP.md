# PortalJS Roadmap

> Direction and sequencing for the PortalJS revamp. Living document — decisions here
> are revisited as we learn. For the conceptual model behind the product, see
> [Core concepts](site/content/docs/core-concepts.md); for the architecture decision
> layer, see [the decision framework](site/content/docs/architecture/decision-framework.md).

## What PortalJS is

PortalJS is an **agentic skills framework that helps data teams build, develop, and
ship data portals — and the data infrastructure underneath them.** It is not only a
frontend layer. The skills do two jobs:

- **Advise** — given *what you're building*, *what your data is*, and *what it's for*,
  recommend an architecture (storage, compute, catalog, access, hosting).
- **Build** — scaffold the chosen stack as plain, editable code with no lock-in.

The product is organized into three layers:

| Layer | What it does | Built from |
|-------|--------------|-----------|
| **Decision** | Advises on architecture from the team's needs | Advisory skills (e.g. `/portaljs-architect`) |
| **Build** | Scaffolds + wires the chosen stack | Generative skills + the contracts below |
| **Presentation** | The portal users see | The three surfaces (Home / Catalog / Showcase) |

## The four contracts

Everything in the Build layer plugs into one of four file-declarative, pluggable
contracts. Each has a static/none default and richer backend implementations, so
simple stays simple.

| Contract | Static default | Scales to | Drives |
|----------|----------------|-----------|--------|
| **Metadata profile** | Frictionless Tabular Data Package | extend → custom → multi-profile; DCAT interop | catalog facets, showcase metadata |
| **Data provider** | git files (`datasets.json`) | git+LFS, lakehouse, CKAN, OpenMetadata | what feeds all three surfaces |
| **Data query** | flat CSV fetch | DuckDB-Wasm → server/remote DuckDB | showcase preview + views |
| **Auth / RBAC** | none (repo permissions) | CKAN / OIDC / OpenMetadata | visibility + edit across surfaces |

The recurring axis through all four is **build-time (static) vs request-time
(runtime)**. We stay **static-first**; runtime is an explicit opt-in mode, unlocked
when a portal needs private data, live search, or write access — never a rewrite.

## The storage + compute spectrum

The data provider and data query contracts together span a spectrum the advisory
layer reasons over — open/composable/cheap on the left, traditional/heavy on the right:

| | Flat files | **Git-LFS + R2** | **Open lakehouse** | Warehouse / datastore |
|---|---|---|---|---|
| **Storage** | repo | R2 via giftless (Git LFS) | Parquet on R2 | Postgres / CKAN datastore / Snowflake |
| **Catalog** | `datasets.json` | git + Frictionless | DuckLake (catalog in SQL) | warehouse-native |
| **Compute** | papaparse | DuckDB-Wasm | DuckDB (Wasm or server) | warehouse SQL engine |
| **Versioning** | git | git + LFS | git + table snapshots | none / CDC |
| **Best for** | a few small files | large files, gitops workflow | analytics-grade, open, cheap | large internal/SQL, RBAC-native |

**Opinionated modern default:** `git + giftless/R2 + Parquet + DuckLake + DuckDB` —
open formats, object storage, bring-your-own-compute, no warehouse lock-in. The
warehouse/CKAN column stays a fully supported choice for teams that need it. DuckDB is
the through-line: it queries Parquet/CSV directly off object storage, client (Wasm) or
server.

### Where giftless fits

[giftless](https://github.com/datopian/giftless) is Datopian's pluggable **Git LFS
server**. It is the git tier's **ingest + versioning plane**: git versions metadata and
LFS *pointers* (Frictionless packages, profiles, config) and giftless moves the actual
bytes to blob storage. It keeps large data out of the repo, makes a `git push` / PR the
way data enters and is versioned, and is the on-ramp to the lakehouse — the same R2
bucket that holds LFS blobs holds the Parquet that DuckLake + DuckDB query.

## Cloudflare-first (R2-portable)

We champion Cloudflare as the default substrate, but keep storage S3-compatible so R2
is never a hard lock-in.

| Cloudflare | Role |
|-----------|------|
| **R2** | object storage — LFS blobs + Parquet (S3-compatible; swappable for S3/GCS/Azure) |
| **Workers** | the opt-in **runtime** — SSR, auth/RBAC, server-side DuckDB, LFS endpoints |
| **D1** | DuckLake catalog / metadata index |
| **Pages** | static hosting for the build-time portal |

The static-first → runtime fork is concretely **Pages → Workers**.

## Sequencing

1. **Advisory / decision layer** *(next — Phase 1)* — the needs→architecture framework
   and an `/portaljs-architect` interview skill. Defines *what* the build layer produces. See
   [decision-framework.md](site/content/docs/architecture/decision-framework.md).
2. **Data-provider contract** — the storage+compute+catalog seam every surface consumes;
   refactor the static path onto it; design-in giftless/LFS+R2 (wire later); refactor
   `/portaljs-connect-ckan` onto it.
3. **Metadata profile layer** ∥ **DuckDB data query** — parallel; both static-friendly,
   high visible value.
4. **DCAT interop** — export then import, layered on the profile layer (interop over a
   Frictionless-native model, not the native model).
5. **RBAC + runtime mode** — auth provider + visibility + Pages→Workers. Last; only
   advanced/multi-team portals need it.

## Shipped so far

- Three-surface product model — Home `/`, Catalog `/search`, Showcase
  `/@<namespace>/<slug>` (#1536).
- Interactive skills — interview in rounds, never dead-end on missing input (#1537).
- Docs teaching the three concepts + aligned routes (#1538).
