---
description: Recommend a data-portal architecture (storage, compute, catalog, access, hosting, metadata) from your needs, then hand off to the build skills. The advisory entry point.
allowed-tools: Read, Write, Bash
---

# /portaljs-architect

The **advisory** skill. Before scaffolding anything, it works out *what* to build:
given what you're building, what your data is, and what it's for, it recommends a
concrete architecture and then hands off to the build skills (`/portaljs-new-portal`,
`/portaljs-add-dataset`, `/portaljs-connect-ckan`, …). It **decides**; it does not build.

The skill is **interactive**: if the brief is thin it interviews you in short rounds,
echoes an architecture brief for confirmation, and **never dead-ends on missing
input** — every question has a sensible default; say **"use defaults"** to take them.

See [the decision framework](../../site/content/docs/architecture/decision-framework.md)
and [ROADMAP.md](../../ROADMAP.md) for the full model this skill encodes.

## What it recommends — six slots

Every recommendation fills six slots. The **bold** option is the default when nothing
pulls you off it.

| Slot | Options (default in **bold**) |
|------|-------------------------------|
| **Storage** | repo files · **Git-LFS + R2** · Parquet on R2 · CKAN datastore / warehouse |
| **Catalog** | `datasets.json` · git + Frictionless · **DuckLake** · backend-native |
| **Compute** | papaparse preview · **DuckDB** (Wasm → server) · warehouse engine |
| **Access** | **static (public)** · runtime + backend RBAC |
| **Hosting** | **Cloudflare Pages** (static) · Cloudflare Workers (runtime) · any static host |
| **Metadata** | **Frictionless** profile · extended · custom · multi-profile + DCAT |

Opinionated default stack: `git + giftless/R2 + Parquet + DuckLake + DuckDB`, static on
Cloudflare Pages, Frictionless metadata. Storage stays **S3-compatible**, so R2 is the
default but never a hard lock-in.

### The two build-time knobs this skill sets

Six slots describe the architecture, but two of them resolve to concrete values the build
skills read directly. Name both explicitly in the brief — they are what gets *built*:

- **Data tier** — where a dataset's *bytes* live: `inline | LFS | external`. This is the
  Storage slot made concrete, and it is **per-dataset routing** `/portaljs-add-dataset`
  applies (see its source-then-size matrix):
  - **inline** — bytes committed to `public/data/`. A fenced exception only: the template's
    bundled sample data, or an OSS self-host with no R2 creds. Get-started-fast, zero creds.
  - **LFS** — bytes stream to Cloudflare R2 via Giftless (Git LFS); a ~134 B pointer stays
    in git. **The default for any data the user adds**, regardless of size or format.
  - **external** — bytes already live at a URL (R2 or 3rd-party); the manifest records the
    absolute URL and copies nothing (passthrough). Parquet-on-R2 queried in place lives here.
- **Query mode** — how the showcase *computes* over a dataset: the `DATA_QUERY` constant in
  `lib/datasets.ts`, `flat | duckdb`. This is the Compute slot made concrete, and it is
  **portal-wide**:
  - **flat** — fetch + preview the file with papaparse. Lightest; the template default.
  - **duckdb** — load the file into in-browser DuckDB-Wasm and expose a SQL query view
    (filter/aggregate/join, no server). A Parquet resource always renders the query view
    regardless; `duckdb` opts CSV/TSV in too.

## Steps

### 1. Interview the user (skip rounds already answered by `$ARGUMENTS`)

Parse `$ARGUMENTS` first and pre-fill anything it specifies. Then ask only for what's
missing, **one round at a time** (wait for each answer). Tell the user they can reply
"use defaults".

**Round 1 — What are you building?**
```
Round 1 of 4 — the portal.
1. What kind of portal? (open-data portal · internal data catalog · research/project
   data site · public-sector portal with harvesting obligations · something else)
2. Who runs it — one team/publisher, or several?
```

