#!/usr/bin/env node
// Generate the skills table + sidebar from scripts/skills-manifest.mjs so the README
// and the site never drift. Run `npm run gen:skills` after editing the manifest;
// `npm run gen:skills:check` (CI) fails if any target is stale.
//
// Targets:
//   README.md                          — skills table (repo-relative links), between markers
//   site/content/docs/skills.md        — skills table (site-relative links), between markers
//   site/content/assets/docs-sidebar.json — the "Skills" section's links array
//
// Usage: node scripts/gen-skills-docs.mjs [--check]

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { SKILLS } from './skills-manifest.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CHECK = process.argv.includes('--check')

const README = join(ROOT, 'README.md')
const DOCS = join(ROOT, 'site/content/docs/skills.md')
const SIDEBAR = join(ROOT, 'site/content/assets/docs-sidebar.json')

const MARKER = 'skills-table'
// Marker comment syntax differs by surface: README is GitHub-flavored markdown
// (HTML comments are fine); the docs page is MDX, where HTML comments break the
// build — it needs JSX comments `{/* */}`.
const HTML = { begin: `<!-- BEGIN:${MARKER} -->`, end: `<!-- END:${MARKER} -->` }
const MDX = { begin: `{/* BEGIN:${MARKER} */}`, end: `{/* END:${MARKER} */}` }

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function mdTable(hrefFor) {
  const rows = SKILLS.map((s) => `| [\`/${s.id}\`](${hrefFor(s.id)}) | ${s.summary} |`)
  return ['| Skill | What it does |', '| ----- | ------------ |', ...rows].join('\n')
}

// Replace the content between the begin/end markers (keeping the marker lines).
// Throws if the markers are missing.
function replaceBlock(content, block, marker) {
  const re = new RegExp(`${escapeRe(marker.begin)}[\\s\\S]*?${escapeRe(marker.end)}`)
  if (!re.test(content)) throw new Error(`missing ${marker.begin} / ${marker.end} markers`)
  // Blank lines around the block so the table parses in both GFM and MDX (an MDX
  // table immediately adjacent to a {/* */} comment can fail to render).
  return content.replace(re, `${marker.begin}\n\n${block}\n\n${marker.end}`)
}

// Build every target's desired content from the manifest.
const targets = []

targets.push({
  path: README,
  next: replaceBlock(readFileSync(README, 'utf8'), mdTable((id) => `.claude/commands/${id}.md`), HTML),
})

targets.push({
  path: DOCS,
  next: replaceBlock(readFileSync(DOCS, 'utf8'), mdTable((id) => `/docs/skills/${id}`), MDX),
})

// Sidebar: replace the links of the section titled "Skills" (keep "Skills reference" first).
const sidebar = JSON.parse(readFileSync(SIDEBAR, 'utf8'))
const skillsSection = sidebar.find((s) => s.title === 'Skills')
if (!skillsSection) throw new Error(`no "Skills" section in ${SIDEBAR}`)
skillsSection.links = [
  { title: 'Skills reference', href: '/docs/skills' },
  ...SKILLS.map((s) => ({ title: `/${s.id}`, href: `/docs/skills/${s.id}` })),
]
targets.push({ path: SIDEBAR, next: JSON.stringify(sidebar, null, 2) + '\n' })

// Apply or check.
const stale = []
for (const { path, next } of targets) {
  const current = readFileSync(path, 'utf8')
  if (current === next) continue
  stale.push(path.replace(ROOT + '/', ''))
  if (!CHECK) writeFileSync(path, next)
}

if (CHECK) {
  if (stale.length) {
    console.error('Skills docs are stale — run `npm run gen:skills`:\n  ' + stale.join('\n  '))
    process.exit(1)
  }
  console.log('Skills docs are in sync ✓')
} else {
  console.log(stale.length ? 'Updated:\n  ' + stale.join('\n  ') : 'Already up to date ✓')
}
