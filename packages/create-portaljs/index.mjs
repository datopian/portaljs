#!/usr/bin/env node
// create-portaljs — scaffold a PortalJS data portal.
//   npm create portaljs@latest my-portal
// See SPEC.md. Plain ESM, Node >= 18, deps: giget + prompts.

import { existsSync, readdirSync, readFileSync, writeFileSync, statSync, rmSync } from 'node:fs'
import { join, basename, resolve } from 'node:path'
import { spawn, spawnSync } from 'node:child_process'

const TEMPLATE = 'examples/portaljs-catalog'
const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.css', '.md', '.html'])

// Where the agentic skills live in the repo, and the OSS allowlist we bundle into
// the scaffold's project-local .claude/commands/ (so `claude` in the new portal
// sees /portaljs-add-dataset, /portaljs-connect-ckan, … with no separate install step). Kept in sync
// with .claude-plugin/plugin.json and scripts/install-portaljs-skills.sh.
const SKILLS_SRC = '.claude/commands'
// Uniform `portaljs-` prefix across the whole suite. Fresh scaffolds bundle only the
// canonical prefixed names — the bare alias stubs (kept one release for existing installs)
// are intentionally pruned so new projects start clean.
const SKILLS = [
  'portaljs-architect',
  'portaljs-new-portal',
  'portaljs-add-dataset',
  'portaljs-add-resource',
  'portaljs-add-chart',
  'portaljs-add-map',
  'portaljs-connect-ckan',
  'portaljs-migrate',
  'portaljs-define-schema',
  'portaljs-deploy',
  'portaljs-check-data-quality',
]

function parseArgs(argv) {
  const o = { install: true, git: true, yes: false, ref: 'main' }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '-h' || a === '--help') o.help = true
    else if (a === '-y' || a === '--yes') o.yes = true
    else if (a === '--no-install') o.install = false
    else if (a === '--no-git') o.git = false
    else if (a === '--namespace') o.namespace = argv[++i]
    else if (a === '--name') o.name = argv[++i]
    else if (a === '--description') o.description = argv[++i]
    else if (a === '--ref') o.ref = argv[++i]
    else if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=')
      if (v !== undefined) o[k] = v
    } else if (!o.dir) o.dir = a
  }
  return o
}

const HELP = `
create-portaljs — scaffold a PortalJS data portal

Usage:
  npm create portaljs@latest [directory] [options]

Options:
  --namespace <theme|owner>  Namespace mode (default: theme)
  --name <string>            Human project name (default: from directory)
  --description <string>     One-line description
  --ref <git-ref>            Template ref to fetch (default: main)
  --no-install               Skip npm install
  --no-git                   Skip git init
  -y, --yes                  Accept defaults, no prompts
  -h, --help                 Show this help
`

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'my-portal'

function fail(msg) {
  console.error(`\n✖ ${msg}\n`)
  process.exit(1)
}

// Recursively substitute the template's placeholder tokens in text files.
function substitute(dir, replacements) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue
    const p = join(dir, entry)
    const st = statSync(p)
    if (st.isDirectory()) {
      substitute(p, replacements)
    } else if (TEXT_EXT.has(p.slice(p.lastIndexOf('.')))) {
      let s = readFileSync(p, 'utf8')
      let changed = false
      for (const [token, value] of replacements) {
        if (s.includes(token)) {
          s = s.split(token).join(value)
          changed = true
        }
      }
      if (changed) writeFileSync(p, s)
    }
  }
}

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, stdio: 'inherit' })
  return r.status === 0
}

// Run a command async, quietly (so it doesn't clobber the animation), capturing
// stderr for error reporting. Resolves { ok, err }.
function runAsync(cmd, args, cwd) {
  return new Promise((res) => {
    const child = spawn(cmd, args, { cwd, stdio: ['ignore', 'ignore', 'pipe'] })
    let err = ''
    child.stderr.on('data', (d) => {
      err += d.toString()
    })
    child.on('error', (e) => res({ ok: false, err: `failed to start ${cmd}: ${e.message}` }))
    child.on('close', (code) => res({ ok: code === 0, err }))
  })
}

