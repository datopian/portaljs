---
metatitle: PortalJS Backends – CKAN, DKAN, OpenMetadata, Purview, DataHub, GitHub
metadescription: PortalJS is decoupled by default — the frontend talks to any backend over an API. Integration notes for CKAN, DKAN, OpenMetadata, Microsoft Purview, DataHub, GitHub, Frictionless, and custom backends.
title: Backends
description: PortalJS is decoupled by default — the frontend talks to any backend over an API. Integration notes per backend.
---

PortalJS is **decoupled by default**: the frontend is independent from the backend and
talks to it over an API. The same portal frontend can sit in front of a catalog
system, a Git repo, plain static files, or a backend you already run — and you can
start with static files and point at a real catalog later without rewriting the
frontend. See [Core concepts](/docs/core-concepts) for the model.

> [!info] Start static, connect later
> The default — no backend — reads CSV/JSON from `/public/data/`. When you're ready,
> wire a real catalog with a skill like [`/portaljs-connect-ckan`](/docs/guides/connect-a-ckan-backend).
> The pattern (fetch server-side in `getStaticProps`/`getStaticPaths`, pass plain props
> to components) is the same for any backend.

## CKAN

The first-class, skill-supported path. [`/portaljs-connect-ckan`](/docs/guides/connect-a-ckan-backend)
generates a tiny server-side `fetch` client (no dependency), lists datasets from
`package_search`, and renders each from `package_show`, with CSV/TSV resources previewed
through the template's `<Table />`. Calls run server-side, so the catalog is pre-rendered
and statically deployable. See the
[CKAN integration page](/ckan) and the
[`examples/ckan`](https://github.com/datopian/portaljs/tree/main/examples/ckan) and
[`examples/ckan-ssg`](https://github.com/datopian/portaljs/tree/main/examples/ckan-ssg)
examples.

## DKAN

DKAN exposes a **CKAN-compatible API** (`/api/3/action/...`). Point the same `fetch`
client `/portaljs-connect-ckan` generates at a DKAN instance's API root and the catalog/dataset
pattern carries over. Confirm `package_search`/`package_show` availability on your DKAN
version first.

## OpenMetadata

OpenMetadata is a metadata catalog with its own REST API. Fetch tables/datasets and
their metadata server-side and render them with the same plain-props pattern. See the
[OpenMetadata blog walkthrough](https://github.com/datopian/portaljs) for an
end-to-end example of fronting OpenMetadata with PortalJS.

## Microsoft Purview

Purview is Microsoft's data governance and catalog service. Query its REST API
(authenticated) on the server side, map the entities you want to surface into the
portal's dataset shape, and render them — the frontend never needs to know it's
Purview behind the API.

## DataHub

DataHub exposes both a GraphQL and a REST API. Fetch the datasets/entities you want to
publish server-side, normalize them to the portal's dataset shape, and render. As with
every backend, keep the client lean by querying only in
`getStaticProps`/`getStaticPaths`.

## GitHub

Treat a GitHub repo as the catalog: data files (CSV/JSON/GeoJSON) live in the repo, and
the portal reads them at build time. This is the simplest "backend" — no service to run.
See [`examples/github-backed-catalog`](https://github.com/datopian/portaljs/tree/main/examples/github-backed-catalog).

## Frictionless

[Frictionless Data](https://frictionlessdata.io) packages (a `datapackage.json` plus
data files) describe datasets in a portable, validated way. Read the package descriptor
to drive dataset metadata and resource lists. See
[`examples/dataset-frictionless`](https://github.com/datopian/portaljs/tree/main/examples/dataset-frictionless).

## Custom backend

Any system with an HTTP API works. The recipe is always the same:

1. Fetch from your API **server-side** in `getStaticProps`/`getStaticPaths` (or
   `getServerSideProps` for always-live data).
2. Map the response into the portal's dataset shape (`slug`, `name`, `description`,
   resources).
3. Pass plain serializable props to the page; render with `<Table>`, `<Chart>`, `<Map>`,
   or your own components.

Because the output is plain editable code, there's no framework wiring to fight — and
you can model a new backend skill on [`/portaljs-connect-ckan`](/docs/skills/portaljs-connect-ckan); see
[Authoring skills](/docs/authoring-skills).

## Where to go next

- **[Connect a CKAN backend](/docs/guides/connect-a-ckan-backend)** — the worked
  example.
- **[Authoring skills](/docs/authoring-skills)** — package your backend integration as
  a reusable skill.

<DocsPagination prev="/docs/authoring-skills" next="/docs/arc" />
