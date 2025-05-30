import { Player } from '@lottiefiles/react-lottie-player'
import { H2, H3 } from '../custom/header'
import { useTheme } from 'next-themes'

export const CommonUseCases = () => {
  const { theme } = useTheme()
  const features = [
    {
      title: 'Business-Friendly Data Catalogs',
      description:
        'Transform OpenMetadata\'s technical interface into intuitive experiences for non-technical users. Create simplified views of complex metadata that business teams can easily navigate and understand.',
      icon: `/static/icons/${theme}/data-portal.json`,
      style: 'dark:-rotate-[4deg]',
    },
    {
      title: 'Multi-Audience Portals',
      description:
        'Deploy separate interfaces for different user groups—detailed technical portals for data engineers, simplified asset browsers for analysts, and executive dashboards for leadership—all from a single OpenMetadata instance.',
      icon: `/static/icons/${theme}/diagram.json`,
      style: 'dark:-rotate-[4deg]',
    },
    {
      title: 'Custom Data Experiences',
      description:
        'Overcome OpenMetadata\'s UI customization limitations by building completely bespoke interfaces with your branding, terminology, and user flows while leveraging all the powerful metadata management capabilities in the background.',
      icon: `/static/icons/${theme}/seminar.json`,
      style: 'dark:-rotate-[4deg]',
    },
  ]

  return (
    <div className="py-24">
      <div className="">
        <H2 className="text-center mb-4">Common Use Cases</H2>
        <H3 className="text-center opacity-75">
          Still wondering how PortalJS would fit into your org? These are the most popular ways teams use it.
        </H3>
        <div className="mt-16 grid grid-cols-1 gap-y-12 sm:gap-x-12 lg:grid-cols-3 lg:gap-x-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative flex flex-col rounded-xl dark:bg-slate-900 dark:hover:bg-slate-800 hover:bg-slate-100 transition-all duration-300 ring-1 ring-slate-200 dark:ring-slate-800 p-7 shadow-lg overflow-hidden"
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
