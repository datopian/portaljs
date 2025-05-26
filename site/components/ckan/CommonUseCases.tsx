import { Player } from '@lottiefiles/react-lottie-player'
import { H2, H3 } from '../custom/header'
import { useTheme } from 'next-themes'

export const CommonUseCases = () => {
  const { theme } = useTheme()
  const features = [
    {
      title: 'Government Open Data Portals',
      description:
        'Deliver cost-effective, standards-compliant open data sites. Publish datasets, maps, and reports easily, while ensuring interoperability through DCAT, Dublin Core, and other open-data schemas.',
      icon: `/static/icons/${theme}/data-portal.json`,
      style: 'dark:-rotate-[4deg]',
    },
    {
      title: 'Research Data Repositories',
      description:
        'Designed for academic and scientific domains. Supports DOI minting, adherence to FAIR principles (Findable, Accessible, Interoperable, Reusable), integrated metadata indexing, and interactive data previews.',
      icon: `/static/icons/${theme}/data-catalog.json`,
      style: 'dark:-rotate-[4deg]',
    },
    {
      title: 'Enterprise DataHubs',
      description:
        'Built for internal and partner data sharing with full deployment flexibility – host on-premises or in any cloud. Maintain complete IP ownership and enforce enterprise-grade security, access control, and audit trails.',
      icon: `/static/icons/${theme}/analytical-skill.json`,
      style: 'dark:-rotate-[4deg]',
    },
  ]

  return (
    <div className="py-24">
      <div className="">
        <H2 className="text-center mb-4">Common Use Cases</H2>
        <H3 className="text-center opacity-75">
          Tailored solutions built with CKAN & PortalJS to meet diverse data publishing needs.
        </H3>
        <div className="mt-16 grid grid-cols-1 gap-y-12 sm:gap-x-12 lg:grid-cols-3 lg:gap-x-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative flex flex-col rounded-xl dark:bg-slate-900 dark:hover:bg-slate-800 hover:bg-slate-100 transition-all duration-300 ring-1 ring-slate-200 dark:ring-slate-800 p-7 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="flex-shrink-0 w-full flex items-start -ml-2">
                <Player
                  autoplay
                  loop
                  src={feature.icon}
                  className={`w-14 h-14 ${feature.style}`}
                />
              </div>
              <div className="pt-4">
                <h3 className="text-lg font-medium ">{feature.title}</h3>
                <p className="mt-4 text-base text-gray-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
