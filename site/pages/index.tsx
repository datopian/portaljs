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
import { HomePageStructuredData } from '@/components/schema/HomePageStructuredData'

export const homeFaqQuestions = [
  {
    question: 'What is PortalJS Cloud?',
    answer:
      'PortalJS Cloud is a fully managed open data portal solution designed for governments, universities, and NGOs. Built on CKAN, it provides a modern, fast, and scalable frontend while eliminating the technical and financial burdens of maintaining an open data portal in-house. It takes the complexity out of hosting, maintaining, and customizing an open data platform so you can focus on sharing data, not managing infrastructure.',
  },
  {
    question: 'Who is PortalJS Cloud for?',
    answer: `PortalJS Cloud is designed for:
  - **Government agencies** that need a secure and scalable open data solution.
  - **Municipalities & cities** looking for an affordable and compliant data portal.
  - **Universities & research institutions** that require structured, easy-to-share datasets.
  - **NGOs & nonprofits** seeking an easy-to-use platform without IT overhead.`,
  },
  {
    question: 'How long does it take to set up a PortalJS Cloud instance?',
    answer: `Your data portal can be fully deployed in 5 minutes. No complex configurations, no waiting for IT approvals—just sign up, configure your portal, and start publishing data immediately. With our AI-assisted metadata generation, your datasets are automatically enriched with structured, compliant metadata, making them easier to discover, categorize, and use.

  Metadata is the foundation of any effective data portal, improving searchability, interoperability, and data quality.`,
  },
  {
    question: 'Do I need technical expertise to use PortalJS Cloud?',
    answer:
      'No. PortalJS Cloud is designed for non-technical users. Everything from hosting to security updates is managed for you, allowing you to focus on publishing and sharing data.',
  },
  {
    question:
      'Can I migrate from another data portal platform like Socrata, DKAN, or OpenDataSoft?',
    answer: `Many traditional platforms like Socrata and OpenDataSoft come with high costs, rigid structures, and limited customization. PortalJS Cloud gives you:

  - **No vendor lock-in** - You own your data, your way.
  - **Fully managed hosting** - No IT headaches, no server maintenance.
  - **AI-powered metadata generation** - Upload a dataset, and AI automatically fills in metadata, saving time and ensuring compliance.
  - **Seamless scalability** - Whether you're a small town or a national agency, PortalJS Cloud grows with you.
  - **Compliance with DCAT, Dublin Core, and WCAG 2.1 AA** - Your data stays structured and accessible.`,
  },
  {
    question: 'How does the AI Metadata Generation feature work?',
    answer:
      'When you upload a dataset, AI automatically generates metadata based on the file contents, ensuring compliance with open data standards while reducing manual effort.',
  },
  {
    question: 'Can I integrate PortalJS Cloud with other platforms?',
    answer: `Yes. PortalJS Cloud supports API access and can integrate with external applications, dashboards, and third-party data systems like ArcGIS, Tableau, and more.`,
  },
  {
    question: 'Does PortalJS Cloud support data visualizations?',
    answer:
      'Yes. Our custom dashboards feature allows users to create interactive charts, maps, and reports directly from their datasets—no coding required.',
  },
  {
    question: 'What happens if I need a custom feature?',
    answer:
      'We offer custom development services for organizations that need additional functionality beyond our standard features. If you need something specific, let\'s talk.',
  },
  {
    question: 'How do I get started with PortalJS Cloud?',
    answer: `You can get started in minutes with a free trial, or schedule a demo to see how PortalJS Cloud can fit your needs.
🔥   [Start Free Trial](https://portaljs.com/pricing) | [Schedule a Demo](https://calendar.app.google/sn2PU7ZvzjCPo1ok6)`,
  },
];

export default function Homepage() {
  return (
    <Layout isHomePage={true}>
      <HomePageStructuredData />
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
