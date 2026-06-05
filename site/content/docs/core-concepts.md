---
metatitle: PortalJS Core Concepts – Template, Skills, Plain Code, Decoupled
metadescription: The four ideas behind PortalJS — a lightweight template plus agentic skills, plain editable code with no lock-in, decoupled from any backend, and bring-your-own-stack.
title: Core concepts
description: The four ideas that shape PortalJS — lightweight template + skills, plain editable code, decoupled by default, and bring your own stack.
---

PortalJS rests on four ideas. Understand these and the skills, the template, and
the decisions behind them all make sense.

## 1. A lightweight template + agentic skills

For years, building a data portal meant wiring up a heavy component library,
fighting bundle sizes, and writing boilerplate for every dataset page and catalog
view. PortalJS replaces that with two smaller pieces:

- **A lightweight, customizable template** — plain Next.js, Tailwind, and a few
  small React components (`Table`, charts, maps added only when you need them). No
  monolithic, non-tree-shakeable bundle.
- **A set of agentic skills** — `/new-portal`, `/add-dataset`, `/add-chart`,
  `/add-map`, `/connect-ckan`, `/deploy` — that do the repetitive assembly.

The work moves from _writing boilerplate_ to _describing intent_. The framework
stays small and easy to own; the agent does the assembly.

## 2. Plain, editable code — no lock-in

Every skill produces **plain, readable code you can clone, fork, and edit by
hand**. There is no magic runtime interpreting a config file at request time, and
nothing is feature-gated behind a hosted product.

This is what _AI-native, not AI-only_ means: the skills are the fast path, but the
output is an ordinary Next.js project. You can scaffold with skills today and hand
the repo to a developer who's never heard of them — see [Manual setup](/docs/manual-setup).

## 3. Decoupled by default

The frontend is **independent from the backend** and talks to it over an API. The
same portal frontend can sit in front of:

- **CKAN**, **DKAN**, **OpenMetadata**, **Microsoft Purview**, **DataHub**
- **GitHub**-backed and **Frictionless** datasets
- plain **JSON / static files** (the default — no backend at all)
- a **custom backend** you already run

Start with static CSVs in `/public/data/`, then point the portal at a real catalog
later with [`/connect-ckan`](/ckan) — without rewriting the frontend.

## 4. Bring your own stack

PortalJS ships a sensible default template, but never forces a frontend toolchain
or design system on a team that already has one. The components are small and
swappable; the styling is plain Tailwind. Adopt the whole template, or lift the
skills and ideas into an existing app.

## How it fits together

```
You describe intent  ──►  Agentic skill  ──►  Plain editable code
   "add this CSV"          /add-dataset        pages/datasets/*.tsx
                                                public/data/*.csv
```

The skills are first-class citizens of the repo: documented, tested end-to-end,
and composable. Anyone can author one — see the
[authoring guide](https://github.com/datopian/portaljs/blob/main/.claude/AUTHORING.md).

## Where to go next

- **[Quickstart](/docs/quickstart)** — put these concepts to work with the skills.
- **[Manual setup](/docs/manual-setup)** — or build by hand.
- **[Open-source framework docs](/opensource)** — the classic framework reference.

<DocsPagination prev="/docs/manual-setup" />
