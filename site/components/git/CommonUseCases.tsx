import { Player } from '@lottiefiles/react-lottie-player'
import { H2, H3 } from '../custom/header'
import { useTheme } from 'next-themes'

export const CommonUseCases = () => {
  const { theme } = useTheme()
  const features = [
    {
      title: 'Open Government Data',
      description:
        'Publish government datasets with full transparency, version control, and community collaboration. Enable citizens to contribute corrections and improvements through Git workflows.',
      icon: `/static/icons/${theme}/data-portal.json`,
      style: 'dark:-rotate-[4deg]',
    },
    {
      title: 'Academic Research',
      description:
        'Create collaborative research data repositories where scholars can contribute datasets, peer review data quality, and maintain citation standards with Git-based workflows.',
      icon: `/static/icons/${theme}/data-catalog.json`,
      style: 'dark:-rotate-[4deg]',
    },
    {
      title: 'Data Journalism',
      description:
        'Share datasets used in articles with full provenance and methodology. Enable other journalists to build upon your work with complete transparency and version history.',
      icon: `/static/icons/${theme}/analytical-skill.json`,
      style: 'dark:-rotate-[4deg]',
    },
  ]

  return (
    <div className="py-24">
      <div className="">
        <H2 className="text-center mb-4">Common Use Cases</H2>
        <H3 className="text-center opacity-75">
          Tailored solutions built with Git & PortalJS to meet diverse collaborative data publishing needs.
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