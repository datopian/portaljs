import Layout from '@/components/Layout'
import Showcases from '@/components/Showcases'
import { NextSeo } from 'next-seo'
import { DataPortalsStructuredData } from '@/components/schema/DataPortalStructuredData'

export default function DataPortalsPage() {
  return (
    <Layout>
      <NextSeo
        title="Data Portals Showcase | PortalJS"
        description="Explore live data portals built with PortalJS. Government, research, and enterprise data portals showcasing real-world implementations."
        canonical="https://portaljs.org/data-portals"
      />
      <DataPortalsStructuredData />
      <Showcases />
    </Layout>
  )
}