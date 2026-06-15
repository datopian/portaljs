import Layout from '@/components/Layout'
import Showcases from '@/components/Showcases'
import { generateNextSeo } from 'next-seo/pages';
import Head from 'next/head';
import { DataPortalsStructuredData } from '@/components/schema/DataPortalStructuredData'

export default function DataPortalsPage() {
  return (
    <Layout isHomePage={true}>
      <Head>
        {generateNextSeo({
          title: "Data Portals Showcase | PortalJS",
          description: "Explore live data portals built with PortalJS. Government, research, and enterprise data portals showcasing real-world implementations.",
          canonical: "https://portaljs.org/data-portals",
        })}
      </Head>
      <DataPortalsStructuredData />
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12 w-full">
          <Showcases />
        </div>
      </div>
    </Layout>
  )
}