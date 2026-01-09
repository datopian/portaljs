---
title: "Turning OpenMetadata into a User-Friendly Data Portal with PortalJS"
description: "OpenMetadata is excellent for governance and power users, but difficult for broader audiences. Learn how PortalJS turns OpenMetadata into a user-friendly data portal focused on discovery and navigation."
created: 2026-01-09
authors: ['João Demenech']
tags:
  - PortalJS
  - data portals
  - OpenMetadata
image: "/static/img/blog/2026-01-09-turning-openmetadata-into-a-user-friendly-data-portal-with-portaljs/portaljs-search-page.png"
filetype: 'blog'
---

OpenMetadata is a strong foundation for modern data governance. It excels at managing metadata, lineage, ownership, and data quality, and it is clearly designed for data engineers, platform teams, and governance practitioners.

Its user interface reflects that focus. Concepts such as database services, schemas, and assets are exposed directly, assuming users understand how data infrastructure works. This is effective for power users, but it creates friction when OpenMetadata is used by a broader audience.

Many organizations want researchers, analysts, partners, or other non-technical users to explore their data. For them, how data is stored matters far less than what the data represents and how it can be used.

## Why discovery is hard for non-technical users

In OpenMetadata, navigation mirrors infrastructure:

- database services  
- databases  
- schemas  
- tables and assets  

This structure makes sense technically, but it forces users to understand internal architecture before they can answer a simpler question: *what data exists that is relevant to me?*

Most data consumers think in terms of datasets, domains, topics, and documentation. When discovery depends on understanding storage layers, many users struggle to get value from the catalog.

This is not a limitation of OpenMetadata’s metadata model. It is a mismatch between a governance-first interface and a discovery-first use case.

## Access and sharing add another layer of friction

OpenMetadata is designed as an authenticated system. Requiring users to sign in is often the right choice for governance workflows, but it limits how metadata can be shared.

This makes it harder to:
- Share data with external collaborators  
- Build lightweight discovery experiences  
- Expose selected metadata to broader audiences  

OpenMetadata is not intended to be a flexible, audience-facing data portal — and that’s where an additional layer becomes useful.

## PortalJS as the discovery layer

PortalJS acts as a discovery and experience layer on top of OpenMetadata.

It is an open-source framework for building data portals that focus on usability and navigation. OpenMetadata remains the system of record for governance and lineage, while PortalJS reshapes how metadata is presented to different audiences.

This separation allows teams to keep the full power of OpenMetadata while offering a much simpler experience for data consumers.

![PortalJS Search Page](/static/img/blog/2026-01-09-turning-openmetadata-into-a-user-friendly-data-portal-with-portaljs/portaljs-search-page.png)

## A simpler mental model for data discovery

The PortalJS OpenMetadata template abstracts complex concepts into a taxonomy that better matches how users think:

- **Data Product → Dataset**  
- **Domain → Organization**  
- **Asset → Resource**  

Nothing is removed or simplified at the metadata level. Instead, the presentation changes, reducing cognitive load and making it easier to browse, search, and understand available data.

## What the template provides out of the box

The open-source PortalJS OpenMetadata template includes:

- A dataset search page  
- Domain (organization) browsing  
- A glossary page  
- A dataset details page where users can understand the dataset metadata and browse available resources
- Resource detail pages  

All pages are designed for read-only, exploration-first use. Metadata is fetched directly from OpenMetadata, with no duplication or manual syncing.

![PortalJS Search Page](/static/img/blog/2026-01-09-turning-openmetadata-into-a-user-friendly-data-portal-with-portaljs/portaljs-dataset-details-page.png)

## Open source, flexible by design

The template is built with **Next.js** and **Tailwind CSS**, making it easy to customize, extend, and brand.

Because it is fully open source, teams retain control over:
- The codebase  
- Deployment  
- Access and visibility rules  

PortalJS adapts to your environment and your audience.

## Not just for open data

While PortalJS can power open data portals, the template is not limited to public use cases.

It can be customized to:

- Add authentication  
- Restrict access to specific datasets or domains  
- Expose data conditionally based on users, roles, or custom properties

This makes it suitable for internal catalogs, research portals, partner-facing experiences, and fully public portals alike.

## From governance to discovery

OpenMetadata is built for managing metadata. PortalJS is built for helping people find and understand data.

Together, they allow organizations to turn existing metadata into a user-friendly data portal that serves more people, without replacing governance tooling.

If you are already using OpenMetadata and want to improve data discovery, the open-source PortalJS OpenMetadata template is a practical place to start.

👉 https://github.com/datopian/portaljs-frontend-starter-omd
