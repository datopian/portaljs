import {
  ChatBubbleBottomCenterIcon,
  CloudIcon,
  UserIcon,
  ArrowPathIcon,
  CodeBracketSquareIcon,
  PresentationChartBarIcon,
} from '@heroicons/react/24/solid'
import { FaInfoCircle } from 'react-icons/fa'

const addOns = [
  {
    title: 'Searchable Data (Data API)',
    subtitle: 'Let your users interact with your data easily.',
    description:
      'With the Data API add-on, your datasets become accessible for apps, dashboards, and websites. Instead of downloading files, users can retrieve the information they need quickly and build tools using your data.',
    href: 'https://datahub.io/docs/dms/data-api',
    icon: CloudIcon,
    iconForeground: 'text-secondary',
    iconBackground: 'bg-slate-100 dark:bg-slate-800',
    useCase:
      'Example use case: A government agency allows developers to build apps using open data.',
  },
  {
    title: 'Custom Dashboards',
    subtitle: 'Showcase your data in a way that’s easy to understand.',
    description:
      'Create beautiful, interactive dashboards with your datasets—no coding required. Share insights with your team, customers, or the public in a clear and engaging format.',
    href: 'https://datahub.io/docs/dms/dashboards',
    icon: PresentationChartBarIcon,
    iconForeground: 'text-secondary',
    iconBackground: 'bg-slate-100 dark:bg-slate-800',
    useCase: 'Example use case: A small business creates a visual sales report for investors.',
  },
  {
    title: 'Auto-Updated Data (Data Processing & ETL)',
    subtitle: 'Turn messy data into clean, organized information.',
    description:
      'No more manual updates! This add-on automates data collection, cleaning, and uploading, so your datasets are always up-to-date, structured, and ready to use.',
    href: 'https://datahub.io/docs/dms/flows',
    icon: CodeBracketSquareIcon,
    iconForeground: 'text-secondary',
    iconBackground: 'bg-slate-100 dark:bg-slate-800',
    useCase:
      'Example use case: A logistics company automatically updates its warehouse inventory data.',
  },
  {
    title: 'External Data Sync (Harvesting)',
    subtitle: 'Collect data from other platforms automatically.',
    description:
      'If you rely on data from other portals or sources, this add-on fetches and syncs information for you—eliminating the need for manual imports.',
    href: 'https://datahub.io/docs/dms/harvesting',
    icon: ArrowPathIcon,
    iconForeground: 'text-secondary',
    iconBackground: 'bg-slate-100 dark:bg-slate-800',
    useCase:
      'Example use case: A research organization gathers and updates datasets from multiple open data portals.',
  },
  {
    title: 'Request Your Own Add-on',
    subtitle: 'Get exactly what your project requires.',
    description:
    <p>Need a specific feature or tailored support? <a className='underline' href='https://calendar.app.google/sn2PU7ZvzjCPo1ok6' target='_blank'>Schedule a quick call with us</a> to describe your requirements.</p>,
    href: 'https://calendar.app.google/sn2PU7ZvzjCPo1ok6',
    icon: ChatBubbleBottomCenterIcon,
    iconForeground: 'text-secondary',
    iconBackground: 'bg-slate-100 dark:bg-slate-800',
    style: 'col-span-2',
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  return (
    <div className="divide-y divide-gray-200 rounded-lg bg-gray-200 dark:bg-slate-800 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0 shadow-lg mb-8 mx-1 dark:mx-0">
      {addOns.map((addOn, actionIdx) => (
        <div
          key={addOn.title}
          className={classNames(
            actionIdx === 0
              ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none'
              : '',
            actionIdx === 1 ? 'sm:rounded-tr-lg' : '',
            actionIdx === addOns.length - 2 ? '' : '',
            actionIdx === addOns.length - 1
              ? '!rounded-bl-lg !rounded-br-lg sm:rounded-bl-none col-span-2'
              : '',
            'relative bg-[#f5f5f5] hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500'
          )}
        >
          <div>
            <div title={addOn.title} className="focus:outline-none">
              <span
                className={classNames(
                  addOn.iconBackground,
                  addOn.iconForeground,
                  'inline-flex rounded-lg p-3 ring-4 ring-white dark:ring-slate-800'
                )}
              >
                <addOn.icon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
          </div>
          <div className="mt-8 z-50">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold leading-6 hover:underline">
                <div title={addOn.title} className="focus:outline-none">
                  {addOn.title}
                </div>
              </h3>
              {addOn.useCase && (
                <div className="relative group">
                  <FaInfoCircle className="text-gray-500 hover:text-blue-500 transition-colors duration-300 cursor-pointer" />
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-10 hidden group-hover:flex flex-col items-center bg-gray-800 text-white text-sm rounded-md py-2 px-4 shadow-lg w-[150px] whitespace-normal opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out sm:w-[200px] lg:w-[300px]">
                    {addOn.useCase}
                    <div className="absolute -top-1 w-3 h-3 bg-gray-800 rotate-45 transform"></div>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-2 text-sm opacity-75 italic">{addOn.subtitle}</p>
            <p className="mt-5 mb-3 text-sm opacity-75">{addOn.description}</p>
          </div>
          <div
            title={addOn.title}
            className="absolute right-6 top-6 dark:text-gray-300 group-hover:text-gray-400"
            aria-hidden="true"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  )
}
