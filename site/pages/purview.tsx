import Link from 'next/link'
import Hero from '@/components/openmetadata/Hero'
import { KeyFeatures } from '@/components/openmetadata/KeyFeatures'
import { OrganizationJsonLd, BreadcrumbJsonLd, FAQJsonLd } from 'next-seo';
import { generateNextSeo } from 'next-seo/pages';
import Head from 'next/head';
import Layout from '@/components/Layout'
import { CommonUseCases } from '@/components/openmetadata/CommonUseCases'
import { FAQ } from '@/components/FAQ'

export default function Purview() {
  const faqItems = [
    {
      question: 'What is PortalJS?',
      answer: 'PortalJS is a modern frontend framework (Next.js-based) for building fast, customizable data portals — compatible with Microsoft Purview, OpenMetadata, CKAN, and other backends.'
    },
    {
      question: 'Does PortalJS replace Microsoft Purview?',
      answer: 'No. It works with your Microsoft Purview backend — just replaces the frontend for better UX.'
    },
    {
      question: 'Can I use PortalJS without modifying Microsoft Purview\'s backend?',
      answer: 'Yes. PortalJS works as a decoupled frontend — no need to touch your metadata engine.'
    },
    {
      question: 'Is this open source or commercial?',
      answer: 'PortalJS is open source. PortalJS Cloud offers a fully managed SaaS version with support and custom features.'
    },
  ];

  return (
    <Layout isHomePage={true}>
      <FAQJsonLd
        questions={faqItems.map(item => ({
          question: item.question,
          answer: item.answer
        }))}
      />
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          {/* 1. Your logo structured data */}
          <OrganizationJsonLd
            url="https://www.portaljs.com"
            logo="https://www.portaljs.com/icon.png"
          />
          {/* 2. Base SEO tags */}
          <Head>
            {generateNextSeo({
              title: "Turn Microsoft Purview into a Business-Friendly Data Catalog",
              description: "Transform Microsoft Purview's technical interface into intuitive data catalogs for business users. Create multiple user-specific portals from a single Microsoft Purview instance.",
              canonical: "https://www.portaljs.com/purview",
              openGraph: {
              url: 'https://www.portaljs.com/purview',
              title: 'Turn Microsoft Purview into a Business-Friendly Data Catalog',
              description: 'Transform Microsoft Purview\'s technical interface into intuitive data catalogs for business users. Create multiple user-specific portals from a single Microsoft Purview instance.',
              site_name: 'PortalJS',
            },
            })}
          </Head>
          {/* 4. Breadcrumb schema */}
          <BreadcrumbJsonLd
            items={[
              {
                name: 'Home',
                item: 'https://portaljs.com',
              },
              {
                name: 'Microsoft Purview',
                item: 'https://www.portaljs.com/purview',
              },
            ]}
          />
          <Hero productName="Microsoft Purview" />
        </div>
      </div>
      <div className="relative max-w-none w-full flex justify-center py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl px-4 sm:px-8 xl:px-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
            Why Pair PortalJS with Microsoft Purview?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            <a href="https://www.microsoft.com/en-us/security/business/microsoft-purview" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Purview</a> helps you organize metadata. But for many teams, its interface becomes a barrier — not a bridge. PortalJS unlocks <a href="https://www.microsoft.com/en-us/security/business/microsoft-purview" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Purview</a>'s full value by letting you build tailored, branded portals for different user groups. You get clean layouts, intuitive navigation, and embedded context — all without modifying the backend.
          </p>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          <KeyFeatures productName="Microsoft Purview" />
        </div>
      </div>
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          <CommonUseCases productName="Microsoft Purview" />
        </div>
      </div>
      <div className="relative max-w-none w-full flex justify-center bg-slate-50 dark:bg-slate-900">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12 w-full">
          <FAQ faqItems={faqItems} />
        </div>
      </div>
      <section className="w-full pt-2 pb-0 flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12 w-full">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-6 py-4">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Explore more:</span>
            <Link href="/compare" className="text-sm text-blue-600 hover:underline font-medium">Compare portal platforms →</Link>
            <Link href="/case-studies" className="text-sm text-blue-600 hover:underline font-medium">Customer stories →</Link>
            <Link href="/pricing" className="text-sm text-blue-600 hover:underline font-medium">View pricing →</Link>
          </div>
        </div>
      </section>
      <section className="w-full pb-[88px] pt-[30px]">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1830] via-[#10254a] to-[#173a78] px-7 py-12 text-center sm:px-14 sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(50% 90% at 50% -10%,rgba(125,211,252,0.22),transparent 70%)' }}
            />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to launch your data portal?
              </h2>
              <p className="mx-auto mt-4 max-w-[48ch] text-[17px] text-[#b9c9e4]">
                Join hundreds of organizations worldwide that trust PortalJS Cloud for their data publishing needs.
              </p>
              <div className="mt-[30px] flex flex-wrap justify-center gap-3.5">
                <a
                  href="https://calendar.app.google/iQkon85iKURfdBtX7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]"
                >
                  Schedule a free call
                </a>
                <a
                  href="https://calendar.app.google/iQkon85iKURfdBtX7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-[10px] border border-white/20 bg-white/[0.06] px-[18px] py-2.5 text-[14.5px] font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-white/[0.12]"
                >
                  Book a demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
