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
2. **The new way to build** — describe a portal, your AI assistant scaffolds it and loads data in minutes.
3. **No lock-in, your stack, any backend** — MIT, decoupled, works with the catalog/metadata system you already run.
4. **It's real and supported** — active community, examples, used in production.

## Page sections

### 1. Hero
- **Logo** — the cyclone mark (`assets/portaljs-logo.svg`), blue gradient on light background.
- **Headline:** "Build data portals with AI." (or: "The AI-native framework for data portals.")
- **Subhead:** Describe the portal you want — your AI assistant scaffolds it and loads your data in minutes. Open source, no lock-in.
- **Primary CTA:** "Get started" → docs quickstart.
- **Secondary CTA:** "Star on GitHub" / "Join Discord".
- **Visual:** terminal-style animation of the agent flow (`/new-portal …` → `/add-dataset …` → live portal). This is the hero moment — show, don't tell.

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

## Visual direction

- **Logo / brand mark:** cyclone spiral, two arms, blue gradient (`#7dd3fc → #38bdf8 → #2563eb`) with a deep-blue core (`#1e3a8a`). Light background.
- **Palette:** blues from the logo gradient as primary; neutral grays for text; generous whitespace. Clean, technical, trustworthy — not flashy.
- **Typography:** modern sans (system or Inter-class). Large confident headline; readable body.
- **Tone:** confident and concrete. Show real commands and real portals over abstract marketing copy.
- **Motion:** one focused hero animation (the agent flow). Avoid gratuitous motion elsewhere.

## What to drop from the current site

- Heavy "Cloud / hosted platform" framing on the OSS landing page — keep the homepage focused on the open-source framework.
- Generic "Next.js / SSR / SSG" feature lists as headline material — these are implementation details, not the value proposition. Bring-your-own-stack supersedes locking the message to one toolchain.
- "This repo is an issue tracker" framing — the site should sell the framework, not apologize for the repo.

## Open questions

- Final headline wording — "Build data portals with AI." vs "The AI-native framework for data portals."
- Whether to feature a live/interactive demo vs a recorded animation in the hero.
- Which production portals we have permission to showcase by name.
