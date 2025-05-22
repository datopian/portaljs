import ButtonLink from '../ButtonLink'
import { H2 } from '../custom/header'
import PricingPlans from '../PricingPlans'

export default function Pricing() {
  return (
    <div className="flow-root pt-16 pb-20 px-4 sm:px-6 lg:pb-28 lg:px-8">
      <div className="mx-auto max-w-8xl px-6 lg:px-8">
        <div className="text-center">
          <H2 className="mx-auto">Pricing</H2>
          <p className="mt-3 max-w-2xl mx-auto text-lg opacity-75 sm:mt-4">
            Flexible plans that suit your needs and budget
          </p>
        </div>
        <PricingPlans />
        <div className="flex justify-center mt-20 max-w-lg mx-auto">
          <div className="sm:mt-4 md:mt-6 mt-0">
            <ButtonLink style="secondary" href="/pricing">
              Learn more
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  )
}
