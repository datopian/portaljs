import Hero from '@/components/ckan/Hero'
import SocialProof from '@/components/ckan/SocialProof'
import { KeyFeatures } from '@/components/ckan/KeyFeatures'
import Schedule from '@/components/home/Schedule'
import { OrganizationJsonLd, BreadcrumbJsonLd } from 'next-seo';
import { generateNextSeo } from 'next-seo/pages';
import Head from 'next/head';
import Layout from '@/components/Layout'
import { WhyCKANAndPortalJS } from '@/components/ckan/WhyCKANAndPortalJS'
import { CommonUseCases } from '@/components/ckan/CommonUseCases'

export default function CKAN() {
  return (
    <Layout isHomePage={true}>
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          {/* 1. Your logo structured data */}
          <OrganizationJsonLd
            url="https://portaljs.com"
            logo="https://portaljs.com/icon.png"
          />
          {/* 2. Base SEO tags */}
          <Head>
            {generateNextSeo({
              title: "CKAN Data Management System Integration | Decoupled Open Data Frontend",
              description: "Build a modern, headless UI for CKAN with PortalJS. Enjoy copy-&-paste components, server-side rendering for SEO, and full branding control.",
              canonical: "https://portaljs.com/ckan",
              openGraph: {
              url: 'https://portaljs.com/ckan',
              title: 'CKAN Data Management System Integration | Decoupled Open Data Frontend',
              description: 'Build a modern, headless UI for CKAN with PortalJS. Enjoy copy-&-paste components, server-side rendering for SEO, and full branding control.',
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
                name: 'CKAN',
                item: 'https://portaljs.com/ckan',
              },
            ]}
          />
          <Hero />
          <SocialProof />
          <WhyCKANAndPortalJS />
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
