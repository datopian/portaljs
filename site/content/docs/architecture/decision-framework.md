---
metatitle: PortalJS Architecture Decision Framework
metadescription: How PortalJS skills recommend a data architecture — storage, compute, catalog, access, and hosting — from what you're building, what your data is, and what it's for.
title: Architecture decision framework
description: The advisory layer — how the skills turn three questions about your needs into a concrete, scaffoldable stack.
---

PortalJS doesn't just build a portal; it helps you **decide what to build**. This is
the advisory layer: a small set of questions that map your needs onto a concrete
architecture the build skills can then scaffold. It is opinionated by default and
explicit about when to deviate.

> Status: **design / Phase 1.** This document specifies the framework and the
> `/portaljs-architect` skill. It is the contract the build layer (data provider, data query,
> metadata, RBAC) is designed against — see the [Roadmap](https://github.com/datopian/portaljs/blob/main/ROADMAP.md).

## Three questions

Every recommendation comes from three questions:

1. **What are you building?** An open-data portal, an internal data catalog, a
   project/research data site, a public-sector portal with harvesting obligations…
2. **What is your data?** Size, shape (tabular / geospatial / documents), update
   frequency, number of datasets, sensitivity.
3. **What is it for?** Publishing/discovery, analytics/querying, redistribution,
   compliance, machine-to-machine harvesting.

## Decision axes

The answers resolve into a handful of axes. Each pushes the recommendation along the
[storage + compute spectrum](https://github.com/datopian/portaljs/blob/main/ROADMAP.md#the-storage--compute-spectrum).

| Axis | Low → High | Pulls toward |
|------|-----------|--------------|
| **Data volume** | KBs → TBs | flat files → Git-LFS+R2 → lakehouse |
| **Query needs** | "show me the rows" → "aggregate/join/filter" | flat preview → DuckDB → datastore |
| **Update frequency** | rare, by-hand → continuous | git/gitops → pipeline/CDC |
| **# of datasets** | a handful → hundreds+ | single-page → catalog → search backend |
| **Access control** | fully public → role-based private | static → backend RBAC (runtime) |
| **Openness/interop** | internal only → standards-compliant harvest | plain → DCAT profiles |
| **Team & budget** | small/cheap/git-native → large/funded/SQL-native | git+R2+DuckDB → warehouse/CKAN |

## The recommendation

Each axis-set resolves into a stack across five slots:

| Slot | Options (default in **bold**) |
|------|-------------------------------|
| **Storage** | repo files · **Git-LFS + R2** · Parquet on R2 · CKAN datastore / warehouse |
| **Catalog** | `datasets.json` · git + Frictionless · **DuckLake** · backend-native |
| **Compute** | papaparse · **DuckDB** (Wasm → server) · warehouse engine |
| **Access** | **static (public)** · runtime + backend RBAC |
| **Hosting** | **Cloudflare Pages** (static) · Cloudflare Workers (runtime) · any static host |
| **Metadata** | **Frictionless** profile · extended · custom · multi-profile + DCAT |

### Two knobs the build skills read directly

Two slots resolve to concrete values the build layer consumes — `/portaljs-architect` names
both in the brief:

- **Data tier** (`inline | LFS | external`) — the Storage slot as **per-dataset** byte
  routing `/portaljs-add-dataset` applies. `inline` = committed to `public/data/` (fenced:
  sample data / no-R2 self-host); `LFS` = streamed to R2 via Giftless, pointer in git (the
  default for added data); `external` = recorded as an absolute URL, copied nowhere
  (passthrough; includes Parquet-on-R2 queried in place).
- **Query mode** (`DATA_QUERY = flat | duckdb`) — the Compute slot as a **portal-wide**
  constant in `lib/datasets.ts`. `flat` = papaparse preview (default); `duckdb` = in-browser
  DuckDB-Wasm SQL query view. A Parquet resource renders the query view regardless.

### Opinionated defaults

When in doubt, PortalJS recommends the **open, cheap, composable** path:

- **git + giftless/R2 + Parquet + DuckLake + DuckDB**, static on **Cloudflare Pages**,
  Frictionless metadata.
- Storage stays **S3-compatible**, so R2 is the default but never a lock-in.
- DuckDB is the query engine everywhere — client-side (Wasm) until data size or
  privacy forces a server (Cloudflare Workers).

### When to deviate

- **Role-based private data, multi-team governance** → a backend that owns RBAC
  (**CKAN** or **OpenMetadata**) + the runtime mode. The portal surfaces it.
- **Existing warehouse / SQL-native team** → keep the warehouse as the datastore; the
  data-query contract has a datastore implementation.
- **Tiny, static, a handful of CSVs** → don't reach for the lakehouse; flat files +
  client-side preview is the whole stack.

## Cost & lock-in: why we push compute to the data

The defaults above aren't just an aesthetic preference for open source — they follow
from how the bill works. It's the main reason `/portaljs-architect` reaches for DuckDB over a
warehouse, and worth weighing explicitly when you architect a portal.

**Cloud warehouses bill per scan.** Snowflake, BigQuery, Databricks et al. charge for
the compute a query consumes, and a heavy join/aggregate re-scans the data **every time
it runs**. Put that on a schedule and the cost compounds. A community-reported example
a 1-billion-row join + aggregate that returns a ~2,000-row summary needs a Large
warehouse (~8 credits/hr, ~2 min/run) to finish — about **0.27 credits/run**. Using the
thread's assumptions (credit price and schedule, as reported in June 2026), refreshing
every 15 minutes is ~26 credits/day (about **$75/day ≈ $27,000/year**) for one pipeline.

**Push the compute to where the data lives.** The same workload runs in ~23 seconds on
a laptop with DuckDB reading Parquet directly — no cluster, no warehouse. The expensive
scan/join/aggregate happens locally (or at the edge in a Worker); the warehouse, if it's
in the picture at all, only **stores the small answer**. Recurring compute cost →
effectively **zero**. This is exactly PortalJS's compute slot: DuckDB-Wasm in the
browser, escalating to server-side DuckDB only when data size forces it — avoiding
warehouse per-scan charges for reader-driven filtering/aggregation, while still paying
normal runtime compute where the query executes.

**Open formats + object storage = no lock-in.** Parquet on S3-compatible storage (R2 by
default) is portable; you rent **storage** (cheap, flat) rather than **per-query compute**
from a single vendor. You can move the bytes to any S3 target and keep the same engine.

**The honest trade-off.** A warehouse still earns its place for genuinely huge data,
concurrent multi-user SQL, or a team already invested in one — that's the "existing
warehouse / SQL-native team" deviation above, and the data-query contract has a datastore
implementation for it. The point isn't *never a warehouse*; it's **don't pay a warehouse
to re-scan a billion rows every 15 minutes when DuckDB over Parquet does it for the price
of object storage.** When unsure, the cheap, portable path is the default.

## The `/portaljs-architect` skill (design)

A new advisory skill that runs the framework as an interview and emits an
**architecture brief**, then hands off to the build skills.

**Interview (rounds, skippable with sensible defaults):**
1. **Building** — what kind of portal, and who runs it.
2. **Data** — volume, shape, update cadence, dataset count, sensitivity.
3. **Use** — publish/discover, analytics, redistribution, compliance/harvest.
4. **Constraints** — team size/skills, budget, cloud preference, existing backends.

**Output — an architecture brief:** the five-slot recommendation above, the reasoning
per axis, and the deviations chosen. Echoed for confirmation.

**Handoff:** the brief parameterizes the build skills — `/portaljs-new-portal` (surfaces +
namespace mode), the storage/compute choice (Git-LFS+R2 / lakehouse / datastore), the
metadata profile (`/portaljs-define-schema`), and any backend wiring (`/portaljs-connect-ckan`,
`/connect-openmetadata`). The advisory layer decides; the build layer executes.

> The framework is intentionally small. It should give a confident default in seconds
> for the common case, and a defensible recommendation with trade-offs spelled out for
> the hard ones — never a blank page.
