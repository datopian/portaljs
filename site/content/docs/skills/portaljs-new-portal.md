---
metatitle: /portaljs-new-portal – Scaffold a PortalJS Data Portal from a Brief
metadescription: The /portaljs-new-portal skill copies the canonical PortalJS template, substitutes your project name and description, installs dependencies, and verifies the build — a real, editable Next.js project.
title: /portaljs-new-portal
description: Scaffold a production-ready PortalJS portal from a brief — a real, editable Next.js project you own.
---

`/portaljs-new-portal` scaffolds a production-ready PortalJS data portal from a short
brief. It copies the canonical template, substitutes your project
tokens, installs dependencies, and verifies the build — so you start from a
working project, not a blank page.

## When to use it

This is the first skill you run. Use it to create a new portal project; then load
data with [`/portaljs-add-dataset`](/docs/skills/portaljs-add-dataset) and enrich from there.

It works **both inside a clone of the portaljs repo and from any other project**:
it prefers a local checkout of the template and otherwise fetches it from GitHub.

## Inputs

A short brief in natural language. From it the skill extracts:

| Input | Required | Notes |
| ----- | -------- | ----- |
| Project name | Yes | Used for the page title; also derives the project slug (lowercase, hyphenated). |
| Description | No | One sentence describing the portal. Defaults to "An open data portal." |
| Language | No | The interface language — a name or code (e.g. "Italian", `it`, `pt-BR`). Defaults to English. |
| Datasets | No | File paths or URLs mentioned in the brief — added later with `/portaljs-add-dataset`. |

If no project name is found, the skill stops and asks for one.

It copies the canonical template, `examples/portaljs-catalog` — the same one
`npm create portaljs` scaffolds — which renders every dataset through one dynamic
`/@<namespace>/<slug>` route from a `datasets.json` manifest.

## Example

```
/portaljs-new-portal Auckland Council Open Data Portal — public datasets for the Auckland region
```

Or simply:

```
/portaljs-new-portal "Auckland Council open data portal"
```

In another language:

```
/portaljs-new-portal Build an Italian open data portal for the Comune di Palermo
```

## What it produces

- A new project directory named after your project slug (e.g.
  `auckland-council-open-data/`) containing the full template — **plain Next.js,
  Tailwind, and a few small React components** you can edit by hand.
- Placeholder tokens (`__PROJECT_NAME__`, `__PROJECT_SLUG__`, `__DESCRIPTION__`)
  substituted throughout the project with your real values.
- For a non-English portal, the UI translated into `locales/<code>.json` (every string,
  with the language's plural forms), registered in `lib/i18n.ts`, and set as the
  portal's language with `DEFAULT_LOCALE` in `next.config.js` — checked with
  `npm run i18n:check`. Every build and deploy then ships that language.
- Dependencies installed (`npm install`) and the build verified, so the project
  runs immediately.

When it finishes:

```
✓ Portal scaffolded at ./auckland-council-open-data
✓ Run: cd auckland-council-open-data && npm run dev  →  http://localhost:3000
```

## Where to go next

- **[`/portaljs-add-dataset`](/docs/skills/portaljs-add-dataset)** — load your first dataset into the
  new portal.
- **[Editing by hand](/docs/manual-setup)** — the same project, worked on directly.

<DocsPagination prev="/docs/skills" next="/docs/skills/portaljs-add-dataset" />
