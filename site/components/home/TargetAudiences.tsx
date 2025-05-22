import { Player } from '@lottiefiles/react-lottie-player'
import { H2, H3 } from '../custom/header'
import { useTheme } from 'next-themes'

export const TargetAudiences = () => {
  const { theme } = useTheme()
  const features = [
    {
      title: 'Government Agencies',
      description:
        'Publish open data to increase transparency and citizen engagement. Meet compliance requirements with ease.',
      icon: `/static/icons/${theme}/presentation-2.json`,
      style: 'dark:-rotate-[4deg]',
    },
    {
      title: 'Academic Institutions',
      description:
        'Share research data securely and make it discoverable. Collaborate with other researchers worldwide.',
      icon: `/static/icons/${theme}/presentation-4.json`,
      style: 'dark:-rotate-[3deg]',
    },
    {
      title: 'Non-Profit Organizations',
      description:
        'Increase impact by sharing program data and results. Build trust with stakeholders through transparency.',
      icon: `/static/icons/${theme}/international.json`,
      style: 'dark:-rotate-[2deg]',
    },
    {
      title: 'Businesses',
      description:
        'Share data with partners and customers securely. Create new value through data sharing initiatives.',
      icon: `/static/icons/${theme}/humanitarian.json`,
      style: 'dark:-rotate-[4deg]',
    },
  ]

  return (
    <div className="py-24">
      <div className="">
        <H2 className="text-center mb-4">Who Is PortalJS Cloud For?</H2>
        <H3 className="opacity-75 text-center ">
          PortalJS Cloud is designed for any organization that needs to publish
          and share data securely and efficiently.
        </H3>
        <div className="mt-16 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-4 lg:gap-x-6">
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
