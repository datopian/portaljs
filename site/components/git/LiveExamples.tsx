import { Player } from '@lottiefiles/react-lottie-player'
import { H2, H3 } from '../custom/header'
import { useTheme } from 'next-themes'

export const LiveExamples = () => {
  const { theme } = useTheme()
  const examples = [
    {
      title: 'OpenSpending.org',
      description: 'Global platform for fiscal transparency with government spending data from multiple countries.',
      url: 'https://openspending.org',
      icon: `/static/icons/${theme}/data-portal.json`,
      style: 'dark:-rotate-[4deg]',
    },
    {
      title: 'FiveThirtyEight Data',
      description: 'Replica of FiveThirtyEight\'s data portal showcasing journalism datasets with full GitHub integration.',
      url: 'https://fivethirtyeight.portaljs.org/',
      icon: `/static/icons/${theme}/analytical-skill.json`,
      style: 'dark:-rotate-[3deg]',
    },
    {
      title: 'Hate Speech Research',
      description: 'Alan Turing Institute\'s curated catalog of hate speech datasets for academic research.',
      url: 'https://turing.portaljs.org/',
      icon: `/static/icons/${theme}/data-catalog.json`,
      style: 'dark:-rotate-[2deg]',
    },
  ]

  return (
    <div className="py-24">
      <div className="">
        <H2 className="text-center mb-4">Live Examples</H2>
        <H3 className="text-center opacity-75">
          Real-world data portals built with PortalJS and Git as the backend.
        </H3>
        <div className="mt-16 grid grid-cols-1 gap-y-12 sm:gap-x-12 lg:grid-cols-3 lg:gap-x-6">
          {examples.map((example) => (
            <div
              key={example.title}
              className="relative flex flex-col rounded-xl dark:bg-slate-900 dark:hover:bg-slate-800 hover:bg-slate-100 transition-all duration-300 ring-1 ring-slate-200 dark:ring-slate-800 p-7 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="flex-shrink-0 w-full flex items-start -ml-2">
                <Player
                  autoplay
                  loop
                  src={example.icon}
                  className={`w-14 h-14 ${example.style}`}
                />
              </div>
              <div className="pt-4">
                <h3 className="text-lg font-medium ">
                  <a 
                    href={example.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-500 transition-colors"
                  >
                    {example.title}
                  </a>
                </h3>
                <p className="mt-4 text-base text-gray-400">
                  {example.description}
                </p>
                <div className="mt-4">
                  <a
                    href={example.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:text-blue-400 font-medium"
                  >
                    View Portal →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <H3 className="opacity-75">
            Want to build your own? Start with our{' '}
            <a
              href="https://github.com/datopian/portaljs/tree/main/examples/github-backed-catalog"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 font-medium"
            >
              GitHub-backed catalog example
            </a>
          </H3>
        </div>
      </div>
    </div>
  )
}