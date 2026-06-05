import Layout from '@/components/Layout'
import LandingHero from '@/components/home/LandingHero'
import AgentWorkflow from '@/components/home/AgentWorkflow'
import ValueProps from '@/components/home/ValueProps'
import Backends from '@/components/home/Backends'
import Showcase from '@/components/home/Showcase'
import Skills from '@/components/home/Skills'
import CtaBand from '@/components/home/CtaBand'
import SocialProof from '@/components/home/SocialProof'
import Community from '@/components/home/community'
import { HomePageStructuredData } from '@/components/schema/HomePageStructuredData'

export default function Homepage() {
  return (
    <Layout isHomePage={true}>
      <HomePageStructuredData />
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12 w-full">
          <LandingHero />
        </div>
      </div>
      <SocialProof />
      <AgentWorkflow />
      <ValueProps />
      <Backends />
      <Showcase />
      <Skills />
      <CtaBand />
      <div className="flex justify-center w-full">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12 w-full">
          <Community homePage={false} />
        </div>
      </div>
    </Layout>
  )
}
