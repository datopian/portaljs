import Layout from '@/components/Layout'
import LearnCard from '@/components/LearnCard'
import {
  DocsIcon,
  HowTosIcon,
} from '@/components/Icons'
import { NextSeo } from 'next-seo'

const Resources = () => {
  return (
    <Layout>
      <NextSeo
        title="Docs"
        description="Discover tutorials and how-tos for taking the first steps into the application or solve specific challenges."
      />
      <div className="">
        <h1 className="sr-only">PortalsJS Cloud Documentation</h1>
        <main className="grid md:grid-cols-2 my-6">
          <div className="md:col-span-2"></div>
          <LearnCard
            icon={<DocsIcon className='-rotate-[4deg]' />}
            title="Tutorials"
            description="Learn by doing! Follow simple, step-by-step guides to get started fast."
            underline
            href="/docs/tutorials"
            className='rounded-tl-xl rounded-bl-xl'
          />
          <LearnCard
            icon={<HowTosIcon className='-rotate-[3deg]' />}
            title="How-tos"
            description="Quick solutions for common tasks—find exactly what you need, fast."
            underline
            href=""
            comingSoon
            className='rounded-tr-xl rounded-br-xl'
          />
        </main>
      </div>
    </Layout>
  )
}

export default Resources
