---
title: "Supercharging Data Portals with the PortalJS MCP Server"
description: "Explore how the PortalJS MCP server unlocks AI-native discovery, metadata exploration, and data previews for modern portals — now open sourced and easy to integrate."
created: 2025-11-25
authors: ['anuveyatsu']
tags:
  - MCP
  - PortalJS Cloud
  - AI
  - data portals
image: "/static/img/blog/supercharging-data-portals.png"
filetype: 'blog'
---

Back in September this year, we published [our first look at using MCP (Model Context Protocol) servers](/blog/mcp-server-ai-assistants-to-improve-data-portals) to give AI assistants structured access to data portals.

Now the implementation is live and fully open source.

PortalJS MCP runs in production on Cloudflare’s MCP SDK, which gives us a fast, global, edge-native runtime. It comes with low latency, high reliability, and no “AI integration infra tax” for you to pay.

The PortalJS MCP server is publicly available at:

```
mcp.portaljs.com
```

If your data portal runs on PortalJS Cloud, connecting it is dead simple. Your MCP endpoint is:

```
mcp.portaljs.com/@org-name/sse
```

Paste that into ChatGPT, Claude, or any MCP-capable client, and your AI assistant immediately gains structured access to your datasets, metadata, and previews.

And because we think this should be a standard building block for modern data portals, we’ve open sourced the whole implementation here:

https://github.com/datopian/portaljs-mcp-server

Use it, fork it, deploy your own version, or just read through it to understand how MCP can sit cleanly on top of a data portal.

## Why MCP Is a Game-Changer for Data Portals

AI chats are powerful, but without structured access they’re basically guessing. MCP fixes that by giving models secure, predictable tools to interact with real systems — including your data portal.

In practice, this unlocks:

* **Reliable dataset discovery** backed by actual portal data search
* **Accurate metadata exploration** without hallucination risk
* **On-demand previews** (rows, schema, field types)
* **One clean integration** that works across multiple AI clients

This effectively turns your AI assistant into a precision data navigator — not just a polite autocomplete engine.

## What’s Available in the MCP Today

The initial toolset focuses on high-value workflows for discovery and exploration:

### Search tool enables data discovery

* List datasets
* Keyword search
* Metadata filtering
* Dataset summaries

### Get tool for metadata exploration

* Resource lists
* Field definitions
* Schema inspection
* Full metadata extraction

### Table preview

* First N rows
* Column summaries
* Type inference
* Lightweight profiling

These tools are designed to be **fast, bounded, and safe**. The model doesn’t pull full datasets — it gets structured previews that are ideal for reasoning and analysis.

## Works with ChatGPT, Claude, VS Code, and More

Our MCP server is model-agnostic by default:

* Claude — native MCP support
* ChatGPT Desktop — native MCP support
* VS Code MCP clients — plug-and-play
* Future MCP-enabled tools — automatically compatible

Wherever your team uses AI, your portal can now show up *as a first-class, tool-based data source*.

## Why Cloudflare’s MCP SDK?

We chose Cloudflare’s SDK because MCP should feel like infrastructure you **never have to think about**.

Using Cloudflare gives us:

* **Edge deployment by default** → fast globally, no region bottlenecks
* **Battle-tested SSE support** → stable streaming tool calls
* **Simple scaling model** → no infra babysitting as usage grows

This matters because AI tooling isn’t forgiving. If your MCP endpoint is slow or flaky, your user’s trust evaporates instantly. Cloudflare’s runtime lets us keep it sharp.

## What’s Coming Next

This is only the first layer. We’re already expanding the MCP toolbox, including:

* Write-back tools (tags, notes, curation workflows)
* Automated metadata enrichment
* Data quality checks
* Permission-aware exploration
* Semantic search
* Lineage and observability integration

The direction is clear: your data portal becomes an intelligent interface, not a static catalog.

## Try It Today

If your portal runs on PortalJS Cloud, your MCP endpoint is:

```
https://mcp.portaljs.com/@org-name/sse
```

Plug it into your AI assistant and start exploring your data conversationally — with real structure, real metadata, and real previews.

Want help rolling this out to your team or customers? Reach out. We’re building this to make data portals genuinely useful in an AI-first world.
