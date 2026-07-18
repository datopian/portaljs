# portaljs.com site — internal guide

This is the Datopian-maintained marketing site for PortalJS (portaljs.com), built on
this same repo's Next.js template. This file covers internal conventions for
maintaining the site itself — not the PortalJS framework (see the root `CLAUDE.md`
for that).

## Blog posts (site/content/blog)

Every post's frontmatter must declare `categories:`, using ONLY these five values:

```
PortalJS, PortalJS Cloud, CKAN, AI Integration, Open Data
```

```yaml
categories:
  - PortalJS
  - AI Integration
```

This is a closed list — see `CATEGORIES` in `site/pages/blog.tsx`. It drives both the
label chips and the filter buttons on `/blog`, and there is no other place to configure
either. A category outside this list fails the build (`getStaticProps` throws in
`site/pages/blog.tsx`) rather than silently showing no labels.

To feature a post in the hero cluster at the top of `/blog`, add its slug to
`FEATURED_SLUGS` in the same file (max 4 slots, order controls position).
