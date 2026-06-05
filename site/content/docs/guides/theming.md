---
metatitle: Theming PortalJS – Bring Your Own Branding
metadescription: Brand your PortalJS portal with your own colors, type, and layout. Hand your AI assistant a DESIGN.md brief, or edit Tailwind config and globals.css directly — plain, editable code.
title: Theming
description: Bring your own branding — hand your AI assistant a DESIGN.md, or edit Tailwind directly.
---

**Goal:** make the portal look like *yours* — your colors, type, and layout — without
fighting a design system. The template is plain Next.js + Tailwind, so theming is just
editing code.

> [!info] No magic theme layer
> PortalJS doesn't ship a theme runtime or a config you fight. Styling is ordinary
> Tailwind utility classes on plain components — change them and the portal changes.

## The AI path — bring your own `DESIGN.md`

The cleanest way to brand a portal with an AI assistant is to hand it a **design
brief** — a `DESIGN.md` in the repo that states your brand foundations: color tokens,
type, and layout posture. The assistant reads it and applies those tokens across
`tailwind.config.js`, `styles/globals.css`, and the components.

A brief is short and concrete. For example:

```markdown
# Brand foundations

## Color tokens
- accent:  #2563eb   (primary)
- bg:      near-white canvas
- fg:      slate ink (#1e293b)
- border:  hairline gray

## Type
- Display + body: Inter / system sans — weight contrast carries hierarchy.
- Mono: JetBrains Mono — for IDs and code.

## Layout posture
- Generous whitespace, light canvas. Hairline 1px borders, 12–16px card radius,
  no heavy shadows. One accent color.
```

Then ask: *"Apply the branding in DESIGN.md to this portal."* Because the output is
plain code, you can review and tweak every change by hand afterward.

## The by-hand path

Everything the brief drives, you can edit directly:

- **Colors and fonts** — extend the palette and `fontFamily` in
  `tailwind.config.js` under `theme.extend`, then use the new utility classes in your
  components.
- **Global styles and CSS variables** — set brand tokens (e.g. `--accent`, `--bg`) in
  `styles/globals.css` and reference them from components or Tailwind.
- **Layout and components** — the components in `components/` (`Table`, `Chart`, `Map`)
  are small and swappable. Edit their classes, or replace them entirely with your own
  design-system components — the data-loading logic is independent of the markup.

## Notes

- **Bring your own stack:** the template never forces a frontend toolchain on a team
  that already has one. Adopt the whole template, or lift the skills and components
  into an existing app — see [Core concepts](/docs/core-concepts).
- **Tailwind Typography:** the template includes `@tailwindcss/typography` (the `prose`
  classes) for long-form text — handy for dataset descriptions and docs-style pages.

## Where to go next

- **[Templates](/docs/templates)** — the single-page vs. catalog starting points.
- **[Deploy](/docs/guides/deploy)** — ship the branded portal.

<DocsPagination prev="/docs/guides/deploy" next="/docs/templates" />