**Round 2 — What is your data?**
```
Round 2 of 4 — the data.
1. Roughly how big? (KBs/MBs · GBs · TBs)
2. What shape? (tabular CSV · geospatial/GeoJSON · documents · mixed)
3. How often does it change? (rarely, by hand · regularly · continuously)
4. How many datasets? (a handful · dozens · hundreds+)
5. Any of it private / access-controlled? (no, all public · yes)
```
If the user points at actual files or a directory, inspect them to ground the answers
instead of guessing — e.g. size and row counts:
```bash
# Replace PATHS with the files/dirs the user named.
du -sh PATHS 2>/dev/null
for f in PATHS; do [ -f "$f" ] && printf '%s: ' "$f" && { wc -l < "$f" 2>/dev/null || echo '?'; }; done
```

**Round 3 — What is it for?**
```
Round 3 of 4 — the purpose (pick any that apply).
  - publishing & discovery (people find and download datasets)
  - analytics / querying (filter, aggregate, join the data)
  - redistribution / machine-to-machine harvesting (e.g. DCAT to data.europa.eu)
  - compliance with a metadata standard (DCAT-AP, a national or domain profile)
```

**Round 4 — Constraints.**
```
Round 4 of 4 — constraints (all optional; Enter to skip).
  - team size / SQL comfort?
  - budget sensitivity?
  - cloud preference? (default: Cloudflare — R2/Workers/Pages, S3-compatible)
  - any existing backend to keep? (e.g. a CKAN or OpenMetadata instance)
```

**Defaults if a round is skipped:** open-data portal · single publisher · MBs of
tabular CSV that changes rarely · a few-to-dozens of datasets · all public · publishing
& discovery · Cloudflare, no existing backend.

### 2. Derive the recommendation

Fill the five slots by applying these rules (first match wins per slot; otherwise use
the default):

**Storage · Catalog · Compute** (by data volume + query needs):
| Situation | Storage | Catalog | Compute |
|-----------|---------|---------|---------|
| Tiny — a few small CSVs, preview only | repo files | `datasets.json` | papaparse preview |
| Large files, want versioning / gitops | **Git-LFS + R2** | git + Frictionless | DuckDB-Wasm |
| Analytics-grade — aggregate/join/filter, or many/large datasets | **Parquet on R2** | **DuckLake** | **DuckDB** (Wasm→server) |
| Existing warehouse, or SQL-native team needing a datastore | CKAN datastore / warehouse | backend-native | warehouse engine |

**Data tier (`inline | LFS | external`)** — the per-dataset byte routing the Storage slot
resolves to (this parameterizes `/portaljs-add-dataset`; first match wins):
| Situation | Data tier |
|-----------|-----------|
| Only the template's bundled sample data, or an OSS self-host with no R2 creds | inline |
| Data the user adds and wants versioned with the repo (the common case) | **LFS** |
| Data already at a URL, or multi-GB Parquet queried in place on R2 | external |

A portal can mix tiers per dataset; name the **default** tier (almost always **LFS**) and
flag any dataset that deviates (e.g. a remote URL recorded as-is = external passthrough).

**Query mode (`DATA_QUERY = flat | duckdb`)** — portal-wide, derived from the purpose:
- Publishing/discovery only ("show me the rows" + download) → **flat**.
- Analytics/querying — filter, aggregate, join — or many/large datasets, or any Parquet
  resource → **duckdb**. (A Parquet resource always renders the query view; `duckdb` extends
  it to CSV/TSV too. DuckDB-Wasm only loads in the browser, only when a query view mounts.)

**Access · Hosting:**
- All public → **static**, hosted on **Cloudflare Pages**.
- Any private / role-based → **runtime + backend RBAC** (CKAN or OpenMetadata owns
  policy; PortalJS surfaces it), hosted on **Cloudflare Workers**. Flag this as the
  larger build (the opt-in runtime mode).

**Metadata:**
- Default **Frictionless** profile.
- Harvesting / standard compliance → add a **DCAT** export and the relevant profile
  (DCAT-AP / national / domain). Multiple dataset types → multi-profile.

**Namespace mode (for the `/portaljs-new-portal` handoff):** single publisher → `theme`
(group by subject); multiple publishers → `owner` (group by who published).

When genuinely unsure, recommend the opinionated default and say so — never present a
blank page.

### 3. Echo the architecture brief for confirmation

