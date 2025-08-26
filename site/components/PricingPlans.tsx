import { CheckIcon } from '@heroicons/react/24/outline'
import { RadioGroup } from '@headlessui/react'
import { useRef, useState, useEffect } from 'react'
import AddonModal, { AddonModalHandle } from './AddonModal'
import ButtonLink from './ButtonLink'
import { FaInfoCircle } from 'react-icons/fa'
import { useRouter } from 'next/router'

export const frequencies = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annually', label: 'Annually' },
]

export const tiers = [
  {
    title: 'Open Source',
    subTitle: 'Build it your way',
    toolTip: 'A free, self-hosted solution',
    id: 'tier-open-source',
    href: 'https://portaljs.org/docs',
    cta: 'Get started',
    featured: false,
    description:
      'Access source code and get started in your local machine or deploy to your cloud.',
    price: { monthly: 'Free', annually: 'Free' },
    mainFeatures: [
      { title: 'Self-hosted' },
      { title: 'Self-managed' },
      { title: 'Community support via chat' },
    ],
    currency: true,
  },
  {
    title: 'Foundation',
    subTitle: 'Effortless and reliable',
    toolTip: 'Fully managed designed for small organizations and NGOs',
    id: 'tier-essentials',
    href: 'https://cloud.portaljs.com/auth/signup',
    cta: 'Start for free',
    featured: false,
    description: 'Start your open data journey today.',
    price: {
      monthly: '$119',
      annually: '$99',
      savings: '$2388',
      annualPrice: 99,
    },
    mainFeatures: [
      { title: 'Fully managed and hosted' },
      { title: 'Unlimited datasets' },
      { title: 'Multiple users with role based access control' },
      { title: 'Unlimited groups and organizations' },
      { title: 'Custom domain' },
      {
        title: 'Basic branding included (logo, font, colour scheme) ',
        addons: {
          type: 'list',
          items: [
            {
              text: 'Basic branding includes your logo, font, colours, home page content.',
            },
            {
              text: 'You can purchase more frontend development work if you have more advanced requirements. Please, contact us to get a quote.',
            },
          ],
        },
      },
      {
        title: '10 GB of blob storage',
        addons: {
          type: 'table',
          items: [
            { key: 'Next 100 GB', value: '$99 / mo' },
            {
              key: 'Configure your own S3 API compatible bucket',
              value: '$99 / mo',
            },
          ],
        },
      },
      { title: 'Dublin Core metadata standard' },
      { title: 'DCAT metadata standard' },
      {
        title: 'Data previews (CSV, Excel, PDF, JSON, TXT)',
        addons: {
          type: 'table',
          items: [
            { key: 'XML, Web, Image', value: '$49 / mo' },
            { key: 'Power BI', value: '$99 / mo' },
            { key: 'Get a quote for any custom format', value: 'Contact us' },
          ],
        },
      },
      {
        title: 'Geospatial data views (GeoJSON)',
        addons: {
          type: 'table',
          items: [
            { key: 'KML', value: '$49 / mo' },
            { key: 'Shape', value: '$49 / mo' },
            { key: 'Google Earth Engine support', value: '$99 / mo' },
            { key: 'CartoDB', value: '$99 / mo' },
            { key: 'ArcGIS', value: '$99 / mo' },
            { key: 'Postgresql/Postgis', value: '$99 / mo' },
            {
              key: 'Blob storage (Geospatial CSV or similar in S3)',
              value: '$99 / mo',
            },
          ],
        },
      },

      { title: 'Technical support (48 hours response time)' },
      { title: 'Explore more add-ons', href: '/pricing#addons' },
    ],
    currency: true,
  },
  {
    title: 'Institution',
    subTitle: 'Scalable and collaborative',
    toolTip:
      ' Designed for universities and public institutions, and mid-sized organizations',
    id: 'tier-professional',
    href: 'https://cloud.portaljs.com/auth/signup',
    cta: 'Start for free',
    featured: true,
    description: 'Ideal for professionals with advanced needs.',
    price: {
      monthly: '$359',
      annually: '$299',
      savings: '$4308',
      annualPrice: 299,
    },
    mainFeatures: [
      { title: 'Everything from Foundation plan' },
      {
        title: 'Advanced branding (custom design)',
      },
      {
        title: '50 GB of blob storage',
        addons: {
          type: 'table',
          items: [
            { key: 'Next 100 GB', value: '$149 / mo' },
            { key: 'Custom S3 API bucket', value: '$149 / mo' },
          ],
        },
      },
      { title: 'Complex data processing pipelines with expert team support (coming soon)' },
      { title: 'Harvesting features: automatic data collection from multiple sources (coming soon)' },
      { title: 'Model Context Protocol (MCP) server for your data portal (coming soon)' },
      { title: 'AI-powered visualisation tools for publishers (coming soon)' },
      { title: 'Self-service tool for charts and maps creation for end users (coming soon)' },
      { title: 'Data curator support (business hours)' },
      { title: 'Priority technical support (24-hour response time)' },
      { title: 'Explore more add-ons', href: '/pricing#addons' },
    ],
    currency: true,
  },

  {
    title: 'Enterprise',
    subTitle: 'Tailored for impact',
    toolTip:
      ' Custom solutions for governments and enterprises with complex requirements',
    id: 'tier-enterprise',
    href: 'https://calendar.app.google/sn2PU7ZvzjCPo1ok6',
    cta: "Let's talk",
    featured: false,
    description: 'Ideal for larger organizations to meet their requirements.',
    price: { monthly: 'Contact us', annually: 'Contact us' },
    mainFeatures: [
      { title: 'Everything from Institution plan' },
      { title: 'Dedicated instance' },
      { title: 'Bespoke development' },
      { title: 'Public and/or private data' },
      {
        title:
          'Fully managed and hosted based on your requirements (public/private/hybrid cloud or on-prem)',
      },
      { title: 'Advanced security' },
      { title: 'SAML/OAuth, Azure Active Directory integration or similar' },
      { title: 'Service level agreements (SLA)' },
      { title: 'Dedicated account manager and support team' },
    ],
    currency: false,
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
export default function PricingPlans() {
  const [frequency, setFrequency] = useState(frequencies[1])
  const [showAnnualMessage, setShowAnnualMessage] = useState(false)
  const addonModalRef = useRef<AddonModalHandle>()

  useEffect(() => {
    if (frequency.value === 'annually') {
      setShowAnnualMessage(true)
    } else {
      setShowAnnualMessage(false)
    }
  }, [frequency])

  const router = useRouter()
  const { buy } = router.query

  return (
    <>
      <div className="mt-8 flex justify-center">
        <RadioGroup
          value={frequency}
          onChange={setFrequency}
          className="grid grid-cols-2 gap-x-1 rounded-full bg-white/5 p-1 text-center text-xs font-semibold leading-5"
        >
          <RadioGroup.Label className="sr-only">
            Payment frequency
          </RadioGroup.Label>
          {frequencies.map((option) => (
            <RadioGroup.Option
              key={option.value}
              value={option}
              className={({ checked }) =>
                classNames(
                  checked ? 'bg-secondary text-black' : '',
                  'cursor-pointer rounded-full px-2.5 py-1 text-sm'
                )
              }
            >
              <span>{option.label}</span>
            </RadioGroup.Option>
          ))}
        </RadioGroup>
      </div>
      {frequency.value === 'annually' && (
        <p className="opacity-75 text-sm mt-2 text-center italic">
          Save 16% when you choose annual billing - get 2 months free
        </p>
      )}

      <main className=" relative mx-auto mt-10 grid max-w-md grid-cols-1 gap-y-8  lg:-mb-14 lg:max-w-none lg:grid-cols-2 custom:grid-cols-4 gap-3 px-1 dark:px-0 ">
        <div
          className="hidden lg:absolute lg:inset-x-px lg:bottom-0 lg:top-4 lg:block lg:rounded-2xl "
          aria-hidden="true"
        />
        {tiers.map((tier, index) => (
          <div
            key={tier.id}
            className={classNames(
              tier.featured
                ? ' bg-slate-200 dark:bg-slate-900 shadow-2xl ring-1 ring-gray-900/10 py-5'
                : ' dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 dark:hover:bg-slate-800 hover:bg-slate-100 my-5 lg:bg-transparent lg:pb-14 shadow-lg',
              'relative rounded-2xl bg-slate-100 '
            )}
          >
            {tier.featured ? (
              <span className="bg-blue-400 dark:bg-blue-800 px-4 py-1 font-semibold rounded-full text-sm text-center absolute top-4 right-4">
                MOST POPULAR
              </span>
            ) : (
              ''
            )}
            <div className={`p-8 lg:pt-12 xl:p-8 xl:pt-14`}>
              <h3
                id={tier.id}
                className={classNames(
                  tier.featured ? '' : '',
                  'text-xl font-bold leading-6'
                )}
              >
                {tier.title}
              </h3>

              <h4 className="sm:-mt-4">
                <div className="relative inline-flex items-center space-x-2 sm:h-[56px]">
                  <span className="opacity-75 xl:whitespace-nowrap">
                    {tier.subTitle}
                  </span>
                  <div className="relative group">
                    <FaInfoCircle className="text-gray-500 hover:text-blue-500 transition-colors duration-300 cursor-pointer" />
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-10 hidden group-hover:flex flex-col items-center bg-gray-800 text-white text-sm rounded-md py-2 px-4 shadow-lg w-[150px] whitespace-normal opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out sm:w-[200px]">
                      {tier.toolTip}
                      <div className="absolute -top-1 w-3 h-3 bg-gray-800 rotate-45 transform"></div>
                    </div>
                  </div>
                </div>
              </h4>

              <div className="flex flex-col gap-4 sm:flex-col  sm:justify-between lg:flex-col lg:items-stretch">
                <div className=" flex items-center gap-x-4 min-h-[70px] sm:-mt-2">
                  <p
                    className={classNames(
                      tier.featured ? '' : '',
                      'text-2xl xl:text-xl semi-bold tracking-tight'
                    )}
                  >
                    <span
                      className={`${
                        index !== 3 ? 'text-4xl' : 'text-4xl'
                      } font-bold tracking-tight`}
                    >
                      {tier.price[frequency.value]}
                    </span>
                  </p>
                  {tier.currency ? (
                    <div className="text-sm leading-5 flex-auto">
                      <div className="pt-4 -mt-4">
                        <div className={'opacity-75'}>
                          {index !== 0 && 'USD'}
                          <br />
                          {index !== 0 && (
                            <span className="opacity-75">monthly</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    ''
                  )}
                </div>
                <h4 className="md:h-[30px] text-sm sm:-mt-6 -mt-8 mb-0">
                  {index === 0 ? (
                    <span className="py-1 opacity-75">Forever Free</span>
                  ) : index === 3 ? (
                    <span
                      className="py-1 opacity-75 custom:mt-0 sm:mt-4
                     "
                    >
                      Custom pricing available
                    </span>
                  ) : (
                    ''
                  )}

                  {frequency.value === 'annually' && tier.price.savings && (
                    <div className="flex sm:flex-row flex-col md:mt-0 mt-2">
                      <span className="py-[1px] opacity-75 text-sm">
                        $
                        {new Intl.NumberFormat().format(
                          tier.price.annualPrice * 12
                        )}{' '}
                        billed annually
                      </span>
                      <span className="opacity-75 text-sm py-[1px]">
                        <span className="inline custom:hidden sm:pl-1 pl-0">
                          (2 months free!)
                        </span>
                        <span className=" hidden custom:inline pl-1">
                          (2 months free!)
                        </span>
                      </span>
                    </div>
                  )}

                  {frequency.value === 'monthly' && tier.price.savings && (
                    <>
                      <span className="py-1 text-slate-400">
                        {index === 3 && 'Tailored for Your Needs'}
                      </span>
                      <span className="py-1 text-slate-400">
                        {index === 2 && '$299/month if paid annually'}
                      </span>
                      <span className="py-1 text-slate-400">
                        {index === 1 && '$99/month if paid annually'}
                      </span>
                    </>
                  )}
                </h4>
                <ButtonLink
                  href={
                    buy && index === 1 && frequency.value === 'monthly'
                      ? 'https://buy.stripe.com/aEUdRufwPces0Qo5ku'
                      : buy && index === 1 && frequency.value === 'annually'
                      ? 'https://buy.stripe.com/cN2fZC1FZ1zO2Yw28j'
                      : buy && index === 2 && frequency.value === 'monthly'
                      ? 'https://buy.stripe.com/7sIeVybgz7Yc2YwcMY'
                      : buy && index === 2 && frequency.value === 'annually'
                      ? 'https://buy.stripe.com/8wM28M4Sbbaocz64gt'
                      : tier.href
                  }
                  aria-describedby={tier.id}
                  title={`${tier.title} - ${tier.cta}`}
                  style={tier.featured ? 'primary' : 'secondary'}
                  trackConversion={tier.href === 'https://cloud.portaljs.com/auth/signup'}
                >
                  {index !== 0 && index !== 3 && buy ? 'Buy now' : tier.cta}
                </ButtonLink>
              </div>
              {index !== 0 && index !== 3 && (
                <p className="text-xs mt-5 -mb-3 sm:-mb-5 lg:-mb-11 text-center bg-blue-200 dark:bg-blue-700 rounded-full py-1 ">
                  14-day trial, no credit card required
                </p>
              )}
              <div className="mt-8 flow-root sm:mt-14">
                <ul
                  role="list"
                  className={classNames(
                    tier.featured
                      ? 'divide-gray-900/5 border-gray-900/5'
                      : 'divide-white/5 border-white/5 ',
                    '-my-2 divide-y border-t text-sm leading-6 lg:border-t-0'
                  )}
                >
                  {tier.mainFeatures.map((mainFeature) => (
                    <li key={mainFeature.title} className="flex gap-x-3 py-2">
                      <CheckIcon
                        className={classNames(
                          tier.featured ? 'text-secondary' : '',
                          'text-secondary h-6 w-5 flex-none'
                        )}
                        aria-hidden="true"
                      />
                      <span>
                        {mainFeature.href && (
                          <a
                            className="underline"
                            href={mainFeature.href}
                            title={mainFeature.title}
                          >
                            {mainFeature.title}
                          </a>
                        )}
                        {!mainFeature.href && mainFeature.title}{' '}
                        {mainFeature.addons && (
                          <button
                            className="underline"
                            type="button"
                            onClick={() =>
                              addonModalRef?.current?.open({
                                title: mainFeature.title,
                                // @ts-ignore
                                addons: mainFeature.addons,
                              })
                            }
                          >
                            (Add-ons available)
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <AddonModal ref={addonModalRef} />
              </div>
            </div>
          </div>
        ))}
      </main>
    </>
  )
}
