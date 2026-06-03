# PortalJS Vision

## Where we're going

PortalJS is becoming the **AI-native framework for building data portals**.

For years, building a data portal meant wiring up a heavy component library, fighting bundle sizes, and writing boilerplate for every dataset page and catalog view. We're replacing that with a different model:

> A lightweight, customizable site **plus** a set of **agentic skills** that do the assembly. You describe the portal you want; your AI assistant scaffolds it, loads your data, generates pages, and connects a backend.

The work moves from writing boilerplate to describing intent. The framework stays small and easy to own; the agent does the repetitive assembly.

## Principles

1. **AI-native, not AI-only.** Skills are the fast path, but every skill produces plain, readable code you can clone, fork, and edit by hand. No magic runtime, no lock-in.
2. **Open source first.** MIT licensed, built in the open, community-driven. The OSS framework is the product.
3. **Decoupled by default.** The frontend is independent from the backend and talks to it over an API — CKAN, DKAN, OpenMetadata, Microsoft Purview, DataHub, GitHub, Frictionless, plain JSON/static files, or a custom backend.
4. **Bring your own stack.** Ship a sensible default template, but never force a frontend toolchain or design system on teams that already have one.
5. **Skills are first-class.** Skills live in the repo, are documented, tested end-to-end, and composable. Anyone can author one — see [`.claude/AUTHORING.md`](.claude/AUTHORING.md).

## Roadmap

### Now — agentic skills v1
- [x] `/new-portal` — scaffold a portal from a brief
- [x] `/add-dataset` — add CSV/TSV/JSON/GeoJSON datasets and register them
- [x] Canonical lightweight template (`examples/portaljs-template`)
- [x] AI development guide (`CLAUDE.md`) and skill authoring guide (`.claude/AUTHORING.md`)

### Next — make skills installable anywhere
Today the skills are **repo-local**: they run from inside a clone of this repo because `/new-portal` resolves the template via `git rev-parse --show-toplevel`. To let users run them from any project:
- [ ] Fetch the template remotely (e.g. `degit` / `create-next-app -e` / pinned tarball) instead of from the local checkout, so `/new-portal` works outside this repo
- [ ] Support installing the commands into `~/.claude/commands/` (personal scope), with docs
- [ ] Package the skills + template as a distributable Claude Code plugin

### Next — complete the skill set
- [ ] `/add-chart` — add a visualization to a dataset page
- [ ] `/add-map` — render GeoJSON on an interactive map
- [ ] `/connect-ckan` — wire a portal to a CKAN backend (the headline "decoupled" path)
- [ ] `/deploy` — one-shot deploy to Vercel or static hosting

### Next — template variants
- [x] Catalog template with dynamic dataset routes (`[slug].tsx` + `getStaticPaths`) for portals with many datasets (`examples/portaljs-catalog`)
- [ ] Modernized CKAN-backed and GitHub-backed catalog templates

### Later — skill composition (v2)
- [ ] Skills that chain: `/new-portal` runs `/add-dataset` for each dataset in the brief, end to end
- [ ] Shared conventions so third-party skills compose cleanly with the built-ins

### Ongoing — keep the repo honest
- [ ] Retire legacy heavy components and dead code paths
- [ ] Keep `CLAUDE.md`, examples, and skills in sync as the canonical reference

## How to help

The fastest ways to move this forward:
- **Author a skill** from the roadmap above — start with [`.claude/AUTHORING.md`](.claude/AUTHORING.md).
- **Contribute an example** portal for a backend or use case we don't cover yet.
- **File issues and ideas** in [Discussions](https://github.com/datopian/portaljs/discussions) or on [Discord](https://discord.gg/krmj5HM6He).

See [CONTRIBUTING.md](CONTRIBUTING.md) for the mechanics.
