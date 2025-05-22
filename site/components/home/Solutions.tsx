import { Player } from '@lottiefiles/react-lottie-player'
import { H1, H2, H3 } from '../custom/header'
import { useTheme } from 'next-themes'

const solutions = [
  {
    title: '5-Minute Deployment',
    description: 'Launch your fully functional data portal in minutes—no coding, no hassle.',
    icon: 'copy',
    iconStyle: 'dark:-rotate-[4deg]',
    style: 'max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem] w-full',
    colSpan: 'lg:col-span-4',
  },
  {
    title: '100% Compliance',
    description: 'Built for public-sector standards, supporting DCAT, Dublin Core, and open data best practices.',
    icon: 'privacy-policy',
    iconStyle: 'dark:-rotate-[2deg]',
    style: 'lg:rounded-tr-[2rem]',
    colSpan: 'lg:col-span-2',
  },
  {
    title: 'Unlimited Scalability',
    description: 'Handle unlimited datasets and users, with seamless integration into your existing workflows.',
    icon: 'server',
    iconStyle: 'dark:-rotate-[4deg]',
    style: '',
    colSpan: 'lg:col-span-2',
  },
  {
    title: '99.99% Uptime',
    description: 'Enjoy high-performance, fully managed hosting with uninterrupted access to your data.',
    icon: 'online-security',
    iconStyle: 'dark:-rotate-[4deg]',
    style: '',
    colSpan: 'lg:col-span-2',
  },
  {
    title: '$5,000+ Annual Savings',
    description: 'Eliminate infrastructure costs and reduce IT overhead with our fully hosted solution.',
    icon: 'ewallet2',
    iconStyle: 'dark:-rotate-[3deg]',
    style: '',
    colSpan: 'lg:col-span-2',
  },
  {
    title: 'Trusted by 100+ Institutions',
    description: 'Governments, universities, and nonprofits rely on PortalJS Cloud to manage and share data effectively.',
    icon: 'connection',
    iconStyle: 'dark:-rotate-[4deg]',
    style: 'lg:rounded-bl-[2rem]',
    colSpan: 'lg:col-span-2',
  },
  {
    title: 'Accessibility-First Design',
    description: 'Fully compliant with WCAG 2.1 AA, ensuring inclusive, barrier-free data access for all users.',
    icon: 'click',
    iconStyle: 'dark:-rotate-[4deg]',
    style: 'max-lg:rounded-b-[2rem] lg:rounded-br-[2rem] w-full',
    colSpan: 'lg:col-span-4',
  },
]

export const Solutions = () => {

  const { theme } = useTheme()
  return (
    <div className="py-24">
      <div className="mx-auto">
        <div className="flex flex-col items-center">
          <H2 className="mt-2 tracking-4 text-center">
            Secure, Compliant & Scalable Data Portals
          </H2>
          <H3 className="text-lg leading-8 opacity-75 text-center">
            Pre-built for CKAN & Open Data—static-first rendering, serverless
            scaling, and full WCAG Compliance
          </H3>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          {solutions.map((solution, index) => (
            <div key={index} className={`flex p-px ${solution.colSpan}`}>
              <div className={`overflow-hidden rounded-lg dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 dark:hover:bg-slate-800 hover:bg-slate-100 transition-all duration-300 rounded-lg shadow-lg ${solution.style}`}>
                <div className="flex flex-col items-start p-10">
                  <Player src={`/static/icons/${theme}/${solution.icon}.json`} autoplay loop className={`w-14 h-14 ${solution.iconStyle}`} />
                  <p className="mt-2 text-xl font-semibold tracking-tight dark:text-white">
                    {solution.title}
                  </p>
                  <p className="mt-2 ">{solution.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
