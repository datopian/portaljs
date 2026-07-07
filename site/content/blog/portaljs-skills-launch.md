---
title: "Launch day: PortalJS skills, install with one command"
description: "PortalJS agent skills are now live and installable anywhere. One command gives your AI assistant 12 skills that scaffold a data portal, load datasets, generate DCAT and Croissant metadata, and deploy."
created: 2026-07-07
authors: ['anuveyatsu']
tags:
  - PortalJS
  - AI
  - agents
  - skills
  - data portals
filetype: 'blog'
---

Two weeks ago we wrote that [PortalJS is now AI-native](https://www.portaljs.com/blog/portaljs-is-now-ai-native). Today is launch day: the skills are live, installable anywhere, and rolling out across the agent skill directories.

## One command

```bash
npx skills add datopian/portaljs
```

That installs the PortalJS skills into your AI coding agent. Claude Code is the primary target today, and the skills follow the open SKILL.md standard. Prefer to start from the template instead?

```bash
npm create portaljs@latest my-portal
```

Both paths give you the same thing: a plain Next.js portal you own, with no lock-in and any backend.

## What shipped

Since the AI-native announcement the skill set has grown to 12, covering the unglamorous parts a real portal needs:

- `/portaljs-new-portal` scaffolds a portal from a plain English brief
- `/portaljs-add-dataset` loads CSV, TSV, JSON, and GeoJSON and builds dataset pages
- `/portaljs-add-dcat` generates standards compliant metadata: DCAT v2 and v3, DCAT-US, DCAT-AP with country profiles, GeoDCAT-AP, and Croissant for ML datasets
- `/portaljs-migrate` pulls an existing catalog out of CKAN, Socrata, OpenDataSoft, or ArcGIS
- `/portaljs-connect-ckan` keeps your backend and replaces only the frontend
- `/portaljs-deploy` builds a static export and publishes it with a live URL

Charts, maps, schema inference, and data quality checks round out the set.

## Example: a city portal in 30 minutes

We rebuilt the City of Kyle, TX open data portal in about 30 minutes: 62 datasets across 6 departments, budget charts, and department groupings, all from one prompt. Four of us built four versions from the same brief and voted for the best one. The [full writeup is on Dev.to](https://dev.to/anuveyatsu/i-rebuilt-a-texas-citys-open-data-portal-in-30-minutes-with-claude-code-3cde), and the winner is live at [city-of-kyle-open-data.arc.portaljs.com](https://city-of-kyle-open-data.arc.portaljs.com/).

## Where this is going

The bigger idea: your agent builds the portal, and your users' agents will query it. DCAT and Croissant support is the first half of that story. An MCP server in every published portal is on the [roadmap](https://github.com/datopian/portaljs/blob/main/VISION.md).

PortalJS is open source (MIT), built by [Datopian](https://www.datopian.com) and the community. If this is useful, [a star on GitHub](https://github.com/datopian/portaljs) helps others find it, and the [Discord](https://discord.gg/krmj5HM6He) is where the conversation happens. Try it on your city's data and show us what you build.
