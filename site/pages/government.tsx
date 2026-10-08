import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { generateNextSeo } from 'next-seo/pages'
import { BreadcrumbJsonLd } from 'next-seo'
import Layout from '@/components/Layout'
import SocialProof from '@/components/home/SocialProof'
import { track } from '@/lib/track'

// Government landing page (da-55j.5): the destination of the demo-and-call path.
//
// Government buyers don't sign up for software. They want to see it working and talk to
// someone, so this page offers exactly one action: book a call. No self-serve sign-up
// lives here on purpose (da-55j.6): for this audience it is a dead end. Site CTAs aimed
// at government and links in outreach emails both land here.
//
// Every claim below is backed by a published case study or a shipped skill; keep it that
// way. The hero's right column is a portal screenshot standing in for the 2-3 minute demo
// video (da-55j.4). Swap it in when the video exists.

const BOOK_CALL = '/book-a-demo'
const PAGE_URL = 'https://www.portaljs.com/government'

// Carry outreach attribution (?prospect=…, utm_*) through to /book-a-demo, which records
// it on book_a_demo_redirect. The link from a cold email is then traceable to the call.
function useBookCallHref(position: string) {
  const { query } = useRouter()
  const params = new URLSearchParams({ source: `government_${position}` })
  for (const [k, v] of Object.entries(query)) {
    if (typeof v === 'string' && (k === 'prospect' || k.startsWith('utm_'))) params.set(k, v)
  }
  return `${BOOK_CALL}?${params.toString()}`
}

function BookCallButton({ position, label = 'Book a 30-minute call' }: { position: string; label?: string }) {
  const href = useBookCallHref(position)
  return (
    <Link
      href={href}
      onClick={() => track('government_cta_clicked', { target: 'book_call', position })}
      className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]"
    >
      {label}
      <span aria-hidden="true" className="text-[15px] leading-none">
        →
      </span>
    </Link>
  )
}

const BENEFITS = [
  {
    title: 'See your portal before you commit',
    body: 'We start with a working prototype built from your own catalogue, so you judge PortalJS on your data, not on a sales deck.',
  },
  {
    title: 'Open source, no lock-in',
    body: 'PortalJS (MIT) and CKAN are open source. Your portal’s code, data and metadata stay yours, whoever hosts them.',
  },
  {
    title: 'Migrate from Socrata, OpenDataSoft or ArcGIS Hub',
    body: 'We harvest your existing catalogue (datasets, metadata and files) and carry it across, as we did moving Lincolnshire and Hounslow off self-run CKAN.',
  },
  {
    title: 'Standards your national portal can harvest',
    body: 'Publish DCAT, DCAT-AP or DCAT-US catalogue feeds so national and EU portals can harvest your datasets.',
  },
  {
    title: 'Hosting that fits your rules',
    body: 'Fully managed by Datopian, on a dedicated environment, or on your own cloud. UAE MOEI runs on the ministry’s own Azure.',
  },
  {
    title: 'Built for the public',
    body: 'Search, previews, charts and APIs for citizens and developers; multilingual, including right-to-left languages.',
  },
]

const STEPS = [
  {
    title: 'Book a call',
    body: '30 minutes on your current portal, your users and your timeline. No preparation needed.',
  },
  {
    title: 'Get a prototype',
    body: 'We build a working prototype of your portal on your own published data and walk you through it.',
  },
  {
    title: 'Pilot and launch',
    body: 'We migrate the catalogue, configure it to your standards and go live, hosted by us or handed over to you.',
  },
]

const CASE_STUDIES = [
  {
    org: 'Lincolnshire County Council',
    stat: 'Dedicated CKAN → managed PortalJS, catalogue migrated intact',
    href: '/case-studies/modernizing-lincolnshire-county-council39s-open-data-portal',
    img: '/images/casestudies/lincolnshire1.png',
  },
  {
    org: 'London Borough of Hounslow',
    stat: '50% reduction in cloud costs after leaving self-hosted CKAN',
    href: '/case-studies/london-borough-of-hounslow',
    img: '/images/casestudies/hounslow-screenshot.webp',
  },
  {
    org: 'UAE Ministry of Energy & Infrastructure',
    stat: 'Bilingual Arabic/English portal on the ministry’s own Azure',
    href: '/case-studies/uae-moei-scalable-platform-government-data-publishing',
    img: '/images/casestudies/moei-5.webp',
  },
]

const COMPARE = [
  { name: 'Socrata', href: '/compare/socrata' },
  { name: 'OpenDataSoft', href: '/compare/opendatasoft' },
  { name: 'ArcGIS Hub', href: '/compare/arcgis-hub' },
]

