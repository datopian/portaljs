# Landing Page Design — portaljs.com

Design brief for revamping the PortalJS website landing page. Derived from [VISION.md](VISION.md). This is the source of truth for the marketing site's homepage — copy, structure, and visual direction.

## Goal

Make a first-time visitor understand, in under 10 seconds, that **PortalJS is the open-source, AI-native way to build a data portal** — and give them an obvious next action (try it, read docs, or join the community).

## Audience

Primary: **data engineers, data platform teams, and open-data publishers** evaluating how to build or modernize a data portal.
Secondary: **developers** who want a flexible, no-lock-in framework, and **decision-makers** scanning for credibility (OSS, backends supported, community).

## Message hierarchy

What the page must land, in order of priority:

1. **What it is** — open-source, AI-native framework for building data portals.
2. **The new way to build** — describe a portal, your AI assistant scaffolds it and loads data.
3. **No lock-in, your stack, any backend** — MIT, decoupled, works with the catalog/metadata system you already run.
4. **It's real and supported** — active community, examples, used in production.
5. **Two ways to run it** — self-host the open-source framework (primary), or use **PortalJS Cloud**, the managed option (secondary). Never let the hosted product overshadow or gate the OSS path.

## Page sections

### 1. Hero
- **Logo** — the cyclone mark (`assets/portaljs-logo.svg`), blue gradient on light background.
- **Headline:** "The AI-native framework for data portals."
- **Subhead:** Describe the portal you want — your AI assistant scaffolds it and loads your data. Open source, no lock-in.
- **Primary CTA:** "Get started" → docs quickstart (self-host the OSS framework).
- **Secondary CTA:** "PortalJS Cloud" → the managed option. Followed by a caption clarifying the two paths (self-host vs managed). OSS stays the dominant, filled CTA; managed is the outline/secondary.
- **Visual:** terminal-style animation of the agent flow (`/portaljs-new-portal …` → `/portaljs-add-dataset …` → live portal). This is the hero moment — show, don't tell.

### 2. The agent workflow (how it works)
- Three steps, left to right: **Describe → Scaffold → Publish.**
- Show the actual skill commands. Reinforce that output is plain, editable code (no magic runtime).

### 3. Why PortalJS (value props)
Card grid, icon + one line each:
- 🌱 Open source, MIT — no lock-in.
- 🤖 AI-native — skills do the assembly.
- 🧩 Any backend — CKAN, DKAN, OpenMetadata, Microsoft Purview, DataHub, GitHub, Frictionless, custom.
- 🎨 Bring your own stack — adapt to your frontend tooling and design system.
- 👥 Community-driven — active Discord and discussions.

### 4. Backends / integrations
- Logo wall of supported backends (CKAN, DKAN, OpenMetadata, Microsoft Purview, DataHub, GitHub, Frictionless) + "and custom backends."
- Reinforces the "decoupled, works with what you have" message visually.

### 5. Examples / showcase
- Real portals built with PortalJS (screenshots from `examples/` and production sites).
- Builds credibility; gives visitors something concrete to click into.

### 6. Skills (extensibility)
- Brief: skills are first-class, documented, and you can author your own.
- Link to roadmap (VISION.md) and authoring guide.

### 7. Community & footer
- Discord, GitHub Discussions, Issues, Docs.
- CTA repeat: get started / star / join.

## Brand foundations

The shared brand layer for every PortalJS surface (site, docs, components). Light background, technical and trustworthy. The page-level [Visual direction](#visual-direction) below implements these tokens.

### Color tokens (OKLch)

```css
:root {
  --bg:      oklch(99% 0.004 240);   /* near-white canvas */
  --surface: oklch(100% 0 0);        /* card white */
  --fg:      oklch(22% 0.02 250);    /* slate ink, ~#1e293b */
  --muted:   oklch(52% 0.02 250);    /* gray body */
  --border:  oklch(92% 0.008 250);   /* hairline */
  --accent:  oklch(55% 0.19 256);    /* #2563eb primary blue */

  /* cyclone gradient stops */
  --c-sky:   #7dd3fc;
  --c-blue:  #38bdf8;
  --c-deep:  #2563eb;
  --c-core:  #1e3a8a;
}
```

### Type

- **Display + body:** Inter / system sans. One family — weight contrast carries hierarchy.
- **Mono:** ui-monospace / JetBrains Mono — for the terminal, commands, and IDs.

### Layout posture

1. Generous whitespace, light canvas. Not flashy.
2. Hairline borders (1px `--border`), radius 12–16px on cards, no heavy shadows.
3. One accent (blue); gradient used only on the logo, the hero moment, and the primary CTA.
4. Real commands and real portal screenshots over abstract marketing copy.
5. One focused motion: the hero terminal agent-flow. No gratuitous motion elsewhere.

## Visual direction

Page-level application of the [Brand foundations](#brand-foundations) above.

- **Logo / brand mark:** cyclone spiral, two arms, blue gradient (`#7dd3fc → #38bdf8 → #2563eb`) with a deep-blue core (`#1e3a8a`). Light background.
- **Palette:** blues from the logo gradient as primary; neutral grays for text; generous whitespace. Clean, technical, trustworthy — not flashy.
- **Typography:** modern sans (system or Inter-class). Large confident headline; readable body.
- **Tone:** confident and concrete. Show real commands and real portals over abstract marketing copy.
- **Motion:** one focused hero animation (the agent flow). Avoid gratuitous motion elsewhere.

## What to drop from the current site

- Heavy "Cloud / hosted platform" framing as the homepage's main story — the open-source framework leads. A single, clearly-secondary managed entry point (PortalJS Cloud, in the nav and as the hero's secondary CTA) is fine; it must never outshine or gate the OSS path.
- Generic "Next.js / SSR / SSG" feature lists as headline material — these are implementation details, not the value proposition. Bring-your-own-stack supersedes locking the message to one toolchain.
- "This repo is an issue tracker" framing — the site should sell the framework, not apologize for the repo.

## Decisions

- **Headline:** "The AI-native framework for data portals."
- **Hero:** custom animated agent-flow terminal (typed `/portaljs-new-portal → /portaljs-add-dataset → /portaljs-deploy`, then a live preview card) — not a recorded clip.
- **Showcase:** Malmö, Ann Arbor, Transport Data Commons, Open Data Nepal.

## Open questions

- Whether to feature a live/interactive demo vs the current animated terminal in the hero.
- Confirm naming permission for each showcased production portal.
