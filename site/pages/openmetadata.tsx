import Hero from '@/components/openmetadata/Hero'
import { KeyFeatures } from '@/components/openmetadata/KeyFeatures'
import Schedule from '@/components/home/Schedule'
import { LogoJsonLd, NextSeo, WebPageJsonLd, BreadcrumbJsonLd } from 'next-seo'
import Layout from '@/components/Layout'
import { CommonUseCases } from '@/components/openmetadata/CommonUseCases'

export default function OpenMetadata() {
  return (
    <Layout>
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          {/* 1. Your logo structured data */}
          <LogoJsonLd
            url="https://portaljs.com"
            logo="https://portaljs.com/icon.png"
          />
          {/* 2. Base SEO tags */}
          <NextSeo
            title="Make OpenMetadata User-Friendly | Business-Ready Data Catalog Frontend"
            description="Transform OpenMetadata's technical interface into intuitive data catalogs for business users. Create multiple user-specific portals from a single OpenMetadata instance."
            canonical="https://portaljs.com/openmetadata"
            openGraph={{
              url: 'https://portaljs.com/openmetadata',
              title: 'Make OpenMetadata User-Friendly | Business-Ready Data Catalog Frontend',
              description: 'Transform OpenMetadata\'s technical interface into intuitive data catalogs for business users. Create multiple user-specific portals from a single OpenMetadata instance.',
              site_name: 'PortalJS',
            }}
          />
          {/* 3. WebPage schema */}
          <WebPageJsonLd
            id="https://portaljs.com/openmetadata#webpage"
            url="https://portaljs.com/openmetadata"
            title="Make OpenMetadata User-Friendly | Business-Ready Data Catalog Frontend"
            description="Transform OpenMetadata's technical interface into intuitive data catalogs for business users. Create multiple user-specific portals from a single OpenMetadata instance."
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
                name: 'OpenMetadata',
                item: 'https://portaljs.com/openmetadata',
              },
            ]}
          />
          <Hero />
        </div>
      </div>
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          <KeyFeatures />
        </div>
      </div>
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          <CommonUseCases />
        </div>
      </div>
      <Schedule />
    </Layout>
  )
}