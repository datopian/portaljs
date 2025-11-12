import { Player } from '@lottiefiles/react-lottie-player'
import { H2, H3 } from '../custom/header'
import { useTheme } from 'next-themes'

type KeyFeaturesProps = {
  productName: string
}

const createFeatures = (productName: string) => [
  {
    title: 'Business-Friendly Interfaces',
    description: `Create simplified interfaces that hide ${productName}'s technical complexity, making data assets accessible to non-technical users.`,
    icon: 'data-catalog',
    iconStyle: 'dark:-rotate-[4deg]',
    style: 'max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem] w-full',
    colSpan: 'lg:col-span-4',
  },
  {
    title: 'Multi-Portal Architecture',
    description: 'Build specialized portals for different departments—customize interfaces for data teams, marketing, finance, and executives.',
    icon: 'network',
    iconStyle: 'dark:-rotate-[2deg]',
    style: 'lg:rounded-tr-[2rem]',
    colSpan: 'lg:col-span-2',
  },
  {
    title: 'Complete UI Freedom',
    description: `Overcome ${productName}'s frontend customization limitations with unlimited design flexibility and branding options.`,
    icon: 'browser',
    iconStyle: 'dark:-rotate-[4deg]',
    style: '',
    colSpan: 'lg:col-span-2',
  },
  {
    title: 'Simplified Data Stories',
    description: 'Create guided narratives and context around technical metadata that business users can easily understand and act upon.',
    icon: 'document',
    iconStyle: 'dark:-rotate-[3deg]',
    style: '',
    colSpan: 'lg:col-span-4',
  },
  {
    title: 'Custom Workflows',
    description: 'Design role-specific workflows that simplify interactions with metadata for different stakeholders like data stewards or business analysts.',
    icon: 'flow-chart',
    iconStyle: 'dark:-rotate-[4deg]',
    style: '',
    colSpan: 'lg:col-span-2',
  },
  {
    title: 'Integration Hub',
    description: `Connect ${productName} with documentation, BI dashboards, and business glossaries in one unified experience.`,
    icon: 'data-lake',
    iconStyle: 'dark:-rotate-[2deg]',
    style: '',
    colSpan: 'lg:col-span-2',
  },
  {
    title: 'No-Code Implementation',
    description: `Deploy custom data catalog frontends without deep ${productName} technical expertise using pre-built components.`,
    icon: 'click',
    iconStyle: 'dark:-rotate-[4deg]',
    style: 'max-lg:rounded-b-[2rem] lg:rounded-br-[2rem] w-full',
    colSpan: 'lg:col-span-2',
  },
]

export const KeyFeatures = ({ productName }: KeyFeaturesProps) => {
  const { theme } = useTheme()
  const features = createFeatures(productName)

  return (
    <div className="py-24">
      <div className="mx-auto">
        <div className="flex flex-col items-center">
          <H2 className="mt-2 tracking-4 text-center">
            Key Features
          </H2>
          <H3 className="text-lg leading-8 opacity-75 text-center">
            Solve {productName}'s user experience challenges with PortalJS—transform technical interfaces into business-friendly data portals
          </H3>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          {features.map((feature) => (
            <div key={feature.title} className={`flex p-px ${feature.colSpan}`}>
              <div className={`overflow-hidden rounded-lg dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 dark:hover:bg-slate-800 hover:bg-slate-100 transition-all duration-300 shadow-lg ${feature.style}`}>
                <div className="flex flex-col items-start p-10">
                  <Player src={`/static/icons/${theme}/${feature.icon}.json`} autoplay loop className={`w-14 h-14 ${feature.iconStyle}`} />
                  <p className="mt-2 text-xl font-semibold tracking-tight dark:text-white">
                    {feature.title}
                  </p>
                  <p className="mt-2 ">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
