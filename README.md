<p align="center">
  <img src="assets/portaljs-logo.svg" alt="PortalJS" width="96" height="96" />
  <h1 align="center">PortalJS</h1>
  <p align="center">
    <b>The AI-native framework for building data portals.</b>
    <br />
    Describe the portal you want — your agent scaffolds it and loads your data in minutes.
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

PortalJS is an **open-source** framework for building data portals and catalogs. It pairs a lightweight, customizable site with a set of **agentic skills** — commands your AI assistant runs to scaffold a portal, add datasets, and wire up a backend, without you writing boilerplate.

Built and maintained in the open by [Datopian](https://www.datopian.com/) and the PortalJS community.

## Build a portal with your AI assistant

PortalJS ships [Claude Code](https://claude.com/claude-code) skills that turn a brief into a working portal:

```text
/new-portal  "Auckland Council open data portal"
/add-dataset ./data/air-quality.csv
/add-dataset https://example.com/parks.geojson
```

That scaffolds the site, copies your data in, generates dataset pages, and registers everything on the catalog home page. Run `npm run dev` and you have a portal.

**Prefer to start from a template?** Clone the canonical example and build by hand — the skills are a convenience, not a requirement:

```bash
npx create-next-app -e https://github.com/datopian/portaljs/tree/main/examples/portaljs-template my-portal
```

### Available skills

| Skill | What it does |
|-------|--------------|
| [`/new-portal`](.claude/commands/new-portal.md) | Scaffold a new portal from a brief |
| [`/add-dataset`](.claude/commands/add-dataset.md) | Add a CSV, TSV, JSON, or GeoJSON dataset and register it |

More skills (charts, maps, deploy, CKAN connect) are on the [roadmap](VISION.md). Write your own — see [`.claude/AUTHORING.md`](.claude/AUTHORING.md).

## Why PortalJS

- 🌱 **Open source, MIT licensed** — no lock-in, fork it, ship it, own it.
- 🤖 **AI-native** — agentic skills do the assembly so you focus on the data, not the scaffolding.
- 🧩 **Decoupled, any backend** — the frontend is independent from your backend and talks to it over an API. Out-of-the-box support for [CKAN](https://ckan.org/), [DKAN](https://getdkan.org/), [OpenMetadata](https://open-metadata.org/), [Microsoft Purview](https://www.microsoft.com/en-us/security/business/microsoft-purview), [DataHub](https://datahubproject.io/), GitHub, [Frictionless Data Packages](https://frictionlessdata.io/), plain JSON/static files — or your own custom backend.
- 🎨 **Bring your own stack** — start from the default template or adapt it to the frontend tooling and design system your team already uses.
- 👥 **Community-driven** — active [Discord](https://discord.gg/krmj5HM6He) and [discussion forum](https://github.com/datopian/portaljs/discussions); contributions welcome.

## Examples

Reference implementations live in [`examples/`](examples/):

| Example | Backend |
|---------|---------|
| [`portaljs-template`](examples/portaljs-template/) | Static / local files — the canonical starting point |
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

PortalJS is built in the open and we welcome contributions of all sizes — new skills, examples, docs, and fixes. See [CONTRIBUTING.md](CONTRIBUTING.md) to get started, and read [VISION.md](VISION.md) for where the project is headed.

## License

[MIT](license) © [Datopian](https://www.datopian.com/)
