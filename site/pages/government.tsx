import type { CSSProperties, ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { generateNextSeo } from 'next-seo/pages'
import { BreadcrumbJsonLd } from 'next-seo'
import Layout from '@/components/Layout'
import SocialProof from '@/components/home/SocialProof'
import SectionHeader from '@/components/home/SectionHeader'
import IconCard from '@/components/home/IconCard'
import BrowserFrame from '@/components/home/BrowserFrame'
import CtaBandShell from '@/components/home/CtaBandShell'
import { track } from '@/lib/track'

// Government landing page (da-55j.5): the destination of the demo-and-call path.
//
// Government buyers don't sign up for software. They want to see it working and talk to
// someone, so this page offers exactly one action: book a call. No self-serve sign-up
// lives here on purpose: for this audience it is a dead end. Site CTAs aimed at
// government and links in outreach emails both land here.
//
// Built from the homepage's parts (SectionHeader, IconCard, SocialProof, BrowserFrame,
// CtaBandShell) so it reads as the same site.
//
// Every claim below is backed by a published case study (content/case-studies/) or a
// shipped skill (migrate, DCAT); keep it that way. Each case-study metric is quoted
// from that case study's own keystats/features. The hero's screenshot stands in for the
// 2-3 minute demo video (da-55j.4). Swap it in when the video exists.

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

// Same gradient button as the homepage's primary CTAs (CtaBand, hero).
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

// Metrics are quoted from each case study's frontmatter; don't round them up.
//   Santa Monica  keystats "115 datasets migrated"; title "…Without Breaking a Single Link"
//   Hounslow      keystats "50% reduction in cloud costs"
//   Lincolnshire  features "transferred all 60 published datasets … without data loss"
//   UAE MOEI      keystats "50+ datasets published and growing", "2 languages natively
//                 supported"; solution "deployed on MOEI's existing Azure infrastructure"
const CASE_STUDIES = [
  {
    org: 'City of Santa Monica',
    kind: 'City government',
    metric: '115',
    label: 'datasets moved to managed PortalJS Cloud, without breaking a single link',
    href: '/case-studies/santa-monica-portaljs-cloud-migration',
    img: '/images/casestudies/santa-monica-datasets.webp',
  },
  {
    org: 'London Borough of Hounslow',
    kind: 'London borough',
    metric: '50%',
    label: 'reduction in cloud costs after leaving self-hosted CKAN',
    href: '/case-studies/london-borough-of-hounslow',
    img: '/images/casestudies/hounslow-screenshot.webp',
  },
  {
    org: 'Lincolnshire County Council',
    kind: 'County council',
    metric: '60',
    label: 'datasets migrated off a dedicated CKAN instance, with no data loss',
    href: '/case-studies/modernizing-lincolnshire-county-council39s-open-data-portal',
    img: '/images/casestudies/lincolnshire4.png',
  },
  {
    org: 'UAE Ministry of Energy & Infrastructure',
    kind: 'National ministry',
    metric: '50+',
    label: 'datasets published in Arabic and English, on the ministry’s own Azure',
    href: '/case-studies/uae-moei-scalable-platform-government-data-publishing',
    img: '/images/casestudies/moei-1.webp',
  },
]

const BENEFITS: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: 'See your portal before you commit',
    body: 'A working prototype built from your own catalogue, so you judge PortalJS on your data, not a sales deck.',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="m9 10.5 2 2 4-4" />
      </>
    ),
  },
  {
    title: 'Open source, no lock-in',
    body: 'PortalJS (MIT) and CKAN are open source. Your code, data and metadata stay yours, whoever hosts them.',
    icon: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    title: 'Migrate from Socrata, OpenDataSoft or ArcGIS Hub',
    body: 'We move your datasets, metadata and files across, as we did taking Santa Monica off Socrata and Hounslow off self-run CKAN.',
    icon: (
      <>
        <path d="M4 8h13l-3-3M20 16H7l3 3" />
      </>
    ),
  },
  {
    title: 'Standards your national portal can harvest',
    body: 'DCAT, DCAT-AP or DCAT-US catalogue feeds, so national and EU portals can harvest your datasets.',
    icon: (
      <>
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" />
        <path d="M2 12h20M12 2c2.5 2.7 3.8 6.3 4 10-.2 3.7-1.5 7.3-4 10-2.5-2.7-3.8-6.3-4-10 .2-3.7 1.5-7.3 4-10Z" />
      </>
    ),
  },
  {
    title: 'Hosting that fits your rules',
    body: 'Managed by Datopian, on a dedicated environment, or on your own cloud. UAE MOEI runs on the ministry’s own Azure.',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="7" rx="1.5" />
        <rect x="3" y="13" width="18" height="7" rx="1.5" />
        <path d="M7 7.5h.01M7 16.5h.01" />
      </>
    ),
  },
  {
    title: 'Built for the public',
    body: 'Search, previews, charts and APIs for citizens and developers. Multilingual, right-to-left included.',
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M22 20a6 6 0 0 0-5-5.9" />
      </>
    ),
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Book a call',
    body: '30 minutes on your current portal, your users and your timeline. No preparation needed.',
    meta: '30 minutes',
  },
  {
    n: '02',
    title: 'Get a prototype',
    body: 'We build a working prototype of your portal on your own published data and walk you through it.',
    meta: 'On your own data',
  },
  {
    n: '03',
    title: 'Pilot and launch',
    body: 'We migrate the catalogue, configure it to your standards and go live, hosted by us or handed over to you.',
    meta: 'Hosted or handed over',
  },
]

