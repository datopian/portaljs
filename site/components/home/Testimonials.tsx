import { H2, H3 } from '../custom/header'
import { RiDoubleQuotesL } from 'react-icons/ri'
import testimonials from '@/content/testimonials.json'

type Testimonial = {
  name: string
  role?: string
  organization?: string
  quote: string
  image?: string
  url?: string
}

export const Testimonials = () => {
  const items = (testimonials as Testimonial[]).filter(
    (t) => t && t.quote && t.name
  )

  if (!items.length) return null

  return (
    <div className="pt-10 sm:pt-16 lg:pt-24 pb-24">
      <div>
        <H2 className="text-center mb-4">
          Trusted by Data Publishers Worldwide
        </H2>
        <H3 className="opacity-75 text-center">
          Real feedback from organizations using PortalJS Cloud
        </H3>
        <div className="mt-16 grid grid-cols-1 gap-y-12 sm:gap-x-12 lg:grid-cols-3 lg:gap-x-6">
          {items.map((t) => (
            <div
              key={`${t.name}-${t.quote.slice(0, 16)}`}
              className="relative flex flex-col rounded-xl dark:bg-slate-900 dark:hover:bg-slate-800 hover:bg-slate-100 transition-all duration-300 ring-1 ring-slate-200 dark:ring-slate-800 p-7 gap-5 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="text-theme-orange opacity-75">
                <RiDoubleQuotesL className="w-6 h-6" aria-hidden />
              </div>
              <p className="text-base opacity-75">{t.quote}</p>
              <div className="flex-shrink-0 w-full mt-auto">
                <h3 className="text-lg font-medium ">
                  {t.url ? (
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {t.name}
                    </a>
                  ) : (
                    t.name
                  )}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {[t.role, t.organization].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
