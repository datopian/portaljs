#!/usr/bin/env node
// create-portaljs — scaffold a PortalJS data portal.
//   npm create portaljs@latest my-portal
// See SPEC.md. Plain ESM, Node >= 18, deps: giget + prompts.

import { existsSync, readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, basename, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const TEMPLATE = 'examples/portaljs-catalog'
const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.css', '.md', '.html'])

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

  // 6. Optional git init + install.
  if (doGit && !existsSync(join(target, '.git'))) {
    if (run('git', ['init', '-q'], target)) {
      run('git', ['add', '-A'], target)
      run('git', ['commit', '-q', '-m', 'chore: scaffold PortalJS portal'], target)
    }
  }
  if (doInstall) {
    console.log('\nInstalling dependencies…')
    if (!run('npm', ['install'], target)) {
      console.log('npm install failed — you can run it yourself in the project.')
    }
  }

  // 7. Next steps.
  console.log(`
✔ Created ${name} in ${dir}

Next:
  cd ${dir}${doInstall ? '' : '\n  npm install'}
  npm run dev            # → http://localhost:3000

Then, in a Claude Code session, build it out:
  /add-dataset   ./data/your-file.csv     add data (or /add-resource for more files)
  /connect-ckan  <ckan-url>               point at a CKAN backend instead
  /deploy                                 publish (Cloudflare Pages recommended)
`)
}

main().catch((e) => fail(e?.message || String(e)))
