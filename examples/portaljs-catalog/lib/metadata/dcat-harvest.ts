// Inbound DCAT harvest — the CONSUMING counterpart to dcat-rdf.ts.
//
// dcat-rdf.ts serializes the portal's catalog OUT to RDF (JSON-LD → Turtle +
// RDF/XML) so national/EU/US portals can harvest it. This is the inverse: it reads
// an EXTERNAL DCAT / DCAT-AP RDF feed (in any of the three serializations we emit)
// and maps it back to the template's canonical dataset shape, so /portaljs-migrate
// can ingest a European/national DCAT-AP catalog. Expose + consume are symmetric —
// a portal is a full TWO-WAY DCAT interop node.
//
// The pipeline is: parse a serialization → a flat triple list → index by subject →
// walk Catalog → Dataset → Distribution and map to canonical entries. All three
// parsers converge on the SAME triple model (mirroring how dcat-rdf.ts flattens all
// profiles through one triple writer), so the extraction layer is written once.
//
// Zero runtime dependencies, matching dcat-rdf.ts. The parsers are small, focused
// readers for the DCAT subset real feeds use (typed Dataset/Distribution nodes,
// prefixed IRIs, inline blank-node Agents/Contacts, string/typed literals) — NOT
// general-purpose RDF processors. For an exotic or very large feed a caller can parse
// with a full library (n3 / rdfxml-streaming-parser / jsonld) and hand the triples to
// harvestTriples() instead; the extraction layer is the reusable part.
//
// Profiles read (mirror what dcat-profiles.ts exposes): DCAT 2/3, DCAT-AP + the
// national profiles (SE/CH/DE), and GeoDCAT-AP spatial fields. Croissant (schema.org
// / MLCommons ML-dataset JSON-LD) is read best-effort through the JSON-LD path.
//
// Specs: DCAT-2 https://www.w3.org/TR/vocab-dcat-2/ · DCAT-3
// https://www.w3.org/TR/vocab-dcat-3/ · DCAT-AP https://semiceu.github.io/DCAT-AP/ ·
// GeoDCAT-AP https://semiceu.github.io/GeoDCAT-AP/ · Croissant
// https://docs.mlcommons.org/croissant/.

import { listDcatProfiles } from './dcat-profiles'

// --- triple model (shared by all three parsers) --------------------------------

type Term =
  | { kind: 'iri'; value: string }
  | { kind: 'bnode'; value: string }
  | { kind: 'literal'; value: string; lang?: string; datatype?: string }
export type Triple = { s: Term; p: Term; o: Term }

const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const XSD = 'http://www.w3.org/2001/XMLSchema#'
const DCAT = 'http://www.w3.org/ns/dcat#'
const DCT = 'http://purl.org/dc/terms/'
const FOAF = 'http://xmlns.com/foaf/0.1/'
const VCARD = 'http://www.w3.org/2006/vcard/ns#'
const LOCN = 'http://www.w3.org/ns/locn#'
const SCHEMA = 'https://schema.org/'
const SCHEMA_HTTP = 'http://schema.org/'

// The prefixes real DCAT feeds use, so a compacted JSON-LD document (or a Turtle
// file that forgot to declare one) still resolves. Extends, never overrides, a
// document's own @context / @prefix declarations.
const WELL_KNOWN: Record<string, string> = {
  rdf: RDF,
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  xsd: XSD,
  dcat: DCAT,
  dct: DCT,
  dcterms: DCT,
  dc: 'http://purl.org/dc/elements/1.1/',
  foaf: FOAF,
  vcard: VCARD,
  adms: 'http://www.w3.org/ns/adms#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  locn: LOCN,
  gsp: 'http://www.opengis.net/ont/geosparql#',
  dcatap: 'http://data.europa.eu/r5r/',
  dcatde: 'http://dcat-ap.de/def/dcatde/',
  schema: SCHEMA,
  spdx: 'http://spdx.org/rdf/terms#',
  hydra: 'http://www.w3.org/ns/hydra/core#',
}

// --- format detection -----------------------------------------------------------

export type RdfInputFormat = 'jsonld' | 'ttl' | 'rdf'

