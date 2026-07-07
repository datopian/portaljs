---
title: 'I rebuilt a Texas city''s open data portal in 30 minutes with Claude Code'
created: 2026-07-06
description: "The City of Kyle, TX publishes budgets, investment reports, and utility data on a portal that feels heavy and dated. Using PortalJS agent skills, one prompt scaffolded a modern replacement: 62 datasets, budget charts, department pages, deployed live. Four of us built four versions and voted for the best."
authors: ['anuveyatsu']
tags:
  - PortalJS
  - AI
  - civic data
  - open data
filetype: 'blog'
---

The City of Kyle, TX has an open data portal. That already puts it ahead of most cities its size: budgets, investment reports, police data, water utilities, all published. But like a lot of municipal portals, it runs on a hosted catalog platform that feels heavy. Pages load slowly, the UI is dated, and the experience is closer to a document management system than to a modern website.

I'm one of the maintainers of [PortalJS](https://github.com/datopian/portaljs), an open source (MIT) framework for building data portals, and this felt like the perfect test for something we recently shipped: agent skills that build and revamp portals from a plain English brief. So I timed myself rebuilding Kyle's portal frontend. About 30 minutes of actual work, and the result is live below.

## The setup (2 minutes)

The recommended path is one command, nothing to install beyond Node 22+:

```bash
npm create portaljs@latest my-portal
```

That scaffolds a plain Next.js portal with sample data, and the PortalJS skills come pre-installed inside the project. Start a Claude Code session in that directory, type `/`, and the `portaljs-*` commands are there.

## Describe the portal (one prompt)

```
/portaljs-new-portal build a revamped open data portal for City of Kyle in TX
```

This is where it got interesting. The skill looked at what Kyle actually publishes, then built the portal around it: 62 datasets across 6 city departments, a home page with FY2026 General Fund figures, a revenue breakdown chart (sales tax, property taxes, transfers), datasets grouped by department, and featured showcases for the budget book, transparency dashboard, and strategic plan.

Every portal gets the same three surfaces: a Home page, a Catalog at `/search`, and a Showcase page per dataset with metadata, previews, and download links. All of it plain, editable Next.js. No lock-in, no platform. (This blog you're reading runs on PortalJS too.)

## Four builds, one vote

Here's the part that says more about this workflow than any feature list: four of us on the team each ran the same exercise and built our own version of the portal from the same brief. Then we compared them and voted for the strongest one. When scaffolding a full portal costs half an hour instead of weeks, "build four and pick the best" becomes a completely reasonable way to design.

All four are live, so you can judge our vote yourself:

1. [https://city-of-kyle-open-data.arc.portaljs.com/](https://city-of-kyle-open-data.arc.portaljs.com/) (the winner, and the one this post walks through)
2. [https://city-of-kyle.arc.portaljs.com/](https://city-of-kyle.arc.portaljs.com/)
3. [https://kyle-open-data.arc.portaljs.com/](https://kyle-open-data.arc.portaljs.com/)
4. [https://kyle-tx-open-data-portal.arc.portaljs.com/](https://kyle-tx-open-data-portal.arc.portaljs.com/)

## Ship it (5 minutes)

```
/portaljs-deploy
```

That builds a static export and publishes it to PortalJS Arc (Datopian-managed hosting on Cloudflare) with a live URL. The same app deploys anywhere Next.js does: Vercel, Cloudflare Pages, your own box.

To be clear, this is a demonstration rebuild on the city's public data, not an official City of Kyle project. The point is what a small team can do in an afternoon.

## Try it on your city

Beyond the scaffold, other skills cover the unglamorous parts a real portal needs: `/portaljs-add-dataset` for loading CSVs and GeoJSON, `/portaljs-add-dcat` for standards-compliant DCAT feeds so national catalogs can harvest you, `/portaljs-migrate` for pulling a whole catalog out of CKAN, Socrata, OpenDataSoft, or ArcGIS, and `/portaljs-connect-ckan` if you want to keep your existing backend and only replace the frontend.

Most cities' portals deserve better frontends, and now the cost of finding out what "better" looks like is one prompt. The repo is at [https://github.com/datopian/portaljs](https://github.com/datopian/portaljs). Try it on your city's data, and if it's useful, a star helps others find it. I'd love to see what you build, and criticism is welcome in the [issues](https://github.com/datopian/portaljs/issues) and [discussions](https://github.com/datopian/portaljs/discussions).
