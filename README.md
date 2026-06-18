<p align="center">
  <img src="assets/portaljs-logo.svg" alt="PortalJS" width="96" height="96" />
  <h1 align="center">PortalJS</h1>
  <p align="center">
    <b>The AI-native framework for building data portals.</b>
    <br />
    Describe the portal you want — your agent helps you choose an architecture, scaffolds it, and loads your data.
    <br />
    <br />
    <a href="https://www.portaljs.com/opensource">Docs</a>
    ·
    <a href="https://github.com/datopian/portaljs/discussions">Discussions</a>
    ·
    <a href="https://github.com/datopian/portaljs/issues/new">Report a bug</a>
    <br />
    <br />
    <a href="https://discord.gg/krmj5HM6He"><img src="https://dcbadge.limes.pink/api/server/krmj5HM6He" alt="Join our Discord server"/></a>
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"/>
  </p>
</p>

---

## Quickstart

**Create a portal** — one command, nothing to install beyond Node 18+:

```bash
npm create portaljs@latest my-portal
cd my-portal
npm run dev      # → http://localhost:3000
```

You get the three surfaces — Home, a Catalog (`/search`), and a dataset Showcase
(`/@<namespace>/<slug>`) — over sample data. Plain, editable Next.js, no lock-in. Add your
own CSV/JSON to `datasets.json` and it renders automatically.

