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
> `/architect` skill. It is the contract the build layer (data provider, data query,
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

## The `/architect` skill (design)

A new advisory skill that runs the framework as an interview and emits an
**architecture brief**, then hands off to the build skills.

**Interview (rounds, skippable with sensible defaults):**
1. **Building** — what kind of portal, and who runs it.
2. **Data** — volume, shape, update cadence, dataset count, sensitivity.
3. **Use** — publish/discover, analytics, redistribution, compliance/harvest.
4. **Constraints** — team size/skills, budget, cloud preference, existing backends.

**Output — an architecture brief:** the five-slot recommendation above, the reasoning
per axis, and the deviations chosen. Echoed for confirmation.

**Handoff:** the brief parameterizes the build skills — `/new-portal` (surfaces +
namespace mode), the storage/compute choice (Git-LFS+R2 / lakehouse / datastore), the
metadata profile (`/define-schema`), and any backend wiring (`/connect-ckan`,
`/connect-openmetadata`). The advisory layer decides; the build layer executes.

> The framework is intentionally small. It should give a confident default in seconds
> for the common case, and a defensible recommendation with trade-offs spelled out for
> the hard ones — never a blank page.
