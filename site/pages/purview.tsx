import Hero from '@/components/openmetadata/Hero'
import { KeyFeatures } from '@/components/openmetadata/KeyFeatures'
import Schedule from '@/components/home/Schedule'
import { LogoJsonLd, NextSeo, WebPageJsonLd, BreadcrumbJsonLd, FAQPageJsonLd } from 'next-seo'
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
      <FAQPageJsonLd
        mainEntity={faqItems.map(item => ({
          questionName: item.question,
          acceptedAnswerText: item.answer
        }))}
      />
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          {/* 1. Your logo structured data */}
          <LogoJsonLd
            url="https://portaljs.com"
            logo="https://portaljs.com/icon.png"
          />
          {/* 2. Base SEO tags */}
          <NextSeo
            title="Turn Microsoft Purview into a Business-Friendly Data Catalog"
            description="Transform Microsoft Purview's technical interface into intuitive data catalogs for business users. Create multiple user-specific portals from a single Microsoft Purview instance."
            canonical="https://portaljs.com/purview"
            openGraph={{
              url: 'https://portaljs.com/purview',
              title: 'Turn Microsoft Purview into a Business-Friendly Data Catalog',
              description: 'Transform Microsoft Purview\'s technical interface into intuitive data catalogs for business users. Create multiple user-specific portals from a single Microsoft Purview instance.',
              site_name: 'PortalJS',
            }}
          />
          {/* 3. WebPage schema */}
          <WebPageJsonLd
            id="https://portaljs.com/purview#webpage"
            url="https://portaljs.com/purview"
            title="Turn Microsoft Purview into a Business-Friendly Data Catalog"
            description="Transform Microsoft Purview's technical interface into intuitive data catalogs for business users. Create multiple user-specific portals from a single Microsoft Purview instance."
          />
          {/* 4. Breadcrumb schema */}
          <BreadcrumbJsonLd
            itemListElements={[
              {
                position: 1,
                name: 'Home',
                item: 'https://portaljs.com',
              },
              {
                position: 2,
                name: 'Microsoft Purview',
                item: 'https://portaljs.com/purview',
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
            Microsoft Purview helps you organize metadata. But for many teams, its interface becomes a barrier — not a bridge. PortalJS unlocks Microsoft Purview's full value by letting you build tailored, branded portals for different user groups. You get clean layouts, intuitive navigation, and embedded context — all without modifying the backend.
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
      <Schedule calendar="https://calendar.app.google/iQkon85iKURfdBtX7" />
    </Layout>
  )
}