**Build it with your AI assistant** — PortalJS ships [Claude Code](https://claude.com/claude-code)
skills that do the assembly. Install them once (into `~/.claude/commands`):

```bash
curl -fsSL https://raw.githubusercontent.com/datopian/portaljs/main/scripts/install-portaljs-skills.sh | bash
```

Then, in a Claude Code session from any directory:

```text
/portaljs-architect    not sure what stack you need? start here
/portaljs-new-portal   "Auckland Council open data portal"
/portaljs-add-dataset  ./data/air-quality.csv
```

`/portaljs-new-portal` scaffolds the three surfaces; `/portaljs-add-dataset` (or `/portaljs-add-resource`) loads data;
`/portaljs-connect-ckan` points it at a CKAN backend; `/portaljs-deploy` ships it. ([All skills + install →](.claude/INSTALL.md))

**Prefer the bare template** — plain Next.js, no AI, no lock-in:

```bash
npx tiged datopian/portaljs/examples/portaljs-catalog my-portal
cd my-portal && npm install && npm run dev      # → http://localhost:3000
```

You get Home, a Catalog (`/search`), and a dataset Showcase (`/@<namespace>/<slug>`) over
sample data. Add your own CSV/JSON to `datasets.json` and it renders automatically.

⭐ If it's useful, a star helps others find it.

## Why PortalJS

Building a data portal has always meant more than a website. You have to decide where
the data lives, how it's versioned, how people search it, how it's served, and how it's
governed — and then wire a frontend on top. Teams either over-build on a heavy data
warehouse they don't need, or under-build on a pile of scripts that doesn't scale.

PortalJS is an **open-source, agentic skills framework that helps data teams build,
develop, and ship data portals — and the data infrastructure underneath them.** It isn't
only a frontend. The skills do two jobs:

- **Advise** — given _what you're building_, _what your data is_, and _what it's for_,
  they recommend an architecture: storage, compute, catalog, access, hosting, metadata.
- **Build** — they scaffold that stack as plain, editable Next.js code with no lock-in.

It is **opinionated but open**: the recommended modern path is git + object storage
(Cloudflare R2) + Parquet + [DuckLake](https://ducklake.select/) + DuckDB — an open
lakehouse instead of a classic warehouse — but a traditional datastore (CKAN, a
warehouse) stays a first-class option when you need it. You always own plain code.

Built and maintained in the open by [Datopian](https://www.datopian.com/) and the
PortalJS community.

## Architecture at a glance

```text
        🧑  you describe what you want to build
        │
        ▼
╭─ 🤖  AGENTIC SKILLS ──────────────────────────────────  decide + build
│   /portaljs-architect · /portaljs-new-portal · /portaljs-add-dataset · /portaljs-add-chart · /portaljs-add-map …
╰─  generates plain, editable Next.js code — no lock-in
        │
        ▼
╭─ 🖥️  SURFACES ────────────────────────────────────────  what users see
│   🏠 Home /      🔎 Catalog /search      📊 Showcase /@ns/slug
╰─  read data through one DataProvider contract
        │
        ▼
╭─ 🔌  PROVIDERS ───────────────────────────────────────  pluggable backends
│   📁 static·git     🐘 CKAN     🔭 OpenMetadata     🗂️ git-LFS + R2
╰─  swap the source without touching a page
        │
        ▼
📦  STORAGE + COMPUTE  —  choose your point on the spectrum:

      flat files  ─▶  Git-LFS + R2  ─▶  Parquet + DuckLake + 🦆 DuckDB  ─▶  warehouse / CKAN
      simplest                          ⭐ open lakehouse (default)            heaviest

☁️  Substrate  —  Cloudflare R2 (storage) · Workers (runtime) · D1 (catalog) · Pages (static)
     object storage stays S3-compatible — R2 is the default, never a lock-in
```

**Three surfaces.** Every data portal is built from three: a **Home** page that explains
it and offers search, a **Catalog** (`/search`) to discover datasets, and a **Showcase**
(`/@<namespace>/<slug>`) to explore one dataset — metadata, preview, download/API, and
charts/maps. ([Core concepts →](https://www.portaljs.com/docs/core-concepts))

**One seam.** The surfaces read data only through a `DataProvider`, so the source — static
files today, a CKAN or lakehouse backend tomorrow — can change without touching a page.

See [`ROADMAP.md`](ROADMAP.md) for the full model and the
[architecture decision framework](https://www.portaljs.com/docs/architecture/decision-framework)
for how `/portaljs-architect` turns your needs into a stack.

## Build a portal with your AI assistant

PortalJS ships [Claude Code](https://claude.com/claude-code) skills that turn a brief into
a working portal.

### Setup

Install the skills once into your personal scope so they're available from **any**
directory:

```bash
curl -fsSL https://raw.githubusercontent.com/datopian/portaljs/main/scripts/install-portaljs-skills.sh | bash
```

Restart Claude Code (or open a new session) and type `/` to see them. See
[`.claude/INSTALL.md`](.claude/INSTALL.md) for other install options (versioned plugin, or
running straight from a clone of this repo).

### Use

If you're not sure how to set up your portal, start with the advisor, then build:

```text
/portaljs-architect    we have ~200 public CSVs, updated quarterly, and must publish DCAT-AP
/portaljs-new-portal   "Auckland Council open data portal"
/portaljs-add-dataset  ./data/air-quality.csv
/portaljs-add-dataset  https://example.com/parks.geojson
```

The skills are **interactive** — if your brief is thin, they interview you in short rounds
rather than erroring. `/portaljs-architect` recommends a stack and hands off; `/portaljs-new-portal`
scaffolds the three surfaces; `/portaljs-add-dataset` appends to the `datasets.json` manifest and
the showcase renders automatically at `/@<namespace>/<slug>`. Run `npm run dev` and you
have a portal.

**Prefer to build by hand?** The skills are a convenience, not a requirement — scaffold the
template directly with the CLI:

```bash
npm create portaljs@latest my-portal
```

(Or grab the bare template with no prompts: `npx tiged datopian/portaljs/examples/portaljs-catalog my-portal`.)

### Available skills

| Skill | What it does |
|-------|--------------|
| [`/portaljs-architect`](.claude/commands/portaljs-architect.md) | Recommend an architecture (storage/compute/catalog/access/hosting/metadata) from your needs, then hand off — the advisory entry point |
| [`/portaljs-new-portal`](.claude/commands/portaljs-new-portal.md) | Scaffold a new portal (Home + Catalog + Showcase) from a brief |
| [`/portaljs-add-dataset`](.claude/commands/portaljs-add-dataset.md) | Add a CSV, TSV, JSON, or GeoJSON dataset — appends to the manifest; its showcase renders automatically |
| [`/portaljs-add-chart`](.claude/commands/portaljs-add-chart.md) | Add a chart to a dataset's showcase Views section |
| [`/portaljs-add-map`](.claude/commands/portaljs-add-map.md) | Render GeoJSON on an interactive map in the showcase |
| [`/portaljs-connect-ckan`](.claude/commands/portaljs-connect-ckan.md) | Feed the catalog and showcases from a CKAN backend |
| [`/portaljs-deploy`](.claude/commands/portaljs-deploy.md) | Deploy to Cloudflare Pages, Vercel, or static hosting |
| [`/portaljs-check-data-quality`](.claude/commands/portaljs-check-data-quality.md) | Audit a dataset for quality issues (schema, nulls, types) |

More skill families — metadata schemas (Frictionless/DCAT), more backends (OpenMetadata,
git-LFS+R2), a DuckDB data layer, and access control — are on the [roadmap](ROADMAP.md).
Write your own — see [`.claude/AUTHORING.md`](.claude/AUTHORING.md).

## What's in this repo

```text
.claude/commands/    the agentic skills (slash commands)
examples/            reference portals — portaljs-catalog is the canonical template
packages/
  core/              layout/UI components            (@portaljs/core)
  ckan/              CKAN catalog UI + React          (@portaljs/ckan)
  ckan-api-client-js/ pure CKAN API client            (@portaljs/ckan-api-client-js)
site/                portaljs.com — the marketing site + docs
ROADMAP.md           direction, the four contracts, sequencing
```

The canonical template, [`examples/portaljs-catalog`](examples/portaljs-catalog/), is where
the three surfaces and the `DataProvider` seam live — read it before building.

## What makes it different

- 🌱 **Open source, MIT, no lock-in** — every skill emits plain Next.js you can fork and own.
- 🧭 **Advisory, not just generative** — `/portaljs-architect` helps you _decide_ the infrastructure, not only scaffold a UI.
- 🦆 **Open lakehouse by default** — git + R2 + Parquet + DuckLake + DuckDB over a heavy warehouse, with DuckDB as the query engine. A datastore/warehouse stays a supported choice.
- ☁️ **Cloudflare-first, portable** — R2 / Workers / D1 / Pages as the default substrate, but object storage stays S3-compatible.
- 🧩 **Decoupled, any backend** — one `DataProvider` contract in front of [CKAN](https://ckan.org/), [DKAN](https://getdkan.org/), [OpenMetadata](https://open-metadata.org/), [DataHub](https://datahubproject.io/), GitHub, [Frictionless](https://frictionlessdata.io/), plain files — or your own.
- 🎨 **Bring your own stack** — adopt the template or lift the skills and the three-surface model into an app you already have.

## Examples

Reference implementations live in [`examples/`](examples/):

| Example | Backend |
|---------|---------|
| [`portaljs-catalog`](examples/portaljs-catalog/) | **Canonical template** — Home + Catalog + Showcase over a static manifest |
| [`portaljs-template`](examples/portaljs-template/) | Minimal single-page starter |
| [`ckan`](examples/ckan/) · [`ckan-ssg`](examples/ckan-ssg/) | CKAN |
| [`github-backed-catalog`](examples/github-backed-catalog/) | GitHub |
| [`dataset-frictionless`](examples/dataset-frictionless/) | Frictionless Data Package |
| [`fivethirtyeight`](examples/fivethirtyeight/) · [`openspending`](examples/openspending/) · [`turing`](examples/turing/) | Real-world portals |

## Community & support

- 💬 **Discord** — live chat and help: [join the server](https://discord.gg/krmj5HM6He)
- 🗣️ **Discussions** — questions, ideas, show-and-tell: [github.com/datopian/portaljs/discussions](https://github.com/datopian/portaljs/discussions)
- 🐛 **Issues** — bugs and feature requests: [open an issue](https://github.com/datopian/portaljs/issues/new)
- 📖 **Docs** — [portaljs.com/opensource](https://www.portaljs.com/opensource)

## Contributing

PortalJS is built in the open and we welcome contributions of all sizes — new skills,
examples, docs, and fixes. See [CONTRIBUTING.md](CONTRIBUTING.md) to get started, and read
[ROADMAP.md](ROADMAP.md) and [VISION.md](VISION.md) for where the project is headed.

## License

[MIT](license) © [Datopian](https://www.datopian.com/)
