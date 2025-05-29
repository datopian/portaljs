---
title: 'Why We Decoupled CKAN’s Frontend — And What We Gained with PortalJS'
metatitle: 'Decoupling CKAN’s Frontend with PortalJS: Performance, UX, Dev Speed.'
created: 2025-05-28
description: "We explain why we chose to decouple CKAN’s frontend and how PortalJS made our data portal faster, more flexible, and easier to maintain. A practical look at SSG, serverless scaling, and modern dev workflows with CKAN."
metadescription: 'Discover how decoupling CKAN’s frontend with PortalJS unlocks faster load times, better UX, easier dev workflows, and scalable data portals.'
authors: ['popovayoana','anuveyatsu']
filetype: 'blog'
image: /static/img/blog/2025-05-28-Why-we-decoupled-CKAN’s-frontend/image1.png
---

![CKAN](/static/img/blog/2025-05-28-Why-we-decoupled-CKAN’s-frontend/image1.png)  

> [!info] The short version?
> [CKAN](https://www.datopian.com/solutions/ckan) is a rock-solid backend for open data portals. 
But what happens when you want to modernize the user experience?
For us, the answer was simple: decouple the frontend.

Modern open data portals need more than just a reliable backend. They need speed, customization, and a frontend that’s easy to scale and maintain.

[CKAN](https://www.datopian.com/solutions/ckan) remains one of the most trusted open-source backends for managing datasets. But when it comes to the frontend experience, we chose to decouple — and here’s why.

In this article, we’ll share why we chose to separate the frontend from CKAN’s traditional stack, how we approached it with **PortalJS**, and what we learned about performance, scalability, and developer experience along the way.

## **CKAN: A Powerful Engine for Open Data**

CKAN is widely used by governments, NGOs, and research institutions. Its backend is flexible, reliable, and API-driven — perfect for managing datasets at scale.

But CKAN ships with a built-in frontend based on Flask, a lightweight Python web framework. While this works well for many use cases, we found that as user expectations evolved, so did the need for a more dynamic, scalable, and customizable frontend experience.

That’s when we started asking:

**What if we didn’t replace CKAN, but extended it — with a modern frontend layer built around today’s web standards?**

## **What Is PortalJS and How Does It Work with CKAN?**

**PortalJS** is a decoupled frontend framework built on Next.js. It connects to CKAN via API and replaces the traditional Flask frontend with a faster, more flexible layer.

**Key Features**

- **Static Site Generation (SSG):** Pre-render content that doesn’t change often
- **Incremental Static Regeneration (ISR):** Update static content in the background
- **Serverless functions:** Handle dynamic parts on demand
- **React + TailwindCSS:** Build beautiful, responsive interfaces

This means you can keep CKAN’s backend and get a frontend that:
- Loads faster
- Scales easier
- Is more fun to build on

## **The Case for a Decoupled Frontend**

Our decision wasn’t about what's wrong with CKAN — it was about what's possible with a decoupled architecture.

### **Monolithic Frontends: Solid, But Not Always Flexible**

The traditional CKAN frontend is tightly coupled to the backend:

- Each page is rendered dynamically by the server
- Customizing the UI often means diving into Python templates
- Developers need to manage full local stacks (Docker, Solr, PostgreSQL, Redis)

This setup is reliable but comes with friction — especially for frontend teams used to modern JavaScript tooling and performance patterns.

## **Why We Decoupled: The Benefits of Using PortalJS with CKAN**

We built **PortalJS** to bring the best of both worlds together:

- Keep CKAN as the backend
- Replace the frontend with a modern, decoupled layer powered by **Next.js**

PortalJS communicates with CKAN over its existing API. You still use CKAN to manage datasets, users, organizations, and metadata — but everything the user sees is rendered through a faster, more flexible frontend. 

## **What We Gained by Decoupling**

### **Better Performance**

PortalJS uses Next.js features like:

- **Static Site Generation (SSG)** for pages that rarely change
- **Incremental Static Regeneration (ISR)** for fresh content, without backend load
- **Serverless functions** for dynamic rendering only when needed

This reduces API strain, speeds up page loads, and improves SEO dramatically.

### **Happier Developers**

Setting up CKAN’s frontend locally means spinning up Docker containers, databases, and search services.

With PortalJS, the workflow looks like this:

```shell
npm install
npm start
```

That’s it. Developers can focus on building features, not configuring infrastructure.

### **More Customization**

Because PortalJS is built with React and TailwindCSS, it’s easy to:

- Redesign pages and navigation
- Add filters and search interactions
- Create responsive, mobile-friendly layouts

You're no longer bound to the default CKAN UI — you can make it your own.

## **Example: How We Handle Dataset Metadata Pages**

In CKAN, every metadata page is rendered dynamically — even though most of that information rarely changes. And every visit hits the backend and database.

With PortalJS, we pre-generate those pages using SSG. That means:

- Instant load times
- No database hit
- SEO-friendly static content

For parts that do change (like download counts or updated timestamps), we use client-side rendering or ISR.

It’s the best of both worlds.

## **CKAN + PortalJS: A Collaborative Architecture**

**PortalJS is a frontend layer that works with CKAN — not against it.**

You keep CKAN’s backend, workflows, extensions, and APIs.

But you gain:

- A smoother user experience
- Easier customization
- Better performance and scalability
- Simpler developer onboarding

It’s the same engine — just a better dashboard.

## **Who This Is For**

We’ve seen PortalJS help:

- Governments modernize their public open data portals
- Nonprofits simplify dataset publishing
- Enterprises create internal data platforms with custom branding and UX

If you're already using CKAN and want a more modern, maintainable frontend — **this is for you.**

## **Final Thoughts: Let CKAN Do What It Does Best**

CKAN remains one of the best backend systems for open data.

PortalJS doesn’t change that — it simply opens new possibilities.

By decoupling the frontend, we’ve been able to deliver faster, more beautiful, more usable portals — while still relying on the CKAN core that’s trusted worldwide.

[🔗 Explore the full technical breakdown](https://www.portaljs.com/blog/why-portaljs-is-the-future-of-decoupled-frontend-for-data-portals)

## **FAQs**

**What’s the main reason to decouple the CKAN frontend?**

To improve performance, scalability, and developer experience by using a modern, API-first frontend.

**Does PortalJS replace CKAN?**

No. PortalJS replaces only the frontend. CKAN still powers the backend, APIs, and admin functions.

**Can I use existing CKAN extensions?**

Yes. Since the backend remains CKAN, your extensions continue working as expected.

**Where do I deploy PortalJS?**

It runs on any frontend hosting provider. We recommend Vercel, Netlify, or Cloudflare Pages.

**What’s the dev experience like?**

Fast. No Docker required. Just clone, install dependencies, and start building with React.




