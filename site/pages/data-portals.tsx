import Layout from '@/components/Layout'
import Showcases from '@/components/Showcases'
import { DataPortalsStructuredData } from '@/components/schema/DataPortalStructuredData'

export default function DataPortalsPage() {
  return (
    <Layout isHomePage={true}>
      <DataPortalsStructuredData />
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12 w-full">
          <Showcases />
        </div>
      </div>
    </Layout>
  )
}
