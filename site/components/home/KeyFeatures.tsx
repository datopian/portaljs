import { Player } from '@lottiefiles/react-lottie-player'
import { H2 } from '../custom/header'
import { useTheme } from 'next-themes'

export const KeyFeatures = () => {
  const { theme } = useTheme()
  const features = [
    {
      title: 'Launch in Minutes',
      description:
        'Get your data portal up and running in minutes, not months. No technical expertise required.',
      icon: `/static/icons/${theme}/clock.json`,
      style: 'dark:-rotate-[4deg]',
    },
    {
      title: 'Secure & Compliant',
      description:
        'Built with security and compliance in mind. GDPR compliant and follows best practices.',
      icon: `/static/icons/${theme}/verified.json`,
      style: 'dark:-rotate-[3deg]',
    },
    {
      title: 'Data Management',
      description:
        'Easily upload, manage, and organize your data with our intuitive interface.',
      icon: `/static/icons/${theme}/data-catalog.json`,
      style: 'dark:-rotate-[2deg]',
    },
    {
      title: 'Powerful Search',
      description:
        'Help users find what they need with powerful search capabilities across all your datasets.',
      icon: `/static/icons/${theme}/search.json`,
      style: 'dark:-rotate-[4deg]',
    },
  ]

  return (
    <div className="py-24">
      <div className="">
        <H2 className="text-center">Key Features</H2>
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