```
Architecture brief — say "go" to proceed, or correct anything:

  Building:  <kind>, <single/multi> publisher
  Data:      <size>, <shape>, changes <cadence>, <count> datasets, <public/private>
  For:       <purposes>

  Recommended stack
    • Storage:   <slot>      — <one-line why>
    • Catalog:   <slot>      — <why>
    • Compute:   <slot>      — <why>
    • Access:    <slot>      — <why>
    • Hosting:   <slot>      — <why>
    • Metadata:  <slot>      — <why>
    • Namespace: <theme|owner>
    • Data tier: <inline|LFS|external>   — default for added data; <why>
    • Query:     DATA_QUERY=<flat|duckdb> — <why>

  Deviations from the default: <list, or "none — this is the recommended default">
  Designed-in but built later: <e.g. Git-LFS via giftless, DCAT export, runtime/RBAC>
```

### 4. Persist the brief

On confirmation, write the brief to `./ARCHITECTURE.md` in the working directory (create
or overwrite) so it documents the decision and parameterizes the build skills. Keep it to
the six slots + the two build-time knobs (data tier + `DATA_QUERY`) + reasoning + the
deferred items.

### 5. Hand off to the build skills

Map the brief to concrete next commands and offer to run the first one:

| Decision | Next skill |
|----------|-----------|
| Scaffold the portal (always) | `/portaljs-new-portal` — pass the name, description, the chosen **namespace mode**, and the **`DATA_QUERY` mode** |
| Load the datasets | `/portaljs-add-dataset` (per dataset) — applies the chosen **data tier** (LFS default; external for remote URLs) |
| Charts / maps on a showcase | `/portaljs-add-chart` · `/portaljs-add-map` |
| Backend with RBAC / existing CKAN | `/portaljs-connect-ckan` |
| OpenMetadata backend | `/connect-openmetadata` *(planned)* |
| Custom / extended / DCAT metadata | `/portaljs-define-schema` — describe a dataset's fields + metadata (Frictionless; DCAT export built later) |
| Ship it | `/portaljs-deploy` (Cloudflare Pages, or Workers for the runtime mode) |

**Landing the `DATA_QUERY` choice.** The template ships `DATA_QUERY = 'flat'`. If the brief
chose `duckdb`, set it in the scaffolded portal's `lib/datasets.ts` (the `/portaljs-new-portal`
step, alongside `NAMESPACE_TYPE`):
```bash
perl -pi -e "s/export const DATA_QUERY: 'flat' \\| 'duckdb' = '[a-z]+'/export const DATA_QUERY: 'flat' | 'duckdb' = 'duckdb'/" "./$PROJECT_SLUG/lib/datasets.ts"
```
Leave it `flat` otherwise — a Parquet resource still renders the query view on its own.

End by recommending the exact sequence, e.g.:
```
Next: 1) /portaljs-new-portal "<name>" (namespace: <mode>, DATA_QUERY: <flat|duckdb>)
      2) /portaljs-add-dataset for each source (tier: <LFS|external|inline>)
      3) /portaljs-deploy to Cloudflare Pages
```
If the user says "go", proceed to run `/portaljs-new-portal` with the inferred name, description,
and namespace mode (skipping the questions `/portaljs-architect` already answered). Skills marked
*(planned)* aren't built yet — name them as the intended path and note they're upcoming.

## Example

```
/portaljs-architect We're a national statistics office. ~200 datasets, mostly large CSVs
(some GBs), updated quarterly, all public, and we must publish DCAT-AP for the
EU data portal.
```
From this the skill infers: multi-publisher open-data portal, analytics-grade volume,
publishing + harvesting. It recommends **Parquet on R2 + DuckLake + DuckDB**, static on
**Cloudflare Pages**, **Frictionless + DCAT-AP** metadata, `owner` namespace — data tier
**external** (multi-GB Parquet queried in place on R2) with **LFS** for anything ingested,
and **`DATA_QUERY = 'duckdb'`** because the brief needs querying, not just preview. It flags
the DCAT export and Git-LFS ingest as designed-in/built-later, writes `ARCHITECTURE.md`, and
hands off to `/portaljs-new-portal` (namespace `owner`, `DATA_QUERY = 'duckdb'`) then
`/portaljs-add-dataset`. With no arguments, it runs the four-round interview first.
