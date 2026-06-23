import Hero from '@/components/home/Hero'
import SocialProof from '@/components/home/SocialProof'
import { Solutions } from '@/components/home/Solutions'
import Schedule from '@/components/home/Schedule'
import Layout from '@/components/Layout'
import FeatureOverview from '@/components/home/FeatureOverview'
import { KeyFeatures } from '@/components/home/KeyFeatures'
import LaunchPortal from '@/components/home/LaunchPortal'
import { PortalPreview } from '@/components/home/PortalPreview'
import NoVendorLockIn from '@/components/home/NoVendorLockIn'
import { Testimonials } from '@/components/home/Testimonials'
import { TargetAudiences } from '@/components/home/TargetAudiences'
import { WhatYouGet } from '@/components/home/WhatYouGet'
import { Security } from '@/components/home/Security'
import FAQ from '@/components/home/FAQ'
import Community from '@/components/home/community'
import UserJourney from '@/components/home/UserJourney'
import Head from 'next/head'
import { generateNextSeo } from 'next-seo/pages'
import { BreadcrumbJsonLd, OrganizationJsonLd } from 'next-seo'

export default function OpenDataSolutionsPage() {
  return (
    <Layout isHomePage={true}>
      <Head>
        {generateNextSeo({
          title: "Open Data Portal Solutions | PortalJS Cloud for Governments & Nonprofits",
          description: "PortalJS Cloud is the managed open data portal solution for governments, nonprofits, and research institutions. Launch in minutes, zero infrastructure overhead.",
          canonical: "https://www.portaljs.com/solutions/open-data",
          openGraph: {
            url: 'https://www.portaljs.com/solutions/open-data',
            title: 'Open Data Portal Solutions | PortalJS Cloud for Governments & Nonprofits',
            description: 'PortalJS Cloud is the managed open data portal solution for governments, nonprofits, and research institutions. Launch in minutes, zero infrastructure overhead.',
            site_name: 'PortalJS',
            type: 'website',
            images: [
              {
                url: 'https://www.portaljs.com/static/img/seo.webp',
                alt: 'PortalJS Cloud — Open Data Solutions',
                width: 1280,
                height: 720,
                type: 'image/webp',
              },
            ],
          },
          twitter: {
            cardType: 'summary_large_image',
            site: '@PortalJS_',
          },
        })}
      </Head>
      <OrganizationJsonLd
        url="https://www.portaljs.com"
        logo="https://www.portaljs.com/icon.png"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: 'https://www.portaljs.com' },
          { name: 'Solutions', item: 'https://www.portaljs.com/solutions' },
          { name: 'Open Data', item: 'https://www.portaljs.com/solutions/open-data' },
        ]}
      />
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          <Hero />
          <SocialProof />
          <KeyFeatures />
          <LaunchPortal />
        </div>
      </div>
      <UserJourney />
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          <Solutions />
          <PortalPreview />
        </div>
      </div>
      <FeatureOverview />
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          <NoVendorLockIn />
          <TargetAudiences />
          <Community homePage />
          <Testimonials />
          <WhatYouGet />
          <Security />
        </div>
      </div>
      <Schedule />
      <div className="flex justify-center w-full">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12 w-full">
          <FAQ />
        </div>
      </div>
    </Layout>
  )
}
