import Hero from '@/components/ckan/Hero'
import SocialProof from '@/components/ckan/SocialProof'
import { KeyFeatures } from '@/components/ckan/KeyFeatures'
import Schedule from '@/components/home/Schedule'
import { LogoJsonLd, NextSeo } from 'next-seo'
import Layout from '@/components/Layout'
import { WhyCKANAndPortalJS } from '@/components/ckan/WhyCKANAndPortalJS'
import { CommonUseCases } from '@/components/ckan/CommonUseCases'

export default function CKAN() {
  return (
    <Layout>
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12">
          <LogoJsonLd
            url="https://portaljs.com"
            logo="https://portaljs.com/icon.png"
          />
          <NextSeo
            title="CKAN Data Management System Integration | Decoupled Open Data Frontend"
            description="Build a modern, headless UI for CKAN with PortalJS. Enjoy copy-&-paste components, server-side rendering for SEO, and full branding control."
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
