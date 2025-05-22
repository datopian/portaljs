import { Player } from '@lottiefiles/react-lottie-player'
import { H2, H3 } from '../custom/header'
import { useTheme } from 'next-themes'

export const Security = () => {
  const { theme } = useTheme()
  const features = [
    {
      title: 'DCAT & Dublin Core Compliance',
      description:
        'Ensure your datasets are easily discoverable and interoperable with national and international portals.',
      icon: `/static/icons/${theme}/standards.json`,
      style: 'dark:-rotate-[4deg]',
    },
    {
      title: 'WCAG 2.1 AA Accessibility',
      description:
        'Meet accessibility standards so everyone — regardless of ability — can use your data portal.',
      icon: `/static/icons/${theme}/verified-3.json`,
      style: 'dark:-rotate-[4deg]',
    },
    {
      title: 'SSL Encryption & Secure Hosting',
      description:
        'Protect users and data with enterprise-grade security, encryption, and infrastructure best practices.',
      icon: `/static/icons/${theme}/server-1.json`,
      style: 'dark:-rotate-[4deg]',
    },
  ]

  return (
    <div className="py-24">
      <div className="">
        <H2 className="text-center mb-4">Built for Public Sector Standards</H2>
        <H3 className="text-center opacity-75">
          Make your data open, accessible, and trustworthy — the way it should
          be.
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