// A branded cyclone animation to watch while deps install. Renders in place over
// a few lines, sky→teal gradient (the PortalJS palette), with a flowing funnel,
// a spinner, rotating status, and an elapsed timer. No-ops (one plain line) when
// stdout isn't a TTY, so CI logs stay clean.
function createBuildAnimation() {
  if (!process.stdout.isTTY) {
    console.log('Installing dependencies…')
    return { stop() {} }
  }
  const SKY = [56, 189, 248]
  const TEAL = [94, 234, 212]
  const lerp = (a, b, t) => Math.round(a + (b - a) * t)
  const grad = (i, n, s) => {
    const t = n > 1 ? i / (n - 1) : 0
    return `\x1b[38;2;${lerp(SKY[0], TEAL[0], t)};${lerp(SKY[1], TEAL[1], t)};${lerp(SKY[2], TEAL[2], t)}m${s}\x1b[0m`
  }
  const WAVE = ['≋', '≈', '∿', '~'] // shifts per row → flowing-funnel illusion
  const SPIN = ['◐', '◓', '◑', '◒']
  const MSG = [
    'spinning up your portal',
    'wiring Home · Catalog · Showcase',
    'loading sample datasets',
    'almost ready',
  ]
  // Funnel rows: [indent, wave-count] narrowing to an apex.
  const FUNNEL = [
    [6, 5],
    [7, 3],
    [8, 1],
  ]
  const HEIGHT = 6 // 1 blank + 4 cyclone + 1 status
  const start = Date.now()
  let f = 0
  // Restore the cursor even if we never reach stop() (crash / SIGINT / SIGTERM),
  // otherwise the user's terminal is left with a hidden cursor.
  const showCursor = () => process.stdout.write('\x1b[?25h')
  const onExit = () => showCursor()
  const onSignal = () => {
    showCursor()
    process.exit(130)
  }
  process.once('exit', onExit)
  process.once('SIGINT', onSignal)
  process.once('SIGTERM', onSignal)
  process.stdout.write('\x1b[?25l') // hide cursor
  process.stdout.write('\n'.repeat(HEIGHT)) // reserve space
  const draw = () => {
    const secs = Math.floor((Date.now() - start) / 1000)
    const lines = ['']
    FUNNEL.forEach(([indent, width], ri) => {
      const w = WAVE[(f + ri) % WAVE.length]
      lines.push(' '.repeat(indent) + grad(ri, FUNNEL.length + 1, '╲' + w.repeat(width) + '╱'))
    })
    lines.push(' '.repeat(9) + grad(FUNNEL.length, FUNNEL.length + 1, '▿'))
    const sp = `\x1b[38;2;${SKY[0]};${SKY[1]};${SKY[2]}m${SPIN[f % SPIN.length]}\x1b[0m`
    const msg = MSG[Math.floor(f / 14) % MSG.length]
    lines.push(`   ${sp}  \x1b[1mPortalJS\x1b[0m \x1b[2m· ${msg}… (${secs}s)\x1b[0m`)
    process.stdout.write(`\x1b[${HEIGHT}A`) // up to the top of the reserved block
    for (const ln of lines.slice(0, HEIGHT)) process.stdout.write('\x1b[2K' + ln + '\n')
    f++
  }
  draw()
  const timer = setInterval(draw, 110)
  return {
    stop(ok) {
      clearInterval(timer)
      process.removeListener('exit', onExit)
      process.removeListener('SIGINT', onSignal)
      process.removeListener('SIGTERM', onSignal)
      process.stdout.write(`\x1b[${HEIGHT}A`)
      for (let i = 0; i < HEIGHT; i++) process.stdout.write('\x1b[2K\n')
      process.stdout.write(`\x1b[${HEIGHT}A\x1b[?25h`) // back to top, show cursor
      const secs = Math.floor((Date.now() - start) / 1000)
      console.log(
        ok
          ? `\x1b[38;2;94;234;212m✔\x1b[0m Dependencies installed \x1b[2m(${secs}s)\x1b[0m`
          : '\x1b[33m⚠\x1b[0m  Dependency install did not complete'
      )
    },
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  if (opts.help) {
    console.log(HELP)
    return
  }

  // Lazy-load deps so --help works even before install resolves them.
  const prompts = (await import('prompts')).default
  const { downloadTemplate } = await import('giget')

  const onCancel = () => fail('Cancelled.')
  const ask = async (questions) =>
    opts.yes ? {} : prompts(questions, { onCancel })

  // 1. Resolve inputs (CLI flags win; otherwise prompt unless --yes).
  let dir = opts.dir
  if (!dir) {
    const a = await ask({
      type: 'text',
      name: 'dir',
      message: 'Project directory',
      initial: 'my-portal',
    })
    dir = a.dir || 'my-portal'
  }
  const slug = slugify(basename(dir))
  const name =
    opts.name ??
    (await ask({
      type: 'text',
      name: 'name',
      message: 'Project name',
      initial: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    })).name ??
    slug
  const description =
    opts.description ??
    (await ask({
      type: 'text',
      name: 'description',
      message: 'One-line description',
      initial: 'An open data portal.',
    })).description ??
    'An open data portal.'
  const namespace =
    opts.namespace ??
    (await ask({
      type: 'select',
      name: 'namespace',
      message: 'Namespace mode',
      choices: [
        { title: 'theme — single publisher, group by subject', value: 'theme' },
        { title: 'owner — multiple publishers, group by who published', value: 'owner' },
      ],
      initial: 0,
    })).namespace ??
    'theme'
  if (namespace !== 'theme' && namespace !== 'owner') fail(`Invalid --namespace: ${namespace}`)

  const doInstall = opts.install &&
    (opts.yes || (await ask({ type: 'confirm', name: 'v', message: 'Install dependencies?', initial: true })).v !== false)
  const doGit = opts.git &&
    (opts.yes || (await ask({ type: 'confirm', name: 'v', message: 'Initialize a git repo?', initial: true })).v !== false)

  // 2. Guard the target directory.
  const target = resolve(process.cwd(), dir)
  if (existsSync(target) && readdirSync(target).length > 0) {
    fail(`Directory "${dir}" already exists and is not empty. Choose another name.`)
  }

  // 3. Fetch the template (reliable subdir extraction; no degit fallback bug).
  console.log(`\nScaffolding ${name} → ${dir} (template @ ${opts.ref})`)
  try {
    await downloadTemplate(`github:datopian/portaljs/${TEMPLATE}#${opts.ref}`, {
      dir: target,
      force: true,
    })
  } catch (e) {
    fail(`Failed to fetch the template: ${e?.message || e}`)
  }

  // 4. Substitute placeholder tokens.
  substitute(target, [
    ['__PROJECT_NAME__', name],
    ['__PROJECT_SLUG__', slug],
    ['__DESCRIPTION__', description],
  ])

  // 5. Set the namespace mode in lib/datasets.ts.
  const datasetsTs = join(target, 'lib', 'datasets.ts')
  if (existsSync(datasetsTs)) {
    const s = readFileSync(datasetsTs, 'utf8').replace(
      /export const NAMESPACE_TYPE: 'theme' \| 'owner' = '(theme|owner)'/,
      `export const NAMESPACE_TYPE: 'theme' | 'owner' = '${namespace}'`
    )
    writeFileSync(datasetsTs, s)
  }

  // 5b. Bundle the agentic skills into the project's .claude/commands/ so they
  // work the instant the user runs `claude` in the new portal — no global
  // install. Pinned to the same template ref, so skills match the scaffold.
  // The repo's .claude/commands holds only OSS skills today; we still prune to
  // the allowlist so a future internal command never leaks into a scaffold.
  // Non-fatal: a fetch failure just prints the manual install one-liner.
  const skillsDir = join(target, '.claude', 'commands')
  try {
    await downloadTemplate(`github:datopian/portaljs/${SKILLS_SRC}#${opts.ref}`, {
      dir: skillsDir,
      force: true,
    })
    for (const entry of readdirSync(skillsDir)) {
      const keep = entry.endsWith('.md') && SKILLS.includes(entry.slice(0, -3))
      if (!keep) rmSync(join(skillsDir, entry), { recursive: true, force: true })
    }
    console.log(`Bundled ${SKILLS.length} PortalJS skills into .claude/commands/`)
  } catch (e) {
    console.log(
      `\x1b[33m⚠\x1b[0m  Could not bundle skills (${e?.message || e}). Install them with:\n` +
        '   curl -fsSL https://raw.githubusercontent.com/datopian/portaljs/main/scripts/install-portaljs-skills.sh | bash'
    )
  }

  // 6. Optional git init + install.
  if (doGit && !existsSync(join(target, '.git'))) {
    if (run('git', ['init', '-q'], target)) {
      run('git', ['add', '-A'], target)
      run('git', ['commit', '-q', '-m', 'chore: scaffold PortalJS portal'], target)
    }
  }
  if (doInstall) {
    const anim = createBuildAnimation()
    const { ok, err } = await runAsync('npm', ['install'], target)
    anim.stop(ok)
    if (!ok) {
      console.log('  Run `npm install` yourself in the project to finish.')
      if (err) {
        console.log('\x1b[2m' + err.trim().split('\n').slice(-3).join('\n') + '\x1b[0m')
      }
    }
  }

  // 7. Next steps.
  console.log(`
✔ Created ${name} in ${dir}

Next:
  cd ${dir}${doInstall ? '' : '\n  npm install'}
  npm run dev            # → http://localhost:3000

Then run \`claude\` in the project — the PortalJS skills are bundled in
.claude/commands/, so these work right away:
  /portaljs-add-dataset   ./data/your-file.csv   add data (or /portaljs-add-resource for more files)
  /portaljs-connect-ckan  <ckan-url>             point at a CKAN backend instead
  /portaljs-deploy                               publish (Cloudflare Pages recommended)
`)
}

main().catch((e) => fail(e?.message || String(e)))
