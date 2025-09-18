import { Player } from '@lottiefiles/react-lottie-player'
import { H2 } from '../custom/header'
import { useTheme } from 'next-themes'

export const KeyFeatures = () => {
  const { theme } = useTheme()
  const features = [
    {
      title: 'Unified sites',
      description:
        'Present data and content in one seamless site, pulling datasets from a DMS (eg, CKAN or OpenMetadata) and content from a CMS (eg, WordPress or other).',
      icon: `/static/icons/${theme}/network.json`,
      style: 'dark:-rotate-[4deg]',
    },
    {
      title: 'Developer friendly',
      description:
        'Built with familiar frontend tech (Next.js and Tailwind CSS) with great local dev tooling.',
      icon: `/static/icons/${theme}/html.json`,
      style: 'dark:-rotate-[3deg]',
    },
    {
      title: 'Batteries included',
      description:
        'Ready-made portal components out of the box: catalog search, dataset pages, previews (tables, charts, maps), blogs, and more.',
      icon: `/static/icons/${theme}/layers.json`,
      style: 'dark:-rotate-[2deg]',
    },
    {
      title: 'Easy to theme & customize',
      description:
        'Installable themes, standard CSS/React tooling, quick route creation, and support for custom branding.',
      icon: `/static/icons/${theme}/paint-roller.json`,
      style: 'dark:-rotate-[4deg]',
    },
    {
      title: 'Extensible',
      description:
        'Extend with your own components, or import from the wider ecosystem.',
      icon: `/static/icons/${theme}/expand.json`,
      style: 'dark:-rotate-[3deg]',
    },
    {
      title: 'Enterprise ready',
      description:
        'Optional modules for authentication/SSO, role-based access control, data quality, and API management.',
      icon: `/static/icons/${theme}/padlock.json`,
      style: 'dark:-rotate-[2deg]',
    },
  ]

  return (
    <div className="py-24">
      <div className="">
        <H2 className="text-center">Features</H2>
        <div className="mt-16 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-3 lg:gap-x-6">
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
                <p className="mt-4 text-base ">
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
