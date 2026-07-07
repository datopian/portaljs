import { CheckIcon } from '@heroicons/react/24/outline'
import { RadioGroup } from '@headlessui/react'
import { useState, useEffect } from 'react'
import posthog from 'posthog-js'
import ButtonLink from './ButtonLink'
import { FaInfoCircle } from 'react-icons/fa'
import { useRouter } from 'next/router'

// GitHub VISION.md is the public roadmap — the removed not-yet-shipped bullets link here (po-xv5 §5).
const ROADMAP_URL = 'https://github.com/datopian/portaljs/blob/main/VISION.md'

// Never let analytics break the page.
function track(event: string, props?: Record<string, unknown>) {
  try {
    posthog.capture(event, props)
  } catch (_) {
    /* noop */
  }
}

export const frequencies = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annually', label: 'Annually' },
]

// kind drives price/CTA rendering — replaces the old index-based branching so a 5th
// column can be inserted without reshuffling magic numbers (po-xv5 §1).
//   free        → Open Source (no price)
//   paid        → Foundation / Institution (monthly+annual toggle, self-serve trial)
//   annual-only → Government (annual billing only; toggle disabled for this column)
//   contact     → Enterprise (sales-led)
export const tiers: any[] = [
  {
    title: 'Open Source',
    subTitle: 'Build it your way',
    toolTip: 'A free, self-hosted solution',
    id: 'tier-open-source',
    href: 'https://portaljs.com/docs',
    cta: 'Get started',
    kind: 'free',
    featured: false,
    description:
      'Access source code and get started in your local machine or deploy to your cloud.',
    price: { monthly: 'Free', annually: 'Free' },
    mainFeatures: [
      { title: 'Self-hosted and self-managed' },
      { title: 'MIT licensed, own every line' },
      { title: 'AI skills included (/new-portal, /add-dataset, /deploy)' },
      { title: 'Community support (Discord)' },
    ],
    footerNote:
      'Deploy static portals to PortalJS Arc with /portaljs-deploy — free tier included.',
  },
  {
    title: 'Foundation',
    subTitle: 'Effortless and reliable',
    toolTip: 'Fully managed, designed for small organizations and NGOs',
    id: 'tier-essentials',
    href: 'https://cloud.portaljs.com/auth/signup',
    cta: 'Start for free',
    kind: 'paid',
    featured: false,
    description: 'Start your open data journey today.',
    price: {
      monthly: '$119',
      annually: '$99',
      annualPrice: 99,
    },
    mainFeatures: [
      { title: 'Fully managed and hosted' },
      { title: 'Unlimited datasets' },
      { title: 'Multiple users with role based access control' },
      { title: 'Unlimited groups and organizations' },
      { title: 'PortalJS subdomain (yourname.portaljs.cloud)' },
      { title: 'Basic branding included (logo, font, colour scheme)' },
      { title: '10 GB of blob storage' },
      { title: 'Dublin Core metadata standard' },
      { title: 'DCAT metadata standard' },
      { title: 'Data previews (CSV, Excel, PDF, JSON, TXT)' },
      { title: 'Geospatial data views (GeoJSON)' },
      { title: 'Technical support (48 hours response time)' },
    ],
    footerLink: { text: 'Explore add-ons →', href: '/pricing#addons' },
  },
  {
    title: 'Institution',
    subTitle: 'Scalable and collaborative',
    toolTip:
      'Designed for universities, public institutions and mid-sized organizations',
    id: 'tier-professional',
    href: 'https://cloud.portaljs.com/auth/signup',
    cta: 'Start for free',
    kind: 'paid',
    featured: true,
    description: 'Ideal for professionals with advanced needs.',
    price: {
      monthly: '$359',
      annually: '$299',
      annualPrice: 299,
    },
    mainFeatures: [
      { title: 'Everything from Foundation plan' },
      { title: 'Custom domain' },
      { title: 'Advanced branding (custom design)' },
      { title: '50 GB of blob storage' },
      { title: 'Managed CKAN backend included' },
      { title: 'Searchable Data API included' },
      { title: 'Data curator support (business hours)' },
      { title: 'Priority technical support (24-hour response time)' },
    ],
    footerLink: { text: 'See what’s shipping next →', href: ROADMAP_URL },
  },
  {
    title: 'Government',
    subTitle: 'Compliance-ready',
    toolTip:
      'Built for the public sector: compliance, procurement and data-residency requirements',
    id: 'tier-government',
    href: 'https://calendar.app.google/sn2PU7ZvzjCPo1ok6',
    cta: 'Talk to us',
    kind: 'annual-only',
    featured: false,
    badge: 'Built for public sector',
    description: 'For government agencies and national programs.',
    price: {
      annually: '$1,499',
      annualPrice: 1499,
      // 2-months-free mechanic: $1,499/mo billed annually at $14,990/yr (po-xv5 §1.4).
      billedAnnually: 14990,
    },
    mainFeatures: [
      { title: 'Everything from Institution plan' },
      { title: 'Dedicated instance' },
      { title: 'SSO: SAML / OAuth / Azure AD' },
      {
        title:
          'Service level agreement (SLA) with uptime and response-time commitments',
      },
      { title: 'WCAG 2.1 AA accessibility conformance (statement provided)' },
      {
        title:
          'DCAT / DCAT-AP standards-compliant feeds for national-portal harvesting',
      },
      { title: 'EU / UK / US data-residency options' },
      { title: 'Priority support with named contact' },
      {
        title:
          'Procurement-friendly: PO/invoice billing, vendor forms, security questionnaires',
      },
    ],
    footerNote:
      'One-time onboarding from $4,900 — agent-assisted setup, branding, and data migration.',
  },
  {
    title: 'Enterprise',
    subTitle: 'Tailored for impact',
    toolTip:
      'Custom solutions for multi-portal and national programs with complex requirements',
    id: 'tier-enterprise',
    href: 'https://calendar.app.google/sn2PU7ZvzjCPo1ok6',
    cta: "Let's talk",
    kind: 'contact',
    featured: false,
    description: 'Ideal for larger organizations to meet their requirements.',
    price: { monthly: 'Contact us', annually: 'Contact us' },
    mainFeatures: [
      { title: 'Everything from Government plan' },
      { title: 'Multi-portal / national programs' },
      { title: 'Bespoke development' },
      {
        title:
          'Fully managed and hosted based on your requirements (public/private/hybrid cloud or on-prem)',
      },
      { title: 'FedRAMP-path conversations' },
      {
        title: 'Migration from Socrata, OpenDataSoft/Huwise, or ArcGIS Hub',
        href: '/case-studies',
      },
      { title: 'Dedicated account manager and support team' },
    ],
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

// Stripe self-serve buy links are keyed off ?buy= and the tier position — Foundation and
// Institution keep positions 1 and 2 in the array, so this mapping is unchanged (po-xv5 §1).
const stripeLinks: Record<string, Record<string, string>> = {
  Foundation: {
    monthly: 'https://buy.stripe.com/aEUdRufwPces0Qo5ku',
    annually: 'https://buy.stripe.com/cN2fZC1FZ1zO2Yw28j',
  },
  Institution: {
    monthly: 'https://buy.stripe.com/7sIeVybgz7Yc2YwcMY',
    annually: 'https://buy.stripe.com/8wM28M4Sbbaocz64gt',
  },
}

export default function PricingPlans() {
  const [frequency, setFrequency] = useState(frequencies[1])
  const [showAnnualMessage, setShowAnnualMessage] = useState(false)

  useEffect(() => {
    setShowAnnualMessage(frequency.value === 'annually')
  }, [frequency])

  const router = useRouter()
  const { buy } = router.query

  const onFrequencyChange = (option: (typeof frequencies)[number]) => {
    setFrequency(option)
    track('pricing_toggle_annual', { frequency: option.value })
  }

  return (
    <>
      <div className="mt-8 flex justify-center">
        <RadioGroup
          value={frequency}
          onChange={onFrequencyChange}
          className="grid grid-cols-2 gap-x-1 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800 p-1 text-center text-xs font-semibold leading-5"
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
                  checked
                    ? 'bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400',
                  'cursor-pointer rounded-full px-2.5 py-1 text-sm transition-all duration-150 flex items-center justify-center gap-2'
                )
              }
            >
              {({ checked }) => (
                <>
                  <span>{option.label}</span>
                  {option.value === 'annually' && (
                    <span
                      className={classNames(
                        checked
                          ? 'bg-white/25 text-white'
                          : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                        'text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none'
                      )}
                    >
                      -16%
                    </span>
                  )}
                </>
              )}
            </RadioGroup.Option>
          ))}
        </RadioGroup>
      </div>
      {showAnnualMessage && (
        <p className="opacity-75 text-sm mt-2 text-center italic">
          Save 16% when you choose annual billing - get 2 months free
        </p>
      )}

      <main className="relative mx-auto mt-10 grid max-w-md grid-cols-1 gap-y-8 lg:-mb-14 lg:max-w-none sm:grid-cols-2 lg:grid-cols-5 gap-3 px-1 dark:px-0">
        <div
          className="hidden lg:absolute lg:inset-x-px lg:bottom-0 lg:top-4 lg:block lg:rounded-2xl"
          aria-hidden="true"
        />
        {tiers.map((tier, index) => {
          const isFree = tier.kind === 'free'
          const isContact = tier.kind === 'contact'
          const isAnnualOnly = tier.kind === 'annual-only'
          const isPaid = tier.kind === 'paid'

          // Government ignores the toggle (annual only); everyone else follows it.
          const priceValue = isAnnualOnly
            ? tier.price.annually
            : tier.price[frequency.value]

          const stripe = stripeLinks[tier.title]
          const ctaHref =
            buy && stripe ? stripe[frequency.value] ?? tier.href : tier.href
          const ctaLabel = buy && stripe ? 'Buy now' : tier.cta

          return (
            <div
              key={tier.id}
              className={classNames(
                tier.featured
                  ? 'bg-white dark:bg-slate-900 ring-2 ring-blue-500/40 dark:ring-blue-500/30 py-5'
                  : 'bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 dark:hover:bg-slate-800 hover:bg-slate-50 my-5 lg:pb-14',
                'relative rounded-2xl flex flex-col'
              )}
            >
              {tier.featured && (
                <span className="bg-gradient-to-br from-sky-400 to-blue-600 text-white px-3.5 py-1 text-[11px] font-semibold tracking-wide rounded-full absolute top-4 right-4">
                  Most Popular
                </span>
              )}
              {tier.badge && (
                <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 text-[11px] font-semibold tracking-wide rounded-full absolute top-4 right-4">
                  {tier.badge}
                </span>
              )}
              <div className="p-5 pt-10 lg:pt-12 flex flex-col flex-1">
                <h3 id={tier.id} className="text-xl font-bold leading-6">
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

                <div className="flex flex-col gap-4 sm:justify-between lg:flex-col lg:items-stretch">
                  <div className="flex items-center gap-x-3 min-h-[70px] sm:-mt-2">
                    <p className="text-2xl xl:text-xl semi-bold tracking-tight">
                      <span className="text-3xl xl:text-4xl font-bold tracking-tight">
                        {priceValue}
                      </span>
                    </p>
                    {!isFree && !isContact && (
                      <div className="text-sm leading-5 flex-auto">
                        <div className="pt-4 -mt-4">
                          <div className="opacity-75">
                            USD
                            <br />
                            <span className="opacity-75">monthly</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <h4 className="md:h-[30px] text-sm sm:-mt-6 -mt-8 mb-0">
                    {isFree && (
                      <span className="py-1 opacity-75">Forever Free</span>
                    )}
                    {isContact && (
                      <span className="py-1 opacity-75 custom:mt-0 sm:mt-4">
                        Custom pricing available
                      </span>
                    )}

                    {isAnnualOnly && (
                      <div className="flex flex-col md:mt-0 mt-2">
                        <span className="py-[1px] opacity-75 text-sm">
                          $
                          {new Intl.NumberFormat('en-US').format(
                            tier.price.billedAnnually
                          )}{' '}
                          billed annually
                        </span>
                        <span className="opacity-75 text-sm py-[1px]">
                          Annual billing only (2 months free!)
                        </span>
                      </div>
                    )}

                    {isPaid &&
                      frequency.value === 'annually' &&
                      tier.price.annualPrice && (
                        <div className="flex sm:flex-row flex-col md:mt-0 mt-2">
                          <span className="py-[1px] opacity-75 text-sm">
                            $
                            {new Intl.NumberFormat('en-US').format(
                              tier.price.annualPrice * 12
                            )}{' '}
                            billed annually
                          </span>
                          <span className="opacity-75 text-sm py-[1px]">
                            <span className="sm:pl-1 pl-0">(2 months free!)</span>
                          </span>
                        </div>
                      )}

                    {isPaid &&
                      frequency.value === 'monthly' &&
                      tier.price.annualPrice && (
                        <span className="py-1 text-slate-400">
                          ${tier.price.annualPrice}/month if paid annually
                        </span>
                      )}
                  </h4>

                  <ButtonLink
                    href={ctaHref}
                    aria-describedby={tier.id}
                    title={`${tier.title} - ${tier.cta}`}
                    style={tier.featured ? 'primary' : 'secondary'}
                    trackConversion={
                      tier.href === 'https://cloud.portaljs.com/auth/signup'
                    }
                    onClick={() =>
                      track('pricing_tier_cta_click', { tier: tier.title })
                    }
                  >
                    {ctaLabel}
                  </ButtonLink>
                </div>

                {isPaid && (
                  <p className="text-xs mt-5 text-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full py-1">
                    14-day trial, no credit card required
                  </p>
                )}

                <div className="mt-8 flow-root sm:mt-10 flex flex-col flex-1">
                  <ul
                    role="list"
                    className="-my-2 divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 text-sm leading-6 lg:border-t-0"
                  >
                    {tier.mainFeatures.map((mainFeature) => (
                      <li key={mainFeature.title} className="flex gap-x-3 py-2">
                        <CheckIcon
                          className="text-blue-500 h-6 w-5 flex-none"
                          aria-hidden="true"
                        />
                        <span>
                          {mainFeature.href ? (
                            <a
                              className="underline"
                              href={mainFeature.href}
                              title={mainFeature.title}
                            >
                              {mainFeature.title}
                            </a>
                          ) : (
                            mainFeature.title
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {(tier.footerNote || tier.footerLink) && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      {tier.footerNote && (
                        <p className="text-xs opacity-75">{tier.footerNote}</p>
                      )}
                      {tier.footerLink && (
                        <a
                          href={tier.footerLink.href}
                          className="text-sm text-blue-600 dark:text-blue-400 underline"
                          {...(tier.footerLink.href.startsWith('http')
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {})}
                        >
                          {tier.footerLink.text}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </main>
    </>
  )
}