// Detect the serialization from a Content-Type and/or the payload's first bytes.
// Order matters: a JSON body starting with '{'/'[' is JSON-LD; a '<' body is RDF/XML;
// otherwise Turtle (its @prefix / prefixed-name syntax).
export function detectFormat(text: string, contentType?: string): RdfInputFormat {
  const ct = (contentType ?? '').toLowerCase()
  if (ct.includes('json')) return 'jsonld'
  if (ct.includes('turtle') || ct.includes('n-triples') || ct.includes('text/n3')) return 'ttl'
  if (ct.includes('rdf+xml') || ct.includes('application/xml') || ct.includes('text/xml'))
    return 'rdf'
  const head = text.replace(/^﻿/, '').trimStart()
  if (head.startsWith('{') || head.startsWith('[')) return 'jsonld'
  if (head.startsWith('<?xml') || /^<[a-zA-Z]/.test(head)) {
    // '<' could be RDF/XML or a Turtle statement starting with an <IRI>. RDF/XML has
    // an XML declaration or an rdf:RDF root; a bare '<http…>' with no '>' close before
    // whitespace is Turtle.
    if (/^<\?xml|<rdf:RDF|<[a-zA-Z][\w-]*:[\w-]+[\s>]/.test(head)) return 'rdf'
    return 'ttl'
  }
  return 'ttl'
}

// --- JSON-LD → triples ----------------------------------------------------------

// Resolve a JSON-LD @context (which maps terms/prefixes to IRIs) merged with the
// well-known prefixes. Supports both `"dct": "http://…"` prefix entries and
// `"title": { "@id": "dct:title" }` term entries.
function jsonldContext(ctx: unknown): Record<string, string> {
  const out: Record<string, string> = { ...WELL_KNOWN }
  const merge = (c: unknown) => {
    if (!c || typeof c !== 'object') return
    for (const [k, v] of Object.entries(c as Record<string, unknown>)) {
      // Keep @vocab (the default namespace for bare terms — Croissant/schema.org use
      // it); skip other JSON-LD keywords.
      if (k.startsWith('@') && k !== '@vocab') continue
      if (typeof v === 'string') out[k] = v
      else if (v && typeof v === 'object' && typeof (v as { '@id'?: string })['@id'] === 'string')
        out[k] = (v as { '@id': string })['@id']
    }
  }
  if (Array.isArray(ctx)) ctx.forEach(merge)
  else merge(ctx)
  return out
}

// Expand a compact term ('dct:title', 'title') or absolute IRI to a full IRI.
function expandTerm(ctx: Record<string, string>, term: string): string {
  if (/^https?:|^mailto:|^urn:|^_:/.test(term)) return term
  const i = term.indexOf(':')
  if (i !== -1) {
    const prefix = term.slice(0, i)
    const local = term.slice(i + 1)
    // Guard against '//' (already an IRI) and unknown prefixes.
    if (!local.startsWith('//') && ctx[prefix]) return ctx[prefix] + local
  }
  // A bare term mapped directly in the context (e.g. "title" -> dct:title).
  if (ctx[term]) return expandTerm(ctx, ctx[term])
  // A bare term under a default vocabulary (@vocab) — e.g. Croissant's schema.org
  // `name`/`description`/`distribution`/`contentUrl`.
  if (i === -1 && ctx['@vocab']) return ctx['@vocab'] + term
  return term
}

function jsonldToTriples(doc: unknown): Triple[] {
  const triples: Triple[] = []
  const counter = { n: 0 }

  const walk = (node: Record<string, unknown>, ctx: Record<string, string>): Term => {
    const localCtx = node['@context'] ? jsonldContext(node['@context']) : ctx
    const idRaw = node['@id']
    const subject: Term =
      typeof idRaw === 'string'
        ? { kind: 'iri', value: expandTerm(localCtx, idRaw) }
        : { kind: 'bnode', value: `b${counter.n++}` }

    const emitType = (t: unknown) => {
      if (typeof t === 'string')
        triples.push({
          s: subject,
          p: { kind: 'iri', value: RDF + 'type' },
          o: { kind: 'iri', value: expandTerm(localCtx, t) },
        })
    }
    if (Array.isArray(node['@type'])) node['@type'].forEach(emitType)
    else if (node['@type'] !== undefined) emitType(node['@type'])

    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('@')) continue
      const predicate: Term = { kind: 'iri', value: expandTerm(localCtx, key) }
      const values = Array.isArray(value) ? value : [value]
      for (const v of values) {
        if (v === null || v === undefined) continue
        let object: Term
        if (typeof v === 'object') {
          const o = v as Record<string, unknown>
          if ('@value' in o) {
            object = {
              kind: 'literal',
              value: String(o['@value']),
              lang: typeof o['@language'] === 'string' ? o['@language'] : undefined,
              datatype:
                typeof o['@type'] === 'string' ? expandTerm(localCtx, o['@type']) : undefined,
            }
          } else if ('@id' in o && Object.keys(o).length === 1) {
            object = {
              kind: 'iri',
              value: expandTerm(localCtx, String(o['@id'])),
            }
          } else if ('@list' in o && Array.isArray(o['@list'])) {
            // Flatten an @list to repeated triples (order not significant for harvest).
            for (const item of o['@list']) {
              const io =
                item && typeof item === 'object'
                  ? walk(item as Record<string, unknown>, localCtx)
                  : ({ kind: 'literal', value: String(item) } as Term)
              triples.push({ s: subject, p: predicate, o: io })
            }
            continue
          } else {
            object = walk(o, localCtx)
          }
        } else {
          object = { kind: 'literal', value: String(v) }
        }
        triples.push({ s: subject, p: predicate, o: object })
      }
    }
    return subject
  }

  const rootCtx = jsonldContext((doc as { '@context'?: unknown })?.['@context'])
  const nodes: unknown[] = []
  const collect = (d: unknown) => {
    if (Array.isArray(d)) d.forEach(collect)
    else if (d && typeof d === 'object') {
      const g = (d as { '@graph'?: unknown })['@graph']
      if (Array.isArray(g)) g.forEach(collect)
      else nodes.push(d)
    }
  }
  collect(doc)
  for (const n of nodes) if (n && typeof n === 'object') walk(n as Record<string, unknown>, rootCtx)
  return triples
}

