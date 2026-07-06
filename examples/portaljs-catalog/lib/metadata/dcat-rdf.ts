// RDF serializers for the DCAT feeds — JSON-LD → Turtle + RDF/XML.
//
// Harvesters consume RDF in several serializations; JSON-LD alone isn't enough for
// every national portal. This renders the SAME graph the profiles produce (a
// prefixed-key JSON-LD Catalog from dcat.ts + dcat-profiles.ts) into Turtle and
// RDF/XML, deterministically and with zero runtime dependencies.
//
// The approach is a small, focused JSON-LD reader (not a general JSON-LD 1.1
// processor): our documents are a fixed shape — a Catalog node whose properties are
// prefixed IRIs, nested Agent/Contact/Distribution/Dataset nodes, string/array
// literals, and a handful of IRI-valued properties. We flatten that to RDF triples,
// then print. Because every profile emits the same prefixed-key shape, one reader
// serves all of them.

import type { JsonLdNode } from './dcat-profiles'

// --- triple model ---------------------------------------------------------------

type Term =
  | { kind: 'iri'; value: string }
  | { kind: 'bnode'; value: string }
  | { kind: 'literal'; value: string; lang?: string; datatype?: string }
type Triple = { s: Term; p: Term; o: Term }

const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const XSD = 'http://www.w3.org/2001/XMLSchema#'

// Properties whose string value is an IRI (a link), not a literal. Everything else
// defaults to a literal — matching how the DCAT profiles emit these terms.
const IRI_PROPS = new Set([
  '@id',
  '@type',
  'dcat:downloadURL',
  'dcat:accessURL',
  'dcat:landingPage',
  'dcat:theme',
  'dcat:themeTaxonomy',
  'dcat:mediaType',
  'dct:format',
  'dct:license',
  'dct:conformsTo',
  'dct:source',
  'dct:publisher',
  'dct:creator',
  'dct:accrualPeriodicity',
  'dct:language',
  'foaf:homepage',
  'foaf:mbox',
  'foaf:page',
  'vcard:hasEmail',
])

// Properties whose literal value is a date/dateTime (xsd typed).
const DATE_PROPS = new Set(['dct:issued', 'dct:modified', 'dct:created'])

// The context maps a prefix to a namespace string, but may also carry per-term
// definitions ({ '@type': '@id' }, …) — only the string entries are namespaces.
type Context = Record<string, unknown>
function nsOf(ctx: Context, prefix: string): string | undefined {
  const v = ctx[prefix]
  return typeof v === 'string' ? v : undefined
}

function expand(ctx: Context, term: string): string {
  if (/^https?:|^mailto:|^urn:/.test(term)) return term
  const i = term.indexOf(':')
  if (i === -1) return term
  const prefix = term.slice(0, i)
  const local = term.slice(i + 1)
  const ns = prefix === 'rdf' ? RDF : nsOf(ctx, prefix)
  return ns ? ns + local : term
}

function isDateish(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/.test(v)
}

// Walk one node, minting a subject term and emitting its triples. Returns the term
// other nodes link to (its @id IRI, or a fresh blank node).
function walkNode(
  node: JsonLdNode,
  ctx: Context,
  triples: Triple[],
  counter: { n: number }
): Term {
  const id = node['@id']
  const subject: Term =
    typeof id === 'string'
      ? { kind: 'iri', value: expand(ctx, id) }
      : { kind: 'bnode', value: `b${counter.n++}` }

  for (const [key, value] of Object.entries(node)) {
    if (key === '@context' || key === '@id' || value === undefined || value === null) continue

    const predicate: Term =
      key === '@type'
        ? { kind: 'iri', value: RDF + 'type' }
        : { kind: 'iri', value: expand(ctx, key) }

    const values = Array.isArray(value) ? value : [value]
    for (const v of values) {
      let object: Term
      if (v && typeof v === 'object') {
        object = walkNode(v as JsonLdNode, ctx, triples, counter)
      } else if (key === '@type') {
        object = { kind: 'iri', value: expand(ctx, String(v)) }
      } else if (IRI_PROPS.has(key)) {
        object = { kind: 'iri', value: expand(ctx, String(v)) }
      } else {
        const s = String(v)
        object =
          DATE_PROPS.has(key) && isDateish(s)
            ? { kind: 'literal', value: s, datatype: XSD + (s.length > 10 ? 'dateTime' : 'date') }
            : { kind: 'literal', value: s }
      }
      triples.push({ s: subject, p: predicate, o: object })
    }
  }
  return subject
}

// Flatten a profiled JSON-LD catalog into a triple list.
function toTriples(catalog: JsonLdNode): { triples: Triple[]; ctx: Context } {
  const ctx = (catalog['@context'] as Context) ?? {}
  const triples: Triple[] = []
  walkNode(catalog, ctx, triples, { n: 0 })
  return { triples, ctx }
}

// --- Turtle ---------------------------------------------------------------------

function ttlTerm(t: Term): string {
  if (t.kind === 'iri') return `<${t.value}>`
  if (t.kind === 'bnode') return `_:${t.value}`
  const esc = t.value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
  if (t.lang) return `"${esc}"@${t.lang}`
  if (t.datatype) return `"${esc}"^^<${t.datatype}>`
  return `"${esc}"`
}

