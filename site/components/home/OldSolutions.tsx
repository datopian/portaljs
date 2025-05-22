import { Player } from '@lottiefiles/react-lottie-player'
import { H2, H3 } from '../custom/header'

const solutions = [
  {
    title: 'Open Data Portals and Platforms',
    description: `A Data Portal is a gateway to data. CKAN and PortalJS has been used to build many of the world’s 
      leading open data portals ranging from national governments like data.gov to regional or city portals like London’s, 
      Boston’s and Montreal’s.`,
    icon: '/static/icons/data-portal.json',
  },
  {
    title: 'Data Catalog & Metadata Management',
    description: `PortalJS provides everything you need in a modern, enterprise grade data catalog. Built on CKAN, 
        the mature feature-rich open-source data catalog continuously refined for more than a decade.`,
    icon: '/static/icons/data-catalog.json',
  },
  {
    title: 'Data Lake (house)',
    description: `Build your data lake on an open, sustainable and agile foundation. Our open architecture and tooling helps you build 
        data lakes that can adapt and scale with your needs, integrating diverse tooling into a coherent whole.`,
    icon: '/static/icons/data-lake.json',
  },
  {
    title: 'Data Management Infrastructure',
    description: `Develop a robust and powerful framework for managing data, for organizing data, for data engineering. It provides the 
        basic systems, structures and patterns for organizations to enable and scale the flow of data within their enterprise.`,
    icon: '/static/icons/data-management.json',
  },
]

export default function Solutions() {
  return (
    <div className="relative pt-16 pb-20 px-4 sm:px-6 lg:pb-28 lg:px-8">
      <div className="relative max-w-8xl mx-auto">
        <div className="text-center">
          <H2>Solutions</H2>
          <H3>Use our solution for</H3>
        </div>
        <div className="mt-12 max-w-lg mx-auto grid gap-8 lg:grid-cols-2 lg:max-w-8xl">
          {solutions.map((el) => (
            <div
              key={el.title}
              className="ring-1 ring-slate-200 dark:ring-slate-800 bg-slate-100 dark:bg-slate-900 px-6 py-8 space-y-6 flex flex-col rounded-2xl shadow overflow-hidden"
            >
              <div className="flex-shrink-0">
                <Player
                  autoplay
                  loop
                  src={el.icon}
                  style={{ height: '70px', width: '70px' }}
                />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex-1">
                  <div className="block mt-2">
                    <p className="text-xl text-center font-semibold">
                      {el.title}
                    </p>
                    <p className="mt-3 text-base text-center opacity-75">
                      {el.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