export default function GovernmentPage() {
  return (
    <Layout isHomePage={true}>
      <Head>
        {generateNextSeo({
          title: 'Open Data Portals for Government | PortalJS',
          description:
            'Open-source data portals for ministries, cities and public agencies. See a prototype of your portal on your own data, migrate from Socrata, OpenDataSoft or ArcGIS Hub, and keep full ownership.',
          canonical: PAGE_URL,
          openGraph: {
            url: PAGE_URL,
            title: 'Open Data Portals for Government | PortalJS',
            description:
              'See a prototype of your portal on your own data. Open source, standards-based, no lock-in.',
            site_name: 'PortalJS',
            type: 'website',
            images: [
              {
                url: 'https://www.portaljs.com/static/img/seo.webp',
                alt: 'PortalJS for government',
                width: 1280,
                height: 720,
                type: 'image/webp',
              },
            ],
          },
          twitter: { cardType: 'summary_large_image', site: '@PortalJS_' },
        })}
      </Head>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: 'https://www.portaljs.com' },
          { name: 'Government', item: PAGE_URL },
        ]}
      />

      {/* Hero */}
      <section className="w-full">
        <div className="mx-auto grid max-w-8xl items-center gap-12 px-4 pb-16 pt-14 sm:px-8 lg:grid-cols-2 xl:px-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-sky-400">
              PortalJS for government
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Your open data portal, without the vendor lock-in.
            </h1>
            <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-slate-600 dark:text-slate-400">
              Datopian builds and runs open data portals for ministries, councils and public
              agencies on PortalJS and CKAN. They’re open source, built on open standards, and
              yours to keep. Book a call and we’ll show you a prototype of your portal on your
              own data.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <BookCallButton position="hero" />
              <a
                href="#case-studies"
                onClick={() => track('government_cta_clicked', { target: 'case_studies', position: 'hero' })}
                className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-sky-400"
              >
                See who uses it <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          {/* Demo video slot (da-55j.4): a real government portal screenshot until then. */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-[0_34px_80px_-34px_rgba(15,23,42,0.45)] dark:border-slate-700">
            <img
              src="/images/casestudies/moei-5.webp"
              alt="The UAE Ministry of Energy & Infrastructure open data portal, built with PortalJS"
              className="block h-auto w-full"
            />
          </div>
        </div>
      </section>

      <SocialProof />

      {/* What you get */}
      <section className="w-full py-20">
        <div className="mx-auto max-w-8xl px-4 sm:px-8 xl:px-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            What you get
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/60"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{b.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="w-full bg-slate-50 py-20 dark:bg-slate-800/40">
        <div className="mx-auto max-w-8xl px-4 sm:px-8 xl:px-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">How it works</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">{s.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-[70ch] text-[15px] text-slate-600 dark:text-slate-400">
            <strong className="text-slate-900 dark:text-white">Planning a tender?</strong> Talk to us
            before you write the requirements. We’ll show you what’s possible on your own data first.
          </p>
        </div>
      </section>

      {/* Case studies */}
      <section id="case-studies" className="w-full scroll-mt-24 py-20">
        <div className="mx-auto max-w-8xl px-4 sm:px-8 xl:px-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Trusted by public bodies
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {CASE_STUDIES.map((c) => (
              <Link
                key={c.org}
                href={c.href}
                onClick={() => track('government_cta_clicked', { target: 'case_study', position: c.org })}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/60"
              >
                <img src={c.img} alt={`${c.org} data portal`} className="aspect-[16/9] w-full object-cover object-top" />
                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-sky-400">
                    {c.org}
                  </h3>
                  <p className="mt-1 text-[14.5px] text-slate-600 dark:text-slate-400">{c.stat}</p>
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-[15px] text-slate-600 dark:text-slate-400">
            Moving off a proprietary platform? Compare PortalJS with{' '}
            {COMPARE.map((c, i) => (
              <span key={c.href}>
                <Link
                  href={c.href}
                  onClick={() => track('government_cta_clicked', { target: 'compare', position: c.name })}
                  className="font-semibold text-blue-600 hover:underline dark:text-sky-400"
                >
                  {c.name}
                </Link>
                {i < COMPARE.length - 2 ? ', ' : i === COMPARE.length - 2 ? ' or ' : '.'}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="w-full pb-[88px] pt-[10px]">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12">
          <div className="rounded-3xl bg-gradient-to-br from-[#0b1830] via-[#10254a] to-[#173a78] px-7 py-12 text-center sm:px-14 sm:py-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              See your portal on PortalJS.
            </h2>
            <p className="mx-auto mt-4 max-w-[48ch] text-[17px] text-[#b9c9e4]">
              Tell us which portal you run today. We’ll come back with a prototype on your own data.
            </p>
            <div className="mt-[30px] flex justify-center">
              <BookCallButton position="footer" />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
