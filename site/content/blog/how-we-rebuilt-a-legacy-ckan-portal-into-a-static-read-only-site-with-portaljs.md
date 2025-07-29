---
title: 'How We Rebuilt a Legacy CKAN Portal into a Static, Read-Only Site with PortalJS'
description: 'Migrating from a heavy CKAN 2.6 portal to a fast, fully static frontend — and the technical journey behind it.'
created: 2025-07-29
authors: ['baglanadaskhan']
filetype: 'blog'
faqs:
  - question: "Why did you migrate from CKAN to a static site?"
    answer: "CKAN 2.6 was outdated and required significant maintenance with legacy plugins. We wanted to preserve data access while eliminating infrastructure complexity and costs."
  - question: "How do you handle search without a backend database?"
    answer: "We use Lunr.js, a client-side search engine that creates a compact index (~1MB) from all datapackage.json files at build time, providing fast in-browser search."
  - question: "What data format did you use for the migration?"
    answer: "We used the Frictionless Data Package specification, exporting each dataset as a datapackage.json file organized by publisher in a hierarchical structure."
  - question: "How many datasets were preserved in the migration?"
    answer: "Over 1,000 datasets were successfully preserved and made discoverable through the new static portal."
  - question: "What are the main benefits of the static approach?"
    answer: "The site loads in milliseconds, infrastructure costs are nearly eliminated, maintenance is reduced to GitHub workflows, and it's served entirely via CDN."
  - question: "What features were intentionally removed?"
    answer: "We removed CKAN's web UI, admin panel, Solr search engine, and all user authentication features, focusing purely on data access and discovery."
---

## Background

[DataHub v1](https://old.datahub.io/) was originally built as a CKAN 2.6-based data portal, hosting thousands of open datasets from organizations across the world. For many years, it served as a reliable place to discover, download, and share data. But like many long-running platforms, it started to show its age.

Over time, the maintenance burden grew increasingly difficult to justify:

* CKAN 2.6 was outdated and lacked long-term support
* The portal depended on numerous legacy plugins, some of which were custom and unmaintained
* Upgrades became risky and time-consuming
* Day-to-day stability relied on manual patching and workarounds

At the same time, the **value of the data remained high** — historical records, research outputs, and public datasets that people still searched for and used. We didn’t want to lose that. But we also didn’t want to keep investing in heavy infrastructure just to preserve read-only access.

So the idea emerged: **what if we turned the portal into a fully static site — no backend, no databases, just fast, reliable, and simple?**

## The Goal

We wanted to preserve:

* Access to all datasets
* Dataset metadata (title, description, tags, license, resources)
* Basic search and navigation
* A clean and consistent UI

And we wanted to remove:

* The need for CKAN backend services (PostgreSQL, Solr, extensions)
* Admin/user accounts and dynamic features
* Any part of the system that required manual ops or upgrades

Our target was a **read-only static portal**, built on modern tooling and served entirely over CDN.

## From Legacy to Lightweight

### Stabilizing the CKAN Instance

Before migrating, we had to ensure the old CKAN site was stable enough to extract data from. We:

* Disabled login and registration
* Made the instance read-only
* Removed unused and broken plugins like `disqus`, `datapub`, and `validation`

This left us with a clean, static snapshot of the portal’s content that could be safely extracted.

### Extracting Metadata

We needed a format that was both machine-readable and flexible. We chose the [Frictionless Data Package](https://specs.frictionlessdata.io/data-package/) spec — a widely used standard in the open data world.

Each dataset was exported as a datapackage.json file. For better structure and clarity, we organized them semantically by publisher:

```bash
/datasets/
  └── organization-name/
        └── dataset-name/
              ├── datapackage.json
        └── organization.json
```

This simple hierarchy helped mirror how CKAN groups datasets by organization, and allowed for clear URL routing and static page generation.

All metadata files and downloadable resources were uploaded to Cloudflare R2 — an S3-compatible object storage with global CDN support.

### Building the Frontend

We chose [PortalJS](https://portaljs.com/) — an open-source, React/Next.js-based framework designed for data portals. It allowed us to build:

* A homepage with basic intro and quick search
* A dataset listing page
* A dataset detail page rendered directly from datapackage.json

Everything is statically rendered at build time, including SEO metadata, resource tables, and file links.

We also customized layout components using TailwindCSS and React, giving the new portal a clean and responsive interface.

### Implementing Search Without a Backend

CKAN uses Solr for powerful search, but it’s a server-side dependency. We replaced it with [Lunr.js](https://lunrjs.com/), a client-side search engine that indexes documents in the browser.

We wrote a script that scans all `datapackage.json` files and builds a Lunr index at deploy time. The result is a fast, compact index (\~1MB) bundled with the frontend and loaded entirely in-browser.

For our use case — static data and a finite number of datasets — Lunr was the perfect fit.

### CI/CD and Deployment

We automated everything with GitHub Actions:

* Build the PortalJS frontend
* Pull latest metadata and generate search index
* Deploy to Vercel

There’s no server, no database, and nothing to monitor. The site is regenerated automatically when content changes.

## What We Removed — By Design

This wasn’t a downgrade — it was a conscious shift toward minimalism. We removed:

* CKAN’s web UI and admin panel
* Solr search engine
* Login, registration, and permissions

What remained was what mattered most: **the data itself**, presented clearly and accessibly.

## Results

* Over **1,000 datasets** preserved and discoverable
* Site loads in milliseconds — no waiting for backend queries
* Infrastructure costs nearly eliminated
* Maintenance reduced to a few GitHub workflows

The new [old.datahub.io](https://old.datahub.io/) is not just faster — it's also cleaner, safer, and easier to evolve.

---

Thanks for reading\! Want to explore more? Check out [PortalJS](https://portaljs.com/), or reach out if you’re thinking of giving your legacy data portal a second life — static, searchable, and serverless.