// --- Turtle → triples -----------------------------------------------------------

// A small Turtle reader for the DCAT subset: @prefix/PREFIX + @base/BASE, IRIs,
// prefixed names, `a`, blank-node property lists `[ … ]`, collections `( … )`,
// string literals (incl. triple-quoted) with @lang / ^^datatype, and numeric/boolean
// literals. Not a full Turtle 1.1 parser, but covers real DCAT-AP feeds.
function turtleToTriples(input: string): Triple[] {
  const triples: Triple[] = []
  const prefixes: Record<string, string> = { ...WELL_KNOWN }
  let base = ''
  let bnodeCounter = 0
  let i = 0
  const n = input.length

  const isWs = (c: string) => c === ' ' || c === '\t' || c === '\r' || c === '\n'

  const skipWs = () => {
    while (i < n) {
      const c = input[i]
      if (isWs(c)) i++
      else if (c === '#') {
        while (i < n && input[i] !== '\n') i++
      } else break
    }
  }

  const resolvePname = (pname: string): string => {
    const ci = pname.indexOf(':')
    const prefix = pname.slice(0, ci)
    const local = pname.slice(ci + 1).replace(/\\([_~.\-!$&'()*+,;=/?#@%])/g, '$1')
    const ns = prefixes[prefix]
    if (ns === undefined) throw new Error(`unknown Turtle prefix "${prefix}:"`)
    return ns + local
  }

  const resolveIri = (iri: string): string => {
    if (/^[a-z][\w+.-]*:/i.test(iri)) return iri // absolute
    if (base) {
      try {
        return new URL(iri, base).toString()
      } catch {
        return iri
      }
    }
    return iri
  }

  // Read one term (IRI / prefixed / blank / literal / [ ] / ( )). Emits nested triples
  // for blank-node property lists and collections; returns the term to link to.
  const readObject = (): Term => {
    skipWs()
    const c = input[i]
    if (c === '<') {
      let j = i + 1
      while (j < n && input[j] !== '>') j++
      const iri = input.slice(i + 1, j)
      i = j + 1
      return { kind: 'iri', value: resolveIri(iri) }
    }
    if (c === '"' || c === "'") return readLiteral()
    if (c === '[') {
      i++ // consume '['
      const subject: Term = { kind: 'bnode', value: `tb${bnodeCounter++}` }
      readPredicateList(subject)
      skipWs()
      if (input[i] === ']') i++
      return subject
    }
    if (c === '(') {
      // Collection — flatten items as repeated links off a fresh bnode (order lost).
      i++
      const listNode: Term = { kind: 'bnode', value: `tl${bnodeCounter++}` }
      skipWs()
      while (i < n && input[i] !== ')') {
        const item = readObject()
        triples.push({
          s: listNode,
          p: { kind: 'iri', value: RDF + 'first' },
          o: item,
        })
        skipWs()
      }
      if (input[i] === ')') i++
      return listNode
    }
    if (c === '_' && input[i + 1] === ':') {
      let j = i + 2
      while (j < n && !isWs(input[j]) && !',;.]()'.includes(input[j])) j++
      const label = input.slice(i, j)
      i = j
      return { kind: 'bnode', value: label }
    }
    // A prefixed name, `a`, or numeric/boolean literal.
    let j = i
    while (j < n && !isWs(input[j]) && !',;.]()'.includes(input[j])) j++
    const tok = input.slice(i, j)
    i = j
    if (tok === 'a') return { kind: 'iri', value: RDF + 'type' }
    if (tok === 'true' || tok === 'false')
      return { kind: 'literal', value: tok, datatype: XSD + 'boolean' }
    if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(tok)) {
      const dt = /[.eE]/.test(tok) ? (/[eE]/.test(tok) ? 'double' : 'decimal') : 'integer'
      return { kind: 'literal', value: tok, datatype: XSD + dt }
    }
    if (tok.includes(':')) return { kind: 'iri', value: resolvePname(tok) }
    throw new Error(`unparsable Turtle token "${tok.slice(0, 40)}"`)
  }

  const readLiteral = (): Term => {
    const quote = input[i]
    let value: string
    if (input.slice(i, i + 3) === quote.repeat(3)) {
      const close = input.indexOf(quote.repeat(3), i + 3)
      value = input.slice(i + 3, close < 0 ? n : close)
      i = (close < 0 ? n : close) + 3
    } else {
      i++ // opening quote
      let out = ''
      while (i < n && input[i] !== quote) {
        if (input[i] === '\\') {
          const esc = input[i + 1]
          out +=
            esc === 'n'
              ? '\n'
              : esc === 't'
                ? '\t'
                : esc === 'r'
                  ? '\r'
                  : esc === '"'
                    ? '"'
                    : esc === "'"
                      ? "'"
                      : esc === '\\'
                        ? '\\'
                        : esc
          i += 2
        } else {
          out += input[i++]
        }
      }
      i++ // closing quote
      value = out
    }
    let lang: string | undefined
    let datatype: string | undefined
    if (input[i] === '@') {
      let j = i + 1
      while (j < n && /[a-zA-Z0-9-]/.test(input[j])) j++
      lang = input.slice(i + 1, j)
      i = j
    } else if (input[i] === '^' && input[i + 1] === '^') {
      i += 2
      skipWs()
      if (input[i] === '<') {
        let j = i + 1
        while (j < n && input[j] !== '>') j++
        datatype = resolveIri(input.slice(i + 1, j))
        i = j + 1
      } else {
        let j = i
        while (j < n && !isWs(input[j]) && !',;.]()'.includes(input[j])) j++
        datatype = resolvePname(input.slice(i, j))
        i = j
      }
    }
    return { kind: 'literal', value, lang, datatype }
  }

  const readPredicateList = (subject: Term) => {
    for (;;) {
      skipWs()
      const c = input[i]
      if (i >= n || c === ']') return
      if (c === '.') return
      // predicate
      const predicate = readObject()
      // objects, comma-separated
      for (;;) {
        const object = readObject()
        triples.push({ s: subject, p: predicate, o: object })
        skipWs()
        if (input[i] === ',') {
          i++
          continue
        }
        break
      }
      skipWs()
      if (input[i] === ';') {
        i++
        // allow trailing `;` before `]` or `.`
        skipWs()
        if (input[i] === ']' || input[i] === '.') return
        continue
      }
      return
    }
  }

  while (i < n) {
    skipWs()
    if (i >= n) break
    // Directives.
    if (input[i] === '@' || /^(prefix|base)\b/i.test(input.slice(i, i + 7))) {
      const atForm = input[i] === '@'
      let j = i + (atForm ? 1 : 0)
      while (j < n && /[a-zA-Z]/.test(input[j])) j++
      const kw = input.slice(atForm ? i + 1 : i, j).toLowerCase()
      i = j
      skipWs()
      if (kw === 'prefix') {
        let k = i
        while (k < n && input[k] !== ':') k++
        const prefix = input.slice(i, k).trim()
        i = k + 1
        skipWs()
        let m = i + 1
        while (m < n && input[m] !== '>') m++
        prefixes[prefix] = input.slice(i + 1, m)
        i = m + 1
      } else if (kw === 'base') {
        skipWs()
        let m = i + 1
        while (m < n && input[m] !== '>') m++
        base = input.slice(i + 1, m)
        i = m + 1
      }
      skipWs()
      if (input[i] === '.') i++
      continue
    }
    // A statement: subject predicateList .
    const subject = readObject()
    readPredicateList(subject)
    skipWs()
    if (input[i] === '.') i++
  }
  return triples
}

// --- RDF/XML → triples ----------------------------------------------------------

// Minimal XML reader (elements, attributes, text, self-close, comments, CDATA) — no
// DOM dependency. Sufficient for RDF/XML feeds.
type XmlNode = {
  name: string
  attrs: Record<string, string>
  children: XmlNode[]
  text: string
}

function parseXml(input: string): XmlNode {
  let i = 0
  const n = input.length
  const root: XmlNode = { name: '#root', attrs: {}, children: [], text: '' }
  const stack: XmlNode[] = [root]

  const decode = (s: string) =>
    s
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
      .replace(/&amp;/g, '&')

  while (i < n) {
    if (input[i] === '<') {
      if (input.startsWith('<!--', i)) {
        i = input.indexOf('-->', i)
        i = i < 0 ? n : i + 3
        continue
      }
      if (input.startsWith('<![CDATA[', i)) {
        const end = input.indexOf(']]>', i)
        stack[stack.length - 1].text += input.slice(i + 9, end < 0 ? n : end)
        i = end < 0 ? n : end + 3
        continue
      }
      if (input.startsWith('<?', i) || input.startsWith('<!', i)) {
        i = input.indexOf('>', i)
        i = i < 0 ? n : i + 1
        continue
      }
      const close = input.indexOf('>', i)
      if (close < 0) break
      let tag = input.slice(i + 1, close).trim()
      i = close + 1
      if (tag.startsWith('/')) {
        stack.pop()
        continue
      }
      const selfClose = tag.endsWith('/')
      if (selfClose) tag = tag.slice(0, -1).trim()
      const sp = tag.search(/\s/)
      const name = sp < 0 ? tag : tag.slice(0, sp)
      const attrs: Record<string, string> = {}
      if (sp >= 0) {
        const attrStr = tag.slice(sp)
        const re = /([\w:.-]+)\s*=\s*("([^"]*)"|'([^']*)')/g
        let m: RegExpExecArray | null
        while ((m = re.exec(attrStr))) attrs[m[1]] = decode(m[3] ?? m[4] ?? '')
      }
      const node: XmlNode = { name, attrs, children: [], text: '' }
      stack[stack.length - 1].children.push(node)
      if (!selfClose) stack.push(node)
    } else {
      const next = input.indexOf('<', i)
      const chunk = input.slice(i, next < 0 ? n : next)
      if (chunk.trim()) stack[stack.length - 1].text += decode(chunk)
      i = next < 0 ? n : next
    }
  }
  return root
}

// Resolve an element/attribute QName ("dct:title") to a full IRI using the xmlns
// declarations gathered along the element path.
function qnameToIri(qname: string, ns: Record<string, string>): string {
  const ci = qname.indexOf(':')
  if (ci === -1) return (ns[''] ?? '') + qname
  const prefix = qname.slice(0, ci)
  const local = qname.slice(ci + 1)
  return (ns[prefix] ?? WELL_KNOWN[prefix] ?? '') + local
}

function rdfXmlToTriples(input: string): Triple[] {
  const triples: Triple[] = []
  const root = parseXml(input)
  let bnodeCounter = 0

  // Node elements describe a subject; their child property elements are predicates.
  const walkNodeElement = (el: XmlNode, ns: Record<string, string>): Term => {
    const localNs = { ...ns }
    for (const [k, v] of Object.entries(el.attrs)) {
      if (k === 'xmlns') localNs[''] = v
      else if (k.startsWith('xmlns:')) localNs[k.slice(6)] = v
    }
    const about = el.attrs['rdf:about']
    const id = el.attrs['rdf:ID']
    const nodeId = el.attrs['rdf:nodeID']
    const subject: Term = about
      ? { kind: 'iri', value: about }
      : id
        ? { kind: 'iri', value: '#' + id }
        : nodeId
          ? { kind: 'bnode', value: nodeId }
          : { kind: 'bnode', value: `xb${bnodeCounter++}` }

    // A typed node element (anything but rdf:Description) implies an rdf:type.
    const elIri = qnameToIri(el.name, localNs)
    if (elIri !== RDF + 'Description' && el.name !== 'rdf:RDF') {
      triples.push({
        s: subject,
        p: { kind: 'iri', value: RDF + 'type' },
        o: { kind: 'iri', value: elIri },
      })
    }
    // rdf:type given as an attribute shorthand is uncommon; skip.

    // Property attributes (literal shorthand): non-rdf attributes become literal props.
    for (const [k, v] of Object.entries(el.attrs)) {
      if (k.startsWith('xmlns') || k.startsWith('rdf:') || k === 'xml:lang' || k === 'xml:base')
        continue
      triples.push({
        s: subject,
        p: { kind: 'iri', value: qnameToIri(k, localNs) },
        o: { kind: 'literal', value: v },
      })
    }

    for (const child of el.children) walkPropertyElement(child, subject, localNs)
    return subject
  }

  const walkPropertyElement = (el: XmlNode, subject: Term, ns: Record<string, string>) => {
    const localNs = { ...ns }
    for (const [k, v] of Object.entries(el.attrs)) {
      if (k === 'xmlns') localNs[''] = v
      else if (k.startsWith('xmlns:')) localNs[k.slice(6)] = v
    }
    const predicate: Term = {
      kind: 'iri',
      value: qnameToIri(el.name, localNs),
    }
    const resource = el.attrs['rdf:resource']
    const nodeId = el.attrs['rdf:nodeID']
    const datatype = el.attrs['rdf:datatype']
    const lang = el.attrs['xml:lang']
    const parseType = el.attrs['rdf:parseType']

    if (resource !== undefined) {
      triples.push({
        s: subject,
        p: predicate,
        o: { kind: 'iri', value: resource },
      })
      return
    }
    if (nodeId !== undefined) {
      triples.push({
        s: subject,
        p: predicate,
        o: { kind: 'bnode', value: nodeId },
      })
      return
    }
    // A nested node element → the object is that node.
    const childNodes = el.children.filter((c) => c.name !== '#text')
    if (childNodes.length > 0 || parseType === 'Resource') {
      if (parseType === 'Resource') {
        const bnode: Term = { kind: 'bnode', value: `xb${bnodeCounter++}` }
        triples.push({ s: subject, p: predicate, o: bnode })
        for (const c of childNodes) walkPropertyElement(c, bnode, localNs)
      } else {
        for (const c of childNodes) {
          const childSubject = walkNodeElement(c, localNs)
          triples.push({ s: subject, p: predicate, o: childSubject })
        }
      }
      return
    }
    // Otherwise a literal (element text).
    triples.push({
      s: subject,
      p: predicate,
      o: { kind: 'literal', value: el.text, lang, datatype },
    })
  }

  // Find the rdf:RDF element (or treat root children as node elements).
  const rootNs: Record<string, string> = {}
  const rdfEl = root.children.find((c) => c.name === 'rdf:RDF' || c.name.endsWith(':RDF')) ?? root
  for (const [k, v] of Object.entries(rdfEl.attrs)) {
    if (k === 'xmlns') rootNs[''] = v
    else if (k.startsWith('xmlns:')) rootNs[k.slice(6)] = v
  }
  for (const child of rdfEl.children) walkNodeElement(child, rootNs)
  return triples
}

// --- parse dispatch -------------------------------------------------------------

export function parseRdf(text: string, format: RdfInputFormat): Triple[] {
  switch (format) {
    case 'jsonld':
      return jsonldToTriples(JSON.parse(text))
    case 'ttl':
      return turtleToTriples(text)
    case 'rdf':
      return rdfXmlToTriples(text)
  }
}

// --- DCAT extraction ------------------------------------------------------------

// A harvested resource maps to the canonical Resource shape /portaljs-migrate writes.
export type HarvestedResource = {
  name?: string
  title?: string
  path: string
  format?: string
  describedBy?: string
}

// A harvested dataset — the canonical shape datasets.json uses. `spatial` carries a
// GeoDCAT-AP geometry/bbox when present (best-effort, WKT/GeoJSON string).
export type HarvestedDataset = {
  slug: string
  namespace: string
  name: string
  description?: string
  keywords?: string[]
  license?: string
  sources?: string[]
  created?: string
  modified?: string
  version?: string
  landingPage?: string
  identifier?: string
  themes?: string[]
  spatial?: string
  resources: HarvestedResource[]
}

export type HarvestResult = {
  catalog?: { title?: string; description?: string; homepage?: string }
  datasets: HarvestedDataset[]
  // Profile ids inferred from dct:conformsTo across the feed (via the registry).
  profiles: string[]
  warnings: string[]
}

// A subject and its predicate→objects, for O(1) traversal.
type NodeIndex = Map<string, { id: Term; preds: Map<string, Term[]> }>

function termKey(t: Term): string {
  return `${t.kind}:${t.value}`
}

function buildIndex(triples: Triple[]): NodeIndex {
  const index: NodeIndex = new Map()
  for (const { s, p, o } of triples) {
    const k = termKey(s)
    let node = index.get(k)
    if (!node) {
      node = { id: s, preds: new Map() }
      index.set(k, node)
    }
    const objs = node.preds.get(p.value)
    if (objs) objs.push(o)
    else node.preds.set(p.value, [o])
  }
  return index
}

// Reverse map of every registered profile's conformsTo URI → profile id, so a feed's
// dct:conformsTo is mapped back to the profile that would EXPOSE it (expose/consume
// stay in sync via the one registry). GeoDCAT-AP is added explicitly — it's read here
// as DCAT-AP + spatial rather than a separately registered expose profile.
function conformsToIndex(): Record<string, string> {
  const map: Record<string, string> = {
    'https://semiceu.github.io/geodcat-ap/': 'geodcat-ap',
    'http://data.europa.eu/930/': 'geodcat-ap',
  }
  for (const p of listDcatProfiles()) if (p.conformsTo) map[p.conformsTo.replace(/\/+$/, '')] = p.id
  return map
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s/-]/g, '')
      .trim()
      .replace(/[\s/_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'dataset'
  )
}

