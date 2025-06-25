import { Player } from '@lottiefiles/react-lottie-player'
import { H2, H3 } from '../custom/header'
import { useTheme } from 'next-themes'

export const WhyGitAndPortalJS = () => {
  const { theme } = useTheme()
  const features = [
    {
      title: 'Version Control for Data',
      description:
        'Track changes, collaborate with pull requests, and maintain complete history of your datasets.',
      icon: `/static/icons/${theme}/git.json`,
      style: 'dark:-rotate-[4deg]',
    },
    {
      title: 'Zero Infrastructure',
      description:
        'No databases, no servers. Use GitHub, GitLab, or any Git platform as your data backend.',
      icon: `/static/icons/${theme}/server.json`,
      style: 'dark:-rotate-[3deg]',
    },
    {
      title: 'Community Collaboration',
      description:
        'Enable contributors to propose datasets, improvements, and corrections through standard Git workflows.',
      icon: `/static/icons/${theme}/team.json`,
      style: 'dark:-rotate-[2deg]',
    },
    {
      title: 'Distributed & Resilient',
      description:
        'Data lives in multiple places by design. No single point of failure or vendor lock-in.',
      icon: `/static/icons/${theme}/network.json`,
      style: 'dark:-rotate-[4deg]',
    },
  ]

  return (
    <div className="py-24">
      <div className="">
        <H2 className="text-center">WHY GIT & PortalJS?</H2>
        <H3 className="text-center">Git is the world's most trusted version control system, used by millions of developers worldwide.<br />PortalJS complements Git by providing a lightweight, customizable frontend layer.</H3>
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