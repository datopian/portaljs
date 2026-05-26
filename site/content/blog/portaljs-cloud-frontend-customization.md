---
title: "Can the client make changes to the portal frontend code independently?"
created: 2026-05-18
tags:
  - portaljs-cloud
  - customization
  - frontend
  - development
  - github
  - vercel
keywords: PortalJS Cloud customization, data portal frontend custom code, PortalJS custom development
description: "Can you customize PortalJS Cloud independently? Here's how GitHub contributor access works, what the Vercel deployment constraint means in practice, and when to involve the Datopian team."
authors: ['Yoana Popova']
canonical: https://www.portaljs.com/blog/portaljs-cloud-frontend-customization
image: /static/img/blog/2026-05-18-portaljs-cloud-frontend-customization/og-image.png
filetype: 'blog'
---

If your organization has in-house developers and wants to customize the look and feel of your PortalJS Cloud portal, you can. PortalJS Cloud is built on [open-source foundations](https://www.portaljs.com/opensource): the codebase is [available on GitHub](https://github.com/datopian/portaljs), and clients can contribute directly. Here is how it works and what to know before you start.

## How Contributor Access Works

To make changes to your portal's frontend code, your developers need to be added as contributors on the portal's GitHub repository. They can then submit pull requests with their changes. Because PortalJS Cloud portals are deployed via [Vercel](https://vercel.com/), changes go through a review and approval process before they go live. This is a technical requirement of the deployment architecture, not a gatekeeping decision.

## What You Can Customize

- **Visual design**: colors, fonts, layout, and branding elements beyond the basic branding included in your plan
- **Component behavior**: how dataset cards, search results, and organization pages render
- **Custom pages**: adding new pages or sections to the portal
- **Integrations**: connecting third-party tools or embedding external content
- **Data visualizations**: adding visualization components for non-built-in file formats or changing the behavior of the built-in visualization components

## The Approval Process

All changes go through code review before deployment. This protects the stability of your portal and ensures changes do not break the managed infrastructure. In practice, straightforward frontend changes move through review quickly. More complex changes may take longer.

## When to Involve the Datopian Team

Clients are free to take their PortalJS Cloud frontend as far as they want, including a full redesign and reimplementation, without needing to involve [Datopian](https://www.datopian.com/). The codebase is yours to work with.

There are two situations where bringing in the Datopian team makes sense:

**Backend changes.** If your customization requires changes to the CKAN backend, custom extensions, modified data workflows, or API-level changes, that goes beyond frontend contributor access and requires Datopian's involvement.

**Design and implementation by Datopian.** If your organization wants Datopian to lead the customization work rather than your own developers, that is also an option. Enterprise engagements, like [SSEN](https://data.ssen.co.uk/), [City of Ann Arbor](https://data.a2gov.org/), and others, are projects where Datopian customizes both the frontend and the backend to the client's requirements.

See [PortalJS Cloud pricing](https://www.portaljs.com/pricing) for plan details, or [get in touch](https://www.datopian.com/contact) to discuss your specific requirements.

## Bottom Line

Yes, you can customize your portal frontend. The process involves GitHub contributor access and a review step before deployment. For frontend-only work, from minor branding tweaks to a complete redesign, your developers can handle it independently. Involve the Datopian team when you need backend changes or want Datopian to own the implementation.

Ready to customize your portal? [Get in touch with the Datopian team](https://www.datopian.com/contact) or [try PortalJS Cloud free](https://cloud.portaljs.com/auth/signup), no credit card required.