// Short format token from a dct:format label or dcat:mediaType (mirrors dcat.ts).
const MEDIA_TO_FORMAT: Record<string, string> = {
  'text/csv': 'csv',
  'text/tab-separated-values': 'tsv',
  'application/json': 'json',
  'application/geo+json': 'geojson',
  'application/vnd.geo+json': 'geojson',
  'application/vnd.apache.parquet': 'parquet',
  'application/x-parquet': 'parquet',
}

function normalizeFormat(fmt?: string, media?: string): string | undefined {
  if (media) {
    const m = media.toLowerCase().trim()
    if (MEDIA_TO_FORMAT[m]) return MEDIA_TO_FORMAT[m]
  }
  if (fmt) {
    const f = fmt.toLowerCase().trim()
    // Some feeds put a media type in dct:format, or an EU file-type URI.
    if (MEDIA_TO_FORMAT[f]) return MEDIA_TO_FORMAT[f]
    const tail = f.split(/[/#]/).pop() ?? f
    return tail.replace(/[^a-z0-9+.-]/g, '') || undefined
  }
  return undefined
}

// Map a feed's triples to canonical datasets. See harvest() for the string entrypoint.
export function harvestTriples(triples: Triple[]): HarvestResult {
  const index = buildIndex(triples)
  const warnings: string[] = []
  const c2p = conformsToIndex()
  const profiles = new Set<string>()

  const lit = (
    node: { preds: Map<string, Term[]> } | undefined,
    pred: string,
  ): string | undefined => {
    const v = node?.preds.get(pred)?.[0]
    return v ? v.value : undefined
  }
  const lits = (node: { preds: Map<string, Term[]> } | undefined, pred: string): string[] =>
    (node?.preds.get(pred) ?? []).map((t) => t.value).filter(Boolean)
  const nodeOf = (t: Term | undefined) => (t ? index.get(termKey(t)) : undefined)

  const recordConformance = (node: { preds: Map<string, Term[]> }) => {
    for (const u of lits(node, DCT + 'conformsTo')) {
      const id = c2p[u.replace(/\/+$/, '')]
      if (id) profiles.add(id)
    }
  }

  // Catalog-level metadata (first dcat:Catalog).
  let catalog: HarvestResult['catalog']
  for (const node of Array.from(index.values())) {
    const types = (node.preds.get(RDF + 'type') ?? []).map((t) => t.value)
    if (types.includes(DCAT + 'Catalog')) {
      recordConformance(node)
      catalog = {
        title: lit(node, DCT + 'title'),
        description: lit(node, DCT + 'description'),
        homepage: lit(node, FOAF + 'homepage'),
      }
      break
    }
  }

  // Dataset subjects: those typed dcat:Dataset (or schema.org Dataset for Croissant),
  // else the objects of any dcat:dataset link (feeds that omit the type).
  const datasetKeys = new Set<string>()
  for (const [k, node] of Array.from(index.entries())) {
    const types = (node.preds.get(RDF + 'type') ?? []).map((t) => t.value)
    if (
      types.includes(DCAT + 'Dataset') ||
      types.includes(SCHEMA + 'Dataset') ||
      types.includes(SCHEMA_HTTP + 'Dataset')
    )
      datasetKeys.add(k)
  }
  if (datasetKeys.size === 0) {
    for (const node of Array.from(index.values()))
      for (const o of node.preds.get(DCAT + 'dataset') ?? []) datasetKeys.add(termKey(o))
  }

  const usedSlugs = new Map<string, number>() // namespace/slug → count, for uniqueness
  const datasets: HarvestedDataset[] = []

  for (const key of Array.from(datasetKeys)) {
    const node = index.get(key)
    if (!node) continue
    recordConformance(node)

    const title =
      lit(node, DCT + 'title') ??
      lit(node, SCHEMA + 'name') ??
      lit(node, SCHEMA_HTTP + 'name') ??
      lit(node, DCT + 'identifier')
    const identifier =
      lit(node, DCT + 'identifier') ?? (node.id.kind === 'iri' ? node.id.value : undefined)
    if (!title && !identifier) {
      warnings.push(`skipped a dcat:Dataset with no title or identifier`)
      continue
    }
    const name = title ?? identifier!

    // Namespace: publisher name, else first theme's label, else 'dataset'.
    const publisherNode = nodeOf(node.preds.get(DCT + 'publisher')?.[0])
    const publisherName =
      lit(publisherNode, FOAF + 'name') ??
      lit(node, DCT + 'publisher') /* IRI-only publisher */ ??
      lit(node, SCHEMA + 'publisher')
    const themes = [...lits(node, DCAT + 'theme'), ...lits(node, SCHEMA + 'keywords')]
    const namespaceSeed =
      (publisherName && !/^https?:/.test(publisherName) ? publisherName : undefined) ??
      (themes[0] && !/^https?:/.test(themes[0]) ? themes[0] : undefined) ??
      'dataset'
    const namespace = slugify(namespaceSeed)

    // Slug: identifier tail, else title. Unique within namespace.
    let slug = slugify((identifier ?? name).split(/[/#]/).filter(Boolean).pop() ?? name)
    const uniqKey = `${namespace}/${slug}`
    const seen = usedSlugs.get(uniqKey)
    if (seen) {
      usedSlugs.set(uniqKey, seen + 1)
      slug = `${slug}-${seen + 1}`
    } else {
      usedSlugs.set(uniqKey, 1)
    }

    // Distributions → resources.
    const resources: HarvestedResource[] = []
    const distTerms = [
      ...(node.preds.get(DCAT + 'distribution') ?? []),
      ...(node.preds.get(SCHEMA + 'distribution') ?? []),
      ...(node.preds.get(SCHEMA_HTTP + 'distribution') ?? []),
    ]
    for (const dt of distTerms) {
      const dist = nodeOf(dt)
      if (!dist) {
        // A distribution given as a bare IRI with no describing node.
        if (dt.kind === 'iri') resources.push({ path: dt.value })
        continue
      }
      const path =
        lit(dist, DCAT + 'downloadURL') ??
        lit(dist, DCAT + 'accessURL') ??
        lit(dist, SCHEMA + 'contentUrl') ??
        lit(dist, SCHEMA_HTTP + 'contentUrl')
      if (!path) continue
      resources.push({
        title: lit(dist, DCT + 'title') ?? lit(dist, SCHEMA + 'name'),
        name: lit(dist, DCT + 'title'),
        path,
        format: normalizeFormat(
          lit(dist, DCT + 'format') ?? lit(dist, SCHEMA + 'encodingFormat'),
          lit(dist, DCAT + 'mediaType') ?? lit(dist, SCHEMA + 'encodingFormat'),
        ),
        describedBy: lit(dist, DCAT + 'describedBy'),
      })
    }
    if (resources.length === 0) {
      const lp = lit(node, DCAT + 'landingPage') ?? lit(node, SCHEMA + 'url')
      if (lp) {
        resources.push({ path: lp, name: 'landing page' })
        warnings.push(
          `dataset "${name}" has no distribution — used its landing page as the resource`,
        )
      } else {
        warnings.push(
          `dataset "${name}" has no distribution or landing page — no resources harvested`,
        )
      }
    }

    // GeoDCAT-AP spatial: dct:spatial → locn:geometry / dcat:bbox / gsp:asWKT.
    const spatialNode = nodeOf(node.preds.get(DCT + 'spatial')?.[0])
    const spatial =
      lit(spatialNode, LOCN + 'geometry') ??
      lit(spatialNode, DCAT + 'bbox') ??
      lit(node, DCAT + 'bbox') ??
      lit(spatialNode, 'http://www.opengis.net/ont/geosparql#asWKT')

    // License may sit on the dataset or on a distribution (DCAT-AP allows both).
    const distLicense = distTerms
      .map((dt) => lit(nodeOf(dt), DCT + 'license'))
      .find((v): v is string => Boolean(v))
    const license = lit(node, DCT + 'license') ?? distLicense

    datasets.push({
      slug,
      namespace,
      name,
      description: lit(node, DCT + 'description') ?? lit(node, SCHEMA + 'description'),
      keywords: [...lits(node, DCAT + 'keyword'), ...lits(node, SCHEMA + 'keywords')].filter(
        (v, i, a) => v && a.indexOf(v) === i,
      ),
      license,
      sources: lits(node, DCT + 'source'),
      created: lit(node, DCT + 'issued') ?? lit(node, DCT + 'created'),
      modified: lit(node, DCT + 'modified'),
      version:
        lit(node, DCAT + 'version') ?? lit(node, 'http://www.w3.org/2002/07/owl#versionInfo'),
      landingPage: lit(node, DCAT + 'landingPage'),
      identifier,
      themes: themes.length ? themes : undefined,
      spatial,
      resources,
    })
  }

  return { catalog, datasets, profiles: Array.from(profiles), warnings }
}

export type HarvestOptions = {
  format?: RdfInputFormat
  contentType?: string
}

// Parse an RDF DCAT feed (any of JSON-LD / Turtle / RDF/XML) and map it to canonical
// datasets. Format is auto-detected from the payload + Content-Type unless given.
export function harvest(text: string, opts: HarvestOptions = {}): HarvestResult {
  const format = opts.format ?? detectFormat(text, opts.contentType)
  return harvestTriples(parseRdf(text, format))
}

// Convert a harvested dataset to the exact JSON /portaljs-migrate writes into
// datasets.json (drops harvest-only fields; keeps resources[] uniform).
export function toCanonicalEntry(d: HarvestedDataset): Record<string, unknown> {
  const entry: Record<string, unknown> = {
    slug: d.slug,
    namespace: d.namespace,
    name: d.name,
  }
  if (d.description) entry.description = d.description
  if (d.keywords?.length) entry.keywords = d.keywords
  entry.resources = d.resources.map((r) => {
    const res: Record<string, unknown> = { path: r.path }
    if (r.name) res.name = r.name
    if (r.title) res.title = r.title
    if (r.format) res.format = r.format
    return res
  })
  return entry
}
