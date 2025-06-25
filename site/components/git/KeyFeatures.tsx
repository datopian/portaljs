import { Player } from '@lottiefiles/react-lottie-player'
import { H2, H3 } from '../custom/header'
import { useTheme } from 'next-themes'

const features = [
  {
    title: 'Integration with Multiple Git Platforms',
    description: 'Connect to GitHub, GitLab, Bitbucket, and self-hosted Git solutions. Choose your preferred platform.',
    icon: 'connection',
    iconStyle: 'dark:-rotate-[4deg]',
    style: 'max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem] w-full',
    colSpan: 'lg:col-span-4',
  },
  {
    title: 'Automatic Data Discovery',
    description: 'Automatically detects datasets in repositories based on configurable patterns and metadata files.',
    icon: 'api',
    iconStyle: 'dark:-rotate-[2deg]',
    style: 'lg:rounded-tr-[2rem]',
    colSpan: 'lg:col-span-2',
  },
  {
    title: 'Flexible Metadata Support',
    description: 'Support for YAML, JSON, and Markdown metadata. Compatible with Frictionless Data Package standards.',
    icon: 'browser',
    iconStyle: 'dark:-rotate-[4deg]',
    style: '',
    colSpan: 'lg:col-span-2',
  },
  {
    title: 'Version Control & Collaboration',
    description: 'Use pull requests for dataset review, issues for discussions, and Git history for complete change tracking.',
    icon: 'rocket',
    iconStyle: 'dark:-rotate-[3deg]',
    style: '',
    colSpan: 'lg:col-span-4',
  },
  {
    title: 'Access Control & Security',
    description: 'Leverage Git platform permissions. Support for both public and private repositories with authentication.',
    icon: 'server',
    iconStyle: 'dark:-rotate-[4deg]',
    style: '',
    colSpan: 'lg:col-span-2',
  },
  {
    title: 'Real-time Updates',
    description: 'Portal updates automatically when repositories change. Webhook support for instant synchronization.',
    icon: 'search2',
    iconStyle: 'dark:-rotate-[2deg]',
    style: 'max-lg:rounded-b-[2rem] lg:rounded-br-[2rem] w-full',
    colSpan: 'lg:col-span-2',
  },
]

export const KeyFeatures = () => {

  const { theme } = useTheme()
  return (
    <div className="py-24">
      <div className="mx-auto">
        <div className="flex flex-col items-center">
          <H2 className="mt-2 tracking-4 text-center">
            Key Features
          </H2>
          <H3 className="text-lg leading-8 opacity-75 text-center">
            Pre-built for Git & Open Data—static-first rendering and serverless scaling.
          </H3>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          {features.map((feature, index) => (
            <div key={index} className={`flex p-px ${feature.colSpan}`}>
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