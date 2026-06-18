---
metatitle: PortalJS Docs – Get Started
metadescription: Build a data portal with PortalJS. Describe what you want and let your AI assistant scaffold it, or clone the template and edit by hand. Open source, no lock-in.
title: Get started with PortalJS
description: PortalJS is the AI-native framework for building data portals. Two paths to a live portal — describe it to your AI assistant, or build it by hand.
---

> [!info] Looking for the classic framework docs?
> These are the docs for the new **AI-native** PortalJS. The original
> open-source framework guide still lives at [/opensource](/opensource) and is
> not going away.

PortalJS is the **AI-native framework for building data portals**. A data portal
is a site that lists your datasets, renders each one as a page — tables, charts,
maps — and (optionally) connects to a catalog backend like CKAN.

PortalJS gives you two things:

- **A lightweight, customizable template** — plain Next.js + Tailwind + React, no
  heavy component library to fight.
- **A set of agentic skills** — Claude Code commands that do the assembly:
  `/portaljs-new-portal`, `/portaljs-add-dataset`, `/portaljs-add-chart`, `/portaljs-add-map`, `/portaljs-connect-ckan`,
  `/portaljs-deploy`.

You describe the portal you want; your AI assistant scaffolds it, loads your data,
generates pages, and wires up a backend. Everything it writes is **plain, editable
code** you own — no magic runtime, no lock-in.

## Two ways to build

| Path                      | When to use it                                         | Start here                           |
| ------------------------- | ------------------------------------------------------ | ------------------------------------ |
| **AI path** (recommended) | You have Claude Code and want a portal live in minutes | [Quickstart →](/docs/quickstart)     |
| **Manual path**           | You'd rather clone the template and edit by hand       | [Manual setup →](/docs/manual-setup) |

Both paths produce the **same project** — the AI path just does the typing for you.
You can switch between them at any time: scaffold with skills, then edit the code
directly, or vice versa.

## What's next

- **[Quickstart](/docs/quickstart)** — install the skills and go from nothing to a
  live portal with your data in a few minutes.
- **[Manual setup](/docs/manual-setup)** — clone the template and build by hand.
- **[Core concepts](/docs/core-concepts)** — the four ideas that shape PortalJS:
  lightweight template + skills, plain editable code, decoupled by default, and
  bring-your-own-stack.

<DocsPagination next="/docs/quickstart" />
