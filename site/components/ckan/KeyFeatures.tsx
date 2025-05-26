import { Player } from '@lottiefiles/react-lottie-player'
import { H2, H3 } from '../custom/header'
import { useTheme } from 'next-themes'

const features = [
  {
    title: 'Integration with Multiple Data Sources',
    description: 'Connect not just to CKAN but to any data catalog or API endpoint, aggregating datasets from diverse origins.',
    icon: 'connection',
    iconStyle: 'dark:-rotate-[4deg]',
    style: 'max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem] w-full',
    colSpan: 'lg:col-span-4',
  },
  {
    title: 'Seamless Data Integration',
    description: 'Fetch CKAN datasets, resources, and metadata via API with built-in pagination, filtering, and format rendering.',
    icon: 'api',
    iconStyle: 'dark:-rotate-[2deg]',
    style: 'lg:rounded-tr-[2rem]',
    colSpan: 'lg:col-span-2',
  },
  {
    title: 'Easier CMS Integration',
    description: 'Plug into popular CMS platforms—WordPress, Drupal, Contentful—and manage content alongside your data catalog.',
    icon: 'browser',
    iconStyle: 'dark:-rotate-[4deg]',
    style: '',
    colSpan: 'lg:col-span-2',
  },
  {
    title: 'Deployment Flexibility',
    description: 'Deploy on Vercel, Cloudflare Pages, Netlify, or bundle for your own AWS, GCP, or Azure environment for optimal DX.',
    icon: 'rocket',
    iconStyle: 'dark:-rotate-[3deg]',
    style: '',
    colSpan: 'lg:col-span-4',
  },
  {
    title: 'Optimized Performance',
    description: 'Enjoy SSR-friendly React components, lazy-loading, minimal bundle size, and Next.js ISR (Incremental Static Regeneration) for fresh data without full rebuilds.',
    icon: 'server',
    iconStyle: 'dark:-rotate-[4deg]',
    style: '',
    colSpan: 'lg:col-span-2',
  },
  {
    title: 'SEO & Accessibility',
    description: 'Built-in Next-SEO and WCAG-compliant components ensure your data is discoverable and inclusive.',
    icon: 'search2',
    iconStyle: 'dark:-rotate-[2deg]',
    style: '',
    colSpan: 'lg:col-span-2',
  },
  {
    title: 'Developer Experience',
    description: 'TypeScript support, CI/CD-ready setup, and comprehensive docs make integration into your workflow a breeze.',
    icon: 'server-1',
    iconStyle: 'dark:-rotate-[4deg]',
    style: 'max-lg:rounded-b-[2rem] lg:rounded-br-[2rem] w-full',
    colSpan: 'lg:col-span-2',
  },
]

export const KeyFeatures = () => {

  const { theme } = useTheme()
  return (
    <div className="py-24">
      <div className="mx-auto">
        <div className="flex flex-col items-center">
          <H2 className="mt-2 tracking-4 text-center">
            Key Features
          </H2>
          <H3 className="text-lg leading-8 opacity-75 text-center">
            Pre-built for CKAN & Open Data—static-first rendering, serverless
            scaling, and full WCAG Compliance
          </H3>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          {features.map((solution, index) => (
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
