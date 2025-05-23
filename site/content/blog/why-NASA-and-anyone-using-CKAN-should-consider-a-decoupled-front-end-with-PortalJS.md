---
title: 'Why NASA — and Anyone Using CKAN — Should Consider a Decoupled Front-End with PortalJS'
created: 2025-05-19
description: "NASA’s open data portal is powered by CKAN—but what if its user experience could match its scientific depth? This post explores how a decoupled frontend using PortalJS can transform performance, design flexibility, and scalability—without changing the backend. Learn how CKAN and PortalJS can work together to deliver a faster, smarter, and more user-friendly data experience."
authors: ['anuveyatsu', 'popovayoana']
filetype: 'blog'
image: /static/img/blog/2025-05-19-why-anyone-should-consider-decoupled-frontend/image2.webp
---

## **Imagine a Faster, Smarter NASA Data Portal**

What if a climate scientist visiting [data.nasa.gov](https://data.nasa.gov) could explore global time-series datasets through an interface that loads instantly, adapts to their workflow, and feels intuitive—on any device?
Today, NASA’s portal runs on CKAN’s built-in frontend, which serves its purpose but limits performance and flexibility. By adopting a **decoupled frontend using PortalJS**, NASA could dramatically improve speed, user experience, and accessibility—without changing the backend.
**This shift unlocks a more modern open data experience**, tailored for researchers, analysts, and developers working with large, complex datasets.

![CKAN](/static/img/blog/2025-05-19-why-anyone-should-consider-decoupled-frontend/image2.webp)  

## **The Current CKAN-Based Approach**

[NASA’s portal](https://data.nasa.gov) uses CKAN’s built-in frontend — a unified structure where the user interface and backend are tightly connected.

### **Monolithic UI & API**

CKAN’s integrated UI and backend deliver robust search and data-management workflows out of the box. It serves well for dataset CRUD, geospatial previews, and basic theming.

**What Works:**

- Out-of-the-box dataset management
- Geospatial previews
- Basic theming and search

**Limitations**

- **Release Cycle Coupling:** UI updates often require CKAN core upgrades or plugin rebuilds.

> [!info] In simple terms
> If you want to tweak the interface, you have to dig into the backend code. That slows things down and makes small changes more complicated than they should be.

- **Branding Constraints:** Deep theming adjustments can be labor-intensive and risk conflicts with upstream.

> [!info] In simple terms
> Making your portal look like “NASA” (or any other organization) takes a lot of effort, and those changes may not survive future updates.

- **Performance Overheads:** Server-side rendering for every page load can introduce latency under heavy traffic.

> [!info] In simple terms
> Every time someone opens a page, the server has to rebuild it. That slows things down when lots of people visit at once.

## **Why a Decoupled PortalJS Front-End?**
PortalJS is a frontend framework purpose-built for CKAN. PortalJS consumes CKAN’s REST API and renders the frontend independently using Next.js. This architecture gives teams more control over UX, while keeping the backend untouched.

**Key advantages:**

**1. Rapid Iteration**

PortalJS applications consume CKAN’s REST APIs, enabling independent deployment of UI components. New features — like custom data-visualization panels — can ship without touching the CKAN codebase.


**2. Enhanced UX & Branding**

- **Component Library:** Reusable “DatasetCard,” “FilterPanel,” and “MapExplorer” snippets conform to NASA’s design system.
- **Responsive & Accessible:** Built-in patterns for ARIA compliance and mobile-first layouts ensure broad reach.

> [!info] In simple terms
> You can make the portal look and feel exactly how your users expect, with reusable building blocks. Works well on phones and meets accessibility standards by default.

**3. Scalability & Resilience** Scalability & Resilience By hosting the PortalJS front end on a CDN (e.g., Cloudflare) and separating it from CKAN servers, static assets load faster and UI downtime can be decoupled from backend maintenance windows.

> [!info] In simple terms
> Pages load almost instantly because they’re already generated and stored near your users — no waiting for the server to respond.

## **A Blueprint for Decoupled Architecture**

A decoupled setup keeps CKAN as the backend and places PortalJS on top as the user-facing layer. The backend stays stable, while the frontend can evolve quickly and scale independently. You serve pages fast, keep your infrastructure lightweight, and give teams more control.

**1. API Gateway:**
- AWS API Gateway or CloudFront Lambda@Edge enforcing API keys, rate-limits, and caching for CKAN REST endpoints.


**2. PortalJS Application:**
- Deployed to an S3 bucket + CloudFront distribution.
- Integrations: CKAN’s /api/3/action routes for dataset search, resource download, and user authentication.


**3. Extensibility Hooks:**
- **Widget Registry:** Dynamically load visualization widgets (e.g., D3 timelines, Cesium 3D maps) based on dataset metadata.
- **Theme Manager:** Allow NASA web teams to tweak color tokens and font scales via a JSON config file.

![PortalJS](/static/img/blog/2025-05-19-why-anyone-should-consider-decoupled-frontend/PortalJS.gif) 

## **Why This Matters**

CKAN’s backend is solid. But a modern frontend makes ALL the difference. 

This isn’t just about NASA. The same constraints exist for many governments, research labs, and institutions using CKAN.

**Decoupling with PortalJS** unlocks:
- Speed
- Flexibility
- Custom and modern UX
- Resilient architecture

> [!info] Bottom line
> Your portal can grow, adapt, and look modern — without expensive rebuilds or risky changes to your data backend.

### **See It in Action**

Curious what this would look like for your team? Start a pilot in minutes — no backend changes required. 

If you’d like to explore a PortalJS pilot on your CKAN instance — government, research institution, or enterprise — visit our [site](https://www.portaljs.com) and get started in minutes!

📩 [Talk to us](https://calendar.app.google/sn2PU7ZvzjCPo1ok6) to discuss your use case.

---