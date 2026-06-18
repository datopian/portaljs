---
title: "Does PortalJS Cloud have APIs?"
created: 2026-05-26
tags:
  - portaljs-cloud
  - api
  - ckan
  - migration
  - open-data
keywords: PortalJS Cloud API, CKAN API migration, open data portal API
description: "Migrating from CKAN to PortalJS Cloud and worried about your API integrations? Here's exactly what stays the same, what changes, and what you need to know before you migrate."
authors: ['Yoana Popova']
canonical: https://www.portaljs.com/blog/portaljs-cloud-apis
image: /static/img/blog/2026-05-26-portaljs-cloud-apis/hero.png
filetype: 'blog'
---

If you're managing a data portal on [CKAN](https://ckan.org) and considering a move to PortalJS Cloud, one of the first questions you'll have is: what happens to my APIs?

Your dashboards, external applications, and third-party integrations likely depend on them. The short answer is: yes, PortalJS Cloud has APIs, and they are CKAN-compatible.

![PortalJS Cloud API compatibility overview](/static/img/blog/2026-05-26-portaljs-cloud-apis/api-compatibility-overview.png)

Here is what that means in practice.

## What APIs Does PortalJS Cloud Expose?

PortalJS Cloud is built on top of CKAN's battle-tested data APIs, the same APIs that power thousands of government and research portals worldwide. This means all standard [CKAN Action API](https://docs.ckan.org/en/latest/api/index.html) endpoints your organization already relies on continue to work without modification.

Dataset listings, resource access, full-text search, organization and group management, harvesting, it is all there. If your integration currently calls `action/package_search`, `action/datastore_search`, or any other standard CKAN endpoint, those calls continue to work after migration.

## What Changes When You Migrate from CKAN?

The backend APIs stay the same. What changes is the frontend.

PortalJS Cloud replaces CKAN's Flask-based UI with a modern [Next.js](https://nextjs.org/) frontend. Your existing integrations that call the CKAN API directly are unaffected. The portal your users see gets faster, more accessible, and more capable. The data infrastructure underneath stays familiar.

This is by design. Datopian built CKAN and has maintained it for over two decades. We know how deeply organizations depend on its API layer, and we did not want migration to mean a rewrite of every integration. See our [CKAN integration page](https://www.portaljs.com/ckan) for more on how the two work together.

## What About the Back Office?

One area worth flagging upfront: PortalJS Cloud's admin interface has some customization limitations compared to a fully self-hosted CKAN instance. If your team relies on heavily modified CKAN extensions in the back office, that is worth discussing before you migrate.

The exception is the Enterprise plan, which includes bespoke development and can accommodate custom back-office requirements. See [PortalJS Cloud pricing](https://www.portaljs.com/pricing) for a full plan comparison.

## PortalJS Cloud Is Not a CKAN Competitor, It Is an Alternative to the Infrastructure Around It

This is worth saying clearly: PortalJS Cloud is not built to replace CKAN or compete with it. Datopian created CKAN and continues to maintain it. PortalJS Cloud exists for a different reason.

CKAN is free and open source, and compared to proprietary alternatives like [Socrata](https://www.portaljs.com/compare/socrata) or [OpenDataSoft](https://www.portaljs.com/compare/opendatasoft), which carry significant licensing fees, complex pricing tiers, and vendor lock-in, it is extraordinarily cheap. **If you have the engineering capacity to run it, self-hosted CKAN remains one of the best-value options in the data portal space.**

The problem is not CKAN. The problem is what it takes to run it.

Servers, DevOps engineers, security patching, version upgrades, infrastructure monitoring: none of that is free. For large national governments with dedicated engineering teams, that operational cost is manageable. For a mid-sized city council, a university data team, or an NGO publishing open data on a shrinking budget, it often is not.

PortalJS Cloud is for those organizations. It keeps you in the open-source CKAN ecosystem, same APIs, same data layer, same standards, without requiring you to also be your own hosting provider.

## Searchable Data API

Beyond the CKAN-compatible APIs, PortalJS Cloud also supports a Searchable Data API as an optional add-on. This makes your datasets queryable by external developers, dashboards, and applications, not just browsable through the portal interface. If your use case involves programmatic data consumption by third parties, this is worth discussing with [the Datopian team](https://www.datopian.com/contact).

## What Does Not Change

To be direct: migrating from CKAN to PortalJS Cloud will not break your external integrations. The API contracts are compatible, the data layer stays the same, and the modern frontend is additive rather than disruptive.

For organizations managing citizen-facing portals where external developers or applications consume data programmatically, as is the case with portals run by the [Bank of England](https://www.bankofengland.co.uk/) and [Transport Data Commons](https://portal.transport-data.org/), this continuity is the main thing to understand before committing to a migration decision.

## Practical Migration Path

We have migrated a number of organizations from self-hosted CKAN to PortalJS Cloud, including government agencies and research institutions. The API compatibility means the migration scope is typically limited to the frontend and any back-office customizations specific to your CKAN extensions.

If you have specific integration requirements, particularly around the CKAN Datastore, custom API extensions, or authenticated API access, bring those into the conversation early. They are solvable, but easier to scope correctly upfront than to address after go-live.

You can also review the [PortalJS open-source repository on GitHub](https://github.com/datopian/portaljs) to understand the codebase before committing.

Have questions about your specific API setup? [Get in touch with the Datopian team](https://www.datopian.com/contact) or [try PortalJS Cloud free](https://cloud.portaljs.com/auth/signup), no credit card required.
