# portaljs.com site — internal guide

This is the Datopian-maintained marketing site for PortalJS (portaljs.com). This
file covers conventions for maintaining the site itself — not the PortalJS
framework (see the root `CLAUDE.md` for that).

## Publishing a blog post (`site/content/blog/<slug>.md`)

The file name is the slug: `content/blog/my-post.md` → `/blog/my-post`.

```yaml
---
title: "Post title"
description: "One or two sentences; used on the card, in feeds and for SEO."  # always set it
created: 2026-10-21
authors: ['anuveyatsu']          # id or name of a person in content/people/
tags:                            # free-form keywords; the post page shows the first 3
  - PortalJS
  - data portals
categories:                      # closed list, see below; drives /blog chips + filters
  - PortalJS
  - Tutorial
image: /static/img/blog/my-post/hero.png
filetype: 'blog'
---
```

### `categories:` — closed vocabulary

`categories:` is the only thing that puts label chips on a post's card and makes
it show up under the filter buttons on `/blog`. Allowed values, in display order:

```
PortalJS, PortalJS Cloud, CKAN, AI Integration, Open Data,
Tutorial, Case Study, Civic Data, Research Data
```

- The list lives in `site/lib/blogCategories.ts`; every entry there is also a
  filter button. Adding a category means adding it there (keep the list short).
- The build fails if a post declares a value outside the list (or a non-list
  value) — the error names the post and the valid categories.
- A post without `categories:` builds fine but has no chips and is not
  reachable from any filter, so always set at least one.
- Chips render in vocabulary order regardless of the order in frontmatter;
  cards show at most 3, the small hero cards only the first.
- Flow (`categories: ['PortalJS', 'Tutorial']`) and block lists both work.
  Older posts without `description:` use the flow form on purpose: the fallback
  description is extracted from the raw file, and a block list there leaks
  frontmatter text into the card description.

### Hero image

Put it at `site/public/static/img/blog/<slug>/hero.png` (1200×630 works well)
and reference it as `image: /static/img/blog/<slug>/hero.png`. Posts without an
`image` get the default placeholder card image.

### Featuring a post

The four hero slots at the top of `/blog` are the slugs in `FEATURED_SLUGS` in
`site/pages/blog.tsx` (order = position). Every other post appears in the grid,
newest first by `created`.