const COMPARE = [
  { name: 'Socrata', href: '/compare/socrata' },
  { name: 'OpenDataSoft', href: '/compare/opendatasoft' },
  { name: 'ArcGIS Hub', href: '/compare/arcgis-hub' },
]

export default function GovernmentPage() {
  const tenderHref = useBookCallHref('tender')
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

      {/* Hero: same frame as the homepage's (badge, gradient headline, browser window). */}
      <section className="relative w-full overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(60% 50% at 82% 12%,rgba(56,189,248,0.16),transparent 70%),radial-gradient(50% 60% at 6% 4%,rgba(125,211,252,0.14),transparent 68%)',
          }}
        />
        <div className="mx-auto grid max-w-8xl items-center gap-12 px-4 pb-14 pt-4 sm:px-8 sm:pb-16 sm:pt-6 lg:grid-cols-[1fr_1.1fr] lg:gap-14 xl:px-12">
          <div>
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-blue-600/25 bg-blue-600/[0.06] px-3 py-1.5 text-[12.5px] font-medium text-blue-600 dark:text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
              PortalJS for government
            </div>
            <h1
              className="m-0 text-[40px] font-bold leading-[1.04] tracking-tight text-slate-900 dark:text-white sm:text-5xl xl:text-[56px]"
              style={{ textWrap: 'balance' } as CSSProperties}
            >
              Your open data portal,{' '}
              <span className="bg-gradient-to-r from-sky-400 via-blue-600 to-blue-900 bg-clip-text text-transparent">
                without the vendor lock-in.
              </span>
            </h1>
            <p className="mt-5 max-w-[540px] text-[18px] leading-relaxed text-slate-500 dark:text-slate-400">
              Datopian builds and runs open data portals for ministries, councils and public
              agencies on PortalJS and CKAN. They’re open source, built on open standards, and
              yours to keep.{' '}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                Book a call and we’ll show you a prototype of your portal on your own data.
              </span>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <BookCallButton position="hero" />
              <a
                href="#case-studies"
                onClick={() => track('government_cta_clicked', { target: 'case_studies', position: 'hero' })}
                className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                See who uses it <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>

          {/* Demo video slot (da-55j.4): a real government portal until then. Cropped to
              its top-left on phones so the portal stays legible at 390px. */}
          <BrowserFrame
            url="datajs.santamonica.gov"
            footer="Santa Monica · 82 datasets on PortalJS Cloud"
          >
            <div className="relative aspect-[4/3] bg-slate-50 sm:aspect-[1568/897]">
              <Image
                src="/images/casestudies/santa-monica-homepage.webp"
                alt="The City of Santa Monica open data portal, running on PortalJS Cloud"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-left-top"
              />
            </div>
          </BrowserFrame>
        </div>
      </section>

      <SocialProof />

      {/* Proof first: each case leads with the number its case study publishes. */}
      <section id="case-studies" className="w-full scroll-mt-32 py-20 sm:py-[88px]">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader
              eyebrow="In production"
              title="Trusted by public bodies."
              lede="Cities, councils and ministries run their open data on PortalJS today."
            />
            <Link
              href="/case-studies"
              onClick={() => track('government_cta_clicked', { target: 'case_study', position: 'all' })}
              className="whitespace-nowrap font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              All case studies →
            </Link>
          </div>

          <div className="mt-11 grid gap-[22px] sm:grid-cols-2">
            {CASE_STUDIES.map((c) => (
              <Link
                key={c.org}
                href={c.href}
                onClick={() => track('government_cta_clicked', { target: 'case_study', position: c.org })}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_20px_44px_-24px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900/60"
              >
                <div className="relative aspect-[16/9] overflow-hidden border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                  <Image
                    src={c.img}
                    alt={`${c.org} open data portal`}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover object-top transition-transform duration-[400ms] group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{c.org}</h3>
                    <span className="hidden whitespace-nowrap font-mono text-xs font-medium text-slate-400 dark:text-slate-500 sm:block">
                      {c.kind}
                    </span>
                  </div>
                  <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="bg-gradient-to-r from-sky-400 via-blue-600 to-blue-900 bg-clip-text text-5xl font-bold tracking-tight text-transparent">
                      {c.metric}
                    </span>
                    <span className="max-w-[34ch] text-[15px] leading-snug text-slate-600 dark:text-slate-300">
                      {c.label}
                    </span>
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[14px] font-semibold text-blue-600 group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
                    Read the case study <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What you get: the homepage's icon cards. */}
      <section className="w-full scroll-mt-32 border-y border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40 sm:py-[88px]">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12">
          <SectionHeader
            eyebrow="What you get"
            title="A portal you own, on your terms."
            lede="Open source and standards-based, migrated for you, hosted where your rules allow."
          />
          <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <IconCard key={b.title} icon={b.icon} title={b.title} body={b.body} compact />
            ))}
          </div>
        </div>
      </section>

      {/* How it works: the homepage's numbered step cards. */}
      <section className="w-full scroll-mt-32 py-20 sm:py-[88px]">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12">
          <SectionHeader
            eyebrow="How it works"
            title="Call → Prototype → Pilot"
            lede="Three steps from a first conversation to a live portal, on your own data from the start."
          />

          <ol className="mt-11 grid gap-[22px] md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.n}
                className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <span className="font-mono text-xs font-semibold tracking-[0.12em] text-blue-600 dark:text-blue-400">
                  {step.n}
                </span>
                <h3 className="mb-2 mt-3.5 text-lg font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-[14.5px] text-slate-600 dark:text-slate-300">{step.body}</p>
                <span className="mt-auto pt-4">
                  <span className="inline-flex rounded-[9px] border border-slate-200 bg-slate-50 px-[13px] py-[7px] font-mono text-[12.5px] font-medium text-[#3b4a60] dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                    {step.meta}
                  </span>
                </span>
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute right-[-17px] top-1/2 z-10 hidden -translate-y-1/2 text-xl text-slate-300 dark:text-slate-600 md:block"
                  >
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>

          {/* Tender callout: its own card, so it reads as part of the section. */}
          <div className="mt-[22px] flex flex-col gap-5 rounded-2xl border border-blue-200 bg-gradient-to-br from-sky-50 to-blue-50/60 p-6 dark:border-blue-500/30 dark:from-slate-900 dark:to-blue-950/40 sm:flex-row sm:items-center sm:justify-between sm:p-[30px]">
            <div className="flex items-start gap-4">
              <div className="grid h-[42px] w-[42px] flex-none place-items-center rounded-[11px] bg-gradient-to-br from-sky-400/20 to-blue-600/15 text-blue-800 dark:text-blue-300">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-[22px] w-[22px]"
                  aria-hidden="true"
                >
                  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
                  <path d="M14 3v5h5M9 13h6M9 17h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-[17.5px] font-semibold text-slate-900 dark:text-white">Planning a tender?</h3>
                <p className="mt-1 max-w-[62ch] text-[14.5px] text-slate-600 dark:text-slate-300">
                  Talk to us before you write the requirements. We’ll show you what’s possible on
                  your own data first.
                </p>
              </div>
            </div>
            <Link
              href={tenderHref}
              onClick={() => track('government_cta_clicked', { target: 'book_call', position: 'tender' })}
              className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap pl-[58px] text-[14.5px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 sm:pl-0"
            >
              Talk to us first <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Compare: the homepage's wordmark chips, as links. */}
      <section className="w-full scroll-mt-32 border-y border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40 sm:py-[88px]">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12">
          <SectionHeader
            eyebrow="Compare"
            title="Moving off a proprietary platform?"
            lede="See how PortalJS compares with the platform you run today."
          />
          <div className="mt-10 flex flex-wrap gap-3">
            {COMPARE.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={() => track('government_cta_clicked', { target: 'compare', position: c.name })}
                className="inline-flex items-center gap-2 rounded-[11px] border border-slate-200 bg-white px-5 py-[13px] font-mono text-sm font-semibold text-[#3b4a60] transition-colors duration-150 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-800 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-blue-500/60 dark:hover:bg-slate-800 dark:hover:text-blue-300"
              >
                PortalJS vs {c.name} <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA: the homepage's band, with this page's single action. */}
      <div className="pt-[58px]">
        <CtaBandShell>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            See your portal on PortalJS.
          </h2>
          <p className="mx-auto mt-4 max-w-[48ch] text-[17px] text-[#b9c9e4]">
            Tell us which portal you run today. We’ll come back with a prototype on your own data.
          </p>
          <div className="mt-[30px] flex justify-center">
            <BookCallButton position="footer" />
          </div>
        </CtaBandShell>
      </div>
    </Layout>
  )
}
