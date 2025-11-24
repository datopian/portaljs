import Hero from '@/components/home/Hero'
import SocialProof from '@/components/home/SocialProof'
import Schedule from '@/components/home/Schedule'
import Layout from '@/components/Layout'
import { KeyFeatures } from '@/components/home/KeyFeatures'
import { ShowcaseHighlight } from '@/components/home/ShowcaseHighlight'
import FAQ from '@/components/home/FAQ'
import { HomePageStructuredData } from '@/components/schema/HomePageStructuredData'

export default function Homepage() {
  return (
    <Layout isHomePage={true}>
      <HomePageStructuredData />
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12 w-full">
          <Hero />
        </div>
      </div>
      <SocialProof />
      <KeyFeatures />
      <ShowcaseHighlight />
      <Schedule />
      <div className="flex justify-center w-full">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12 w-full">
          <FAQ />
        </div>
      </div>
    </Layout>
  )
}
