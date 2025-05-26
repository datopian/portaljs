import { Player } from '@lottiefiles/react-lottie-player'
import { H2, H3 } from '../custom/header'
import { useTheme } from 'next-themes'

export const WhyCKANAndPortalJS = () => {
  const { theme } = useTheme()
  const features = [
    {
      title: 'Modular architecture',
      description:
        'Decouples frontend from backend logic, enabling faster innovation without touching CKAN’s core.',
      icon: `/static/icons/${theme}/puzzle.json`,
      style: 'dark:-rotate-[4deg]',
    },
    {
      title: 'Rapid Development',
      description:
        'Offers copy-and-paste code snippets, so you can assemble pages and widgets in minutes.',
      icon: `/static/icons/${theme}/api.json`,
      style: 'dark:-rotate-[3deg]',
    },
    {
      title: 'Custom Branding',
      description:
        'Supports your branding with easy theming and custom components to match any style guide.',
      icon: `/static/icons/${theme}/data-catalog.json`,
      style: 'dark:-rotate-[2deg]',
    },
    {
      title: 'Optimized Performance',
      description:
        'Delivers performance out of the box with SSR-friendly React components for SEO and fast load times.',
      icon: `/static/icons/${theme}/cloud-network.json`,
      style: 'dark:-rotate-[4deg]',
    },
  ]

  return (
    <div className="py-24">
      <div className="">
        <H2 className="text-center">WHY CKAN & PortalJS?</H2>
        <H3 className="text-center">CKAN is the world’s leading open-source data management system, trusted by governments and enterprises to catalog and publish data. PortalJS complements CKAN by providing a lightweight, customizable frontend layer that:</H3>
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
