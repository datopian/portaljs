---
metatitle: PortalJS vs Arc vs Cloud – Which product is which?
metadescription: PortalJS is the open-source framework; PortalJS Arc is the default managed layer (zero-infra, edge-served portals); PortalJS Cloud is a managed CKAN backend you attach to Arc when a program needs heavy cataloging. How the three fit together.
title: PortalJS vs Arc vs Cloud
description: One open-source framework, two managed layers. How PortalJS, PortalJS Arc, and PortalJS Cloud fit together — and which one you actually need.
---

There are three names in the PortalJS world — **PortalJS**, **PortalJS Arc**, and
**PortalJS Cloud**. Most of the time you only need to know one of them. This page
explains what each is and how they layer, so you can pick without second-guessing.

> [!info] Short version
> **PortalJS** is the open-source framework (own the code, host anywhere).
> **PortalJS Arc** is the default managed way to run it (zero-infra, edge-served).
> **PortalJS Cloud** is a managed CKAN backend you *attach* to Arc when a program
> needs heavy cataloging infrastructure. Start on Arc; add Cloud only if you need it.

## One framework, two managed layers

| Product          | What it is                       | When you want it                                                                 |
| ---------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| **PortalJS**     | Open-source framework            | You want to own the code and host anywhere. Free forever, MIT licensed.          |
| **PortalJS Arc** | The default managed layer        | You want a portal live without running infrastructure — AI-built, edge-served, in-browser querying. |
| **PortalJS Cloud** | Managed backend (CKAN)         | Your program needs a heavy cataloging backend. Attach it to any Arc portal — same frontend, no rebuild. |

### PortalJS — the framework

The open-source project: a lightweight Next.js + Tailwind + React template plus a set
of agentic skills. Own every line, host it anywhere, pay nothing. See
[Get started](/docs/quickstart) and [/opensource](/opensource).

### PortalJS Arc — the default managed layer

Zero-infra managed portals: [`/portaljs-deploy`](/docs/skills/portaljs-deploy) builds a
static export and serves it from Cloudflare's edge, with in-browser querying over your
data. It's the default way to run PortalJS when you don't want to manage servers. See
[PortalJS Arc](/docs/arc).

Architecturally, Arc is the **publish / explore / share** layer that sits on top of a
compute+storage backend. Its built-in zero-infra stack (object storage on R2, edge
hosting, client-side DuckDB-Wasm compute) covers the self-serve and small-to-mid case
with nothing to provision. When data outgrows the browser, the compute backend is
pluggable behind the same catalog UX.

### PortalJS Cloud — the managed backend

A managed **CKAN** backend for programs that need heavy cataloging infrastructure. You
don't start here — you *attach* it to an Arc portal when a program needs it, keeping the
same frontend with no rebuild. See [Backends](/docs/backends) for how PortalJS stays
decoupled from whatever catalog you run.

## How they compose

```
PortalJS (open-source framework)
   └── run it your way:
        ├── self-host anywhere            (free)
        └── PortalJS Arc  (managed, default)
              └── attach PortalJS Cloud   (managed CKAN backend) — only if you need it
```

Start on Arc. Attach a managed CKAN backend (Cloud) when your program needs one — same
frontend, no rebuild. For plans and pricing, see [Pricing](/pricing).
