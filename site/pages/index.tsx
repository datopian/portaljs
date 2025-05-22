import Hero from '@/components/home/Hero'
import SocialProof from '@/components/home/SocialProof'
import { Solutions } from '@/components/home/Solutions'
import Schedule from '@/components/home/Schedule'
import { LogoJsonLd, NextSeo } from 'next-seo'
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

export default function Homepage() {
  return (
    <Layout isHomePage={true}>
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          <LogoJsonLd
            url="https://portaljs.com"
            logo="https://portaljs.com/icon.png"
          />
          <NextSeo />
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
