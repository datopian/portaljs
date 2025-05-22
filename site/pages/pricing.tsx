import Layout from '@/components/Layout'
import PricingPlans from '@/components/PricingPlans'
import AddOns from '@/components/AddOns'
import { NextSeo } from 'next-seo'
import { H1, H3 } from '@/components/custom/header'
import { H2 } from '@/components/custom/header'

export default function Pricing() {
  return (
    <Layout>
      <NextSeo
        title="Pricing"
        description="Find the best plan for you, our plans cover all ranges of budgets and needs. Leverage your Open Data Portal with optional add-ons."
      />
      <div className="overflow-hidden">
        <div className="">
          <div className="mx-auto ">
            <div className="relative z-10">
              <H1 className="text-center">Find the best plan for you</H1>
              <H2 sub={true} className="mx-auto my-4 text-center">
                Our plans cover all ranges of budgets and needs
              </H2>
            </div>
            <PricingPlans />
          </div>
        </div>
        <div className="relative" id="addons">
          <div className="mx-auto max-w-8xl mt-32 ">
            {/* Add-ons */}
            <div className="relative z-10">
              <H2 className="text-center">Add-ons</H2>
              <H3 sub={true} className="mx-auto mt-4 mb-8 text-center max-w-4xl">
              Extend your data portal with features designed to make your work easier. Each add-on helps you manage, publish, or present your data more efficiently.
              </H3>
            </div>
            <AddOns />
          </div>
        </div>
      </div>
    </Layout>
  )
}
