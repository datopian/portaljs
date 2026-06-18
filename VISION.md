# PortalJS Vision

## Where we're going

PortalJS is becoming the **AI-native framework for building data portals**.

For years, building a data portal meant wiring up a heavy component library, fighting bundle sizes, and writing boilerplate for every dataset page and catalog view. We're replacing that with a different model:

> A lightweight, customizable site **plus** a set of **agentic skills** that do the assembly. You describe the portal you want; your AI assistant scaffolds it, loads your data, generates pages, and connects a backend.

The work moves from writing boilerplate to describing intent. The framework stays small and easy to own; the agent does the repetitive assembly.

And scaffolding is only the start. The same model — describe intent, get plain editable code/artifacts — extends across the **whole data-portal lifecycle**: ingest and migrate existing catalogs, wrangle and transform data, visualize it, describe it with metadata, build and brand the frontend, and publish. PortalJS is becoming a composable **library of agentic skills** for that lifecycle, not just a portal scaffolder. See [The bigger picture](#the-bigger-picture--a-skill-library-for-the-whole-data-lifecycle).

## Principles

1. **AI-native, not AI-only.** Skills are the fast path, but every skill produces plain, readable code you can clone, fork, and edit by hand. No magic runtime, no lock-in.
2. **Open source first.** MIT licensed, built in the open, community-driven. The OSS framework is the product. A managed option (**PortalJS Cloud**) exists for teams that would rather not self-host, but it is strictly secondary: the open-source framework is always the primary path and is never feature-gated to push the hosted product.
3. **Decoupled by default.** The frontend is independent from the backend and talks to it over an API — CKAN, DKAN, OpenMetadata, Microsoft Purview, DataHub, GitHub, Frictionless, plain JSON/static files, or a custom backend.
4. **Bring your own stack.** Ship a sensible default template, but never force a frontend toolchain or design system on teams that already have one.
5. **Skills are first-class.** Skills live in the repo, are documented, tested end-to-end, and composable. Anyone can author one — see [`.claude/AUTHORING.md`](.claude/AUTHORING.md).

## Roadmap

### Now — agentic skills v1
- [x] `/portaljs-new-portal` — scaffold a portal from a brief
- [x] `/portaljs-add-dataset` — add CSV/TSV/JSON/GeoJSON datasets and register them
- [x] Canonical lightweight template (`examples/portaljs-template`)
- [x] AI development guide (`CLAUDE.md`) and skill authoring guide (`.claude/AUTHORING.md`)

### Next — make skills installable anywhere
Today the skills are **repo-local**: they run from inside a clone of this repo because `/portaljs-new-portal` resolves the template via `git rev-parse --show-toplevel`. To let users run them from any project:
- [x] Fetch the template remotely (`npx tiged`) instead of from the local checkout, so `/portaljs-new-portal` works outside this repo
- [x] Support installing the commands into `~/.claude/commands/` (personal scope), with docs ([`.claude/INSTALL.md`](.claude/INSTALL.md))
- [x] Package the skills + template as a distributable Claude Code plugin (`.claude-plugin/`)

### Now — core skill set
- [x] `/portaljs-add-chart` — add a visualization to a dataset page
- [x] `/portaljs-add-map` — render GeoJSON on an interactive map
- [x] `/portaljs-connect-ckan` — wire a portal to a CKAN backend (the headline "decoupled" path)
- [x] `/portaljs-deploy` — one-shot deploy to Vercel or static hosting

### Next — template variants
- [x] Catalog template with dynamic dataset routes (`[slug].tsx` + `getStaticPaths`) for portals with many datasets (`examples/portaljs-catalog`)
- [ ] Modernized CKAN-backed and GitHub-backed catalog templates

### Later — skill composition (v2)
- [ ] Skills that chain: `/portaljs-new-portal` runs `/portaljs-add-dataset` for each dataset in the brief, end to end
- [ ] Shared conventions so third-party skills compose cleanly with the built-ins

### Ongoing — keep the repo honest
- [ ] Retire legacy heavy components and dead code paths
- [ ] Keep `CLAUDE.md`, examples, and skills in sync as the canonical reference

## The bigger picture — a skill library for the whole data lifecycle

Scaffolding a portal and dropping in a CSV is the *first* skill family, not the whole product. The longer-term vision is a composable library of agentic skills spanning the full lifecycle of a data portal — each producing plain, inspectable code or data artifacts, each usable on its own or chained into a pipeline.

### Ingest & migrate
Pull existing catalogs and datasets into a PortalJS **static catalog** from the systems teams already run:
- Sources: CKAN, DKAN, Socrata, OpenDataSoft (ODS), ArcGIS Open Data / Hub, and more.
- A multi-step, preference-driven flow: pick catalog / organizations / datasets, choose what to materialize (metadata only vs. full data), map fields, and write out a static catalog. This is the headline migration path *off* a legacy DMS and *onto* PortalJS.

### Wrangle & transform
Prepare data without leaving the assistant:
- **Data quality & validation** — `/portaljs-check-data-quality` (`.claude/commands/portaljs-check-data-quality.md` + `scripts/check-data-quality.sh`).
- **CSV wrangling** — common operations: clean headers, fix types, dedupe, filter, sort, join, reshape, split/merge columns.
- **Format transforms** — CSV ⇄ TSV ⇄ JSON ⇄ Parquet, plus Excel (xlsx), XML, and other tabular sources.
- **SQL over files** (e.g. DuckDB) for slicing and aggregating before publish.

### Visualize
Charts as a first-class skill family, standardized on **Observable Plot / Framework** wherever possible:
- Generate a wide range of chart types from a dataset + intent, emitted as editable code.
- Strong defaults, with an escape hatch to hand-tune.

### Describe (metadata)
Metadata management as skills:
- Define and edit schemas; author and validate against **JSON Schema** (and Frictionless / Table Schema).
- Adapt to existing metadata profiles (DCAT, schema.org, custom) rather than imposing one.

### Build & brand the frontend
Keep frontend assembly straightforward, and make branding trivial:
- **Bring your own `DESIGN.md`** — point a skill at a brand/design spec (see [`DESIGN.md`](DESIGN.md) and its Brand foundations) and have the portal themed to match. Branding becomes a single-file input, not a CSS slog.

### How it composes
These families chain: **ingest → wrangle → describe → visualize → build & brand → deploy**. `/portaljs-new-portal` becomes the entry point to an orchestrated pipeline, and third-party skills compose with the built-ins through shared conventions (see [`.claude/AUTHORING.md`](.claude/AUTHORING.md)). The framework stays small; the skill library grows.

## How to help

The fastest ways to move this forward:
- **Author a skill** from the roadmap above — start with [`.claude/AUTHORING.md`](.claude/AUTHORING.md).
- **Contribute an example** portal for a backend or use case we don't cover yet.
- **File issues and ideas** in [Discussions](https://github.com/datopian/portaljs/discussions) or on [Discord](https://discord.gg/krmj5HM6He).

See [CONTRIBUTING.md](CONTRIBUTING.md) for the mechanics.