// Serialize a profiled DCAT catalog to Turtle. Groups triples by subject with
// predicate-object lists for readability; deterministic given the input order.
export function toTurtle(catalog: JsonLdNode): string {
  const { triples, ctx } = toTriples(catalog)
  const prefixes: string[] = [`@prefix rdf: <${RDF}> .`, `@prefix xsd: <${XSD}> .`]
  for (const [p, ns] of Object.entries(ctx))
    if (typeof ns === 'string') prefixes.push(`@prefix ${p}: <${ns}> .`)

  // Preserve first-seen subject order.
  const order: string[] = []
  const bySubject = new Map<string, { subject: Term; preds: Map<string, string[]> }>()
  for (const { s, p, o } of triples) {
    const sk = `${s.kind}:${s.value}`
    if (!bySubject.has(sk)) {
      bySubject.set(sk, { subject: s, preds: new Map() })
      order.push(sk)
    }
    const entry = bySubject.get(sk)!
    const pk = ttlTerm(p)
    if (!entry.preds.has(pk)) entry.preds.set(pk, [])
    entry.preds.get(pk)!.push(ttlTerm(o))
  }

  const blocks: string[] = []
  for (const sk of order) {
    const { subject, preds } = bySubject.get(sk)!
    const lines = Array.from(preds.entries()).map(([p, objs]) => `    ${p} ${objs.join(', ')}`)
    blocks.push(`${ttlTerm(subject)}\n${lines.join(' ;\n')} .`)
  }
  return prefixes.join('\n') + '\n\n' + blocks.join('\n\n') + '\n'
}

// --- RDF/XML --------------------------------------------------------------------

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Split an expanded IRI into a (namespace, localName) pair for an element QName.
function splitIri(iri: string): { ns: string; local: string } {
  const h = iri.lastIndexOf('#')
  const sl = iri.lastIndexOf('/')
  const cut = Math.max(h, sl)
  return { ns: iri.slice(0, cut + 1), local: iri.slice(cut + 1) }
}

// Serialize a profiled DCAT catalog to RDF/XML. Uses rdf:Description blocks (one per
// subject) so it stays profile-agnostic — no need to know each class's element name.
export function toRdfXml(catalog: JsonLdNode): string {
  const { triples, ctx } = toTriples(catalog)

  // Build a namespace→prefix table (invert the context; ensure rdf + xsd).
  const nsToPrefix = new Map<string, string>([
    [RDF, 'rdf'],
    [XSD, 'xsd'],
  ])
  for (const [p, ns] of Object.entries(ctx))
    if (typeof ns === 'string' && !nsToPrefix.has(ns)) nsToPrefix.set(ns, p)
  let auto = 0
  function prefixFor(ns: string): string {
    if (!nsToPrefix.has(ns)) nsToPrefix.set(ns, `ns${auto++}`)
    return nsToPrefix.get(ns)!
  }
  function qname(iri: string): string {
    const { ns, local } = splitIri(iri)
    return `${prefixFor(ns)}:${local}`
  }

  // Group by subject, preserving order.
  const order: string[] = []
  const bySubject = new Map<string, { subject: Term; props: Triple[] }>()
  for (const t of triples) {
    const sk = `${t.s.kind}:${t.s.value}`
    if (!bySubject.has(sk)) {
      bySubject.set(sk, { subject: t.s, props: [] })
      order.push(sk)
    }
    bySubject.get(sk)!.props.push(t)
  }

  const bodies: string[] = []
  for (const sk of order) {
    const { subject, props } = bySubject.get(sk)!
    const open =
      subject.kind === 'bnode'
        ? `  <rdf:Description rdf:nodeID="${subject.value}">`
        : `  <rdf:Description rdf:about="${xmlEscape(subject.value)}">`
    const lines = [open]
    for (const { p, o } of props) {
      const el = qname(p.value)
      if (o.kind === 'iri') {
        lines.push(`    <${el} rdf:resource="${xmlEscape(o.value)}"/>`)
      } else if (o.kind === 'bnode') {
        lines.push(`    <${el} rdf:nodeID="${o.value}"/>`)
      } else {
        const attr = o.lang
          ? ` xml:lang="${o.lang}"`
          : o.datatype
            ? ` rdf:datatype="${xmlEscape(o.datatype)}"`
            : ''
        lines.push(`    <${el}${attr}>${xmlEscape(o.value)}</${el}>`)
      }
    }
    lines.push('  </rdf:Description>')
    bodies.push(lines.join('\n'))
  }

  const xmlns = Array.from(nsToPrefix.entries())
    .map(([ns, p]) => `xmlns:${p}="${xmlEscape(ns)}"`)
    .join('\n         ')
  return (
    `<?xml version="1.0" encoding="utf-8"?>\n` +
    `<rdf:RDF ${xmlns}>\n` +
    bodies.join('\n') +
    `\n</rdf:RDF>\n`
  )
}

// Convenience: serialize to a named RDF format.
export type RdfFormat = 'jsonld' | 'ttl' | 'rdf'
export function serialize(catalog: JsonLdNode, format: RdfFormat): string {
  switch (format) {
    case 'ttl':
      return toTurtle(catalog)
    case 'rdf':
      return toRdfXml(catalog)
    case 'jsonld':
      return JSON.stringify(catalog, null, 2) + '\n'
  }
}
