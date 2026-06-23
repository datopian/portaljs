import { H1 } from '@/components/custom/header'
import ReactMarkdown from 'react-markdown'
import { Disclosure } from '@headlessui/react'
import { Avatar } from '@/components/Avatar'
import * as FaIcons from 'react-icons/fa'
import { CASE_STUDY_TABLES } from '@/constants'
import React, { useEffect } from 'react'

// SVG icon paths — keyed to the `icon` field in case study frontmatter
const ICONS: Record<string, React.ReactNode> = {
  api: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ),
  browser: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  'cloud-network': (
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
  ),
  database: (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5" />
      <path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3" />
    </>
  ),
  ewallet: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <circle cx="16.5" cy="14.5" r=".5" fill="currentColor" />
    </>
  ),
  expand: <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />,
  favorite: (
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  ),
  hexagonal: (
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  ),
  key: (
    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
  ),
  layers: (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>
  ),
  magnify: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  'user-check': (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </>
  ),
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  'paint-roller': (
    <>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </>
  ),
  'presentation-1': (
    <>
      <rect x="2" y="3" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 16v5" />
    </>
  ),
  'presentation-3': (
    <>
      <rect x="2" y="3" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 16v5" />
    </>
  ),
  'presentation-4': (
    <>
      <rect x="2" y="3" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 16v5" />
    </>
  ),
  puzzle: (
    <>
      <rect x="2" y="2" width="9" height="9" rx="1" />
      <rect x="13" y="2" width="9" height="9" rx="1" />
      <rect x="2" y="13" width="9" height="9" rx="1" />
      <path d="M18 13v2M16 15h4M18 17v2" />
    </>
  ),
  'repair-tools': (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
  rocket: (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11A22.35 22.35 0 0 1 15 15" />
      <path d="M9 12h.01" />
      <path d="M12 9h.01" />
    </>
  ),
  server: (
    <>
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <path d="M6 6h.01M6 18h.01" />
    </>
  ),
  standards: (
    <>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </>
  ),
  verified: (
    <>
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
}

function FeatureIcon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[22px] w-[22px]"
      aria-hidden="true"
    >
      {ICONS[name] ?? <circle cx="12" cy="12" r="9" />}
    </svg>
  )
}

function Tables({ tableData }: { tableData: any[] }) {
  return (
    <div className="mx-auto max-w-8xl px-4 sm:px-8 xl:px-12 pb-16">
      {tableData.map((tbl, index) => (
        <div className="flex flex-col items-center mt-16" key={index}>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{tbl.title}</div>
          <div className="text-lg text-center mt-4 text-slate-600 dark:text-slate-300">{tbl.description}</div>
          <table className="mt-12 prose prose-headings:font-headings dark:prose-invert prose-a:break-word text-xs sm:text-base max-w-none w-full text-slate-600 dark:text-slate-300">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#1d283a]">
                {tbl.headers.map((header, idx) => (
                  <th key={idx} className="whitespace-nowrap px-6 py-4 uppercase text-slate-500 text-sm">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tbl.rows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-[#fafafa] dark:bg-[#070e19]' : ''}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-6 py-4 text-sm">
                      {cellIdx === 0 ? <strong>{cell}</strong> : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

function Journey({
  problem,
  solution,
  results,
  fullCaseStudy,
}: {
  problem: string
  solution: string
  results: string
  fullCaseStudy: string | false
}) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
        <div className="pt-8 sm:pt-0 sm:pr-10">
          <h3 className="text-[19px] font-bold text-slate-900 dark:text-white mb-3">Challenge</h3>
          <div className="h-0.5 w-10 rounded-full bg-slate-400 dark:bg-slate-500 mb-5" />
          <div className="prose prose-sm prose-headings:font-headings dark:prose-invert prose-a:break-word text-slate-600 dark:text-slate-400 leading-relaxed">
            <ReactMarkdown>{problem}</ReactMarkdown>
          </div>
        </div>
        <div className="py-8 sm:py-0 sm:px-10">
          <h3 className="text-[19px] font-bold text-slate-900 dark:text-white mb-3">Solution</h3>
          <div className="h-0.5 w-10 rounded-full bg-sky-500 dark:bg-sky-400 mb-5" />
          <div className="prose prose-sm prose-headings:font-headings dark:prose-invert prose-a:break-word text-slate-600 dark:text-slate-400 leading-relaxed">
            <ReactMarkdown>{solution}</ReactMarkdown>
          </div>
        </div>
        <div className="pb-8 sm:pb-0 sm:pl-10">
          <h3 className="text-[19px] font-bold text-slate-900 dark:text-white mb-3">Impact</h3>
          <div className="h-0.5 w-10 rounded-full bg-blue-600 dark:bg-blue-400 mb-5" />
          <div className="prose prose-sm prose-headings:font-headings dark:prose-invert prose-a:break-word text-slate-600 dark:text-slate-400 leading-relaxed">
            <ReactMarkdown>{results}</ReactMarkdown>
          </div>
        </div>
      </div>
      {fullCaseStudy && (
        <div className="mt-8 text-blue-400 justify-self-end text-[16px]">
          <a href={fullCaseStudy} target="_blank" rel="noopener noreferrer">
            Read the full story →
          </a>
        </div>
      )}
    </div>
  )
}

function JourneySection({
  problem,
  solution,
  results,
  fullCaseStudy,
}: {
  problem: string
  solution: string
  results: string
  fullCaseStudy: string | false
}) {
  return (
    <section className="border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-8xl px-4 sm:px-8 xl:px-12 py-16">
        <Journey problem={problem} solution={solution} results={results} fullCaseStudy={fullCaseStudy} />
      </div>
    </section>
  )
}

function HeroSection({
  title,
  mainTitle,
  mainSubtitle,
  description,
  portal,
  authorsDetails,
  readingTime,
  keystats,
  fullCaseStudy,
  image,
}: {
  title: string
  mainTitle: string
  mainSubtitle: string
  description: string
  portal: string[] | undefined
  authorsDetails: any[]
  readingTime: string
  keystats: string[]
  fullCaseStudy: string | false
  image: string
}) {
  return (
    <section className="max-w-2xl px-4 sm:max-w-8xl justify-center mx-auto sm:px-8 xl:px-12 pb-16">
      <div className="flex flex-col md:flex-row w-full relative overflow-hidden gap-10">
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            CASE STUDY
          </span>
          <h1 className="mt-3 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            {mainTitle}
          </h1>
          <div className="text-slate-600 dark:text-slate-400 sm:text-xl mt-4 max-w-2xl font-medium">
            {mainSubtitle}
          </div>
          <div>
            <H1 className="sr-only">{title}</H1>
            <div className="mt-4 text-[16px] leading-6 text-slate-600 dark:text-slate-400 prose prose-headings:font-headings dark:prose-invert prose-a:break-word max-w-none prose-a:text-blue-400 prose-a:no-underline prose-a:font-normal">
              <ReactMarkdown>{description}</ReactMarkdown>
            </div>
            <div className="mt-6 flex flex-wrap gap-3.5">
              {portal && portal[2] && (
                <a
                  href={portal[2]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]"
                >
                  See the portal
                </a>
              )}
              <a
                href="https://calendar.app.google/sn2PU7ZvzjCPo1ok6"
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-300 bg-white px-[18px] py-2.5 text-[14.5px] font-semibold text-slate-700 transition-all duration-150 hover:-translate-y-px hover:border-blue-400 hover:text-blue-600"
              >
                Book a demo
              </a>
              {fullCaseStudy && (
                <a
                  href={fullCaseStudy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-[10px] bg-slate-900 px-[18px] py-2.5 text-[14.5px] font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-slate-700"
                >
                  Read full case study
                </a>
              )}
            </div>
            <div className="flex gap-2.5 items-center mt-8">
              {authorsDetails && (
                <div className="flex flex-wrap items-center -space-x-4">
                  {authorsDetails.map(({ avatar, isDraft, url_path }) => (
                    <Avatar
                      key={url_path}
                      name={null}
                      img={avatar}
                      href={url_path && !isDraft ? `/${url_path}` : undefined}
                    />
                  ))}
                </div>
              )}
              <div className="flex gap-4 mt-2">
                <div className="font-semibold">
                  {readingTime == '1' ? readingTime + ' min read' : readingTime + ' mins read'}
                </div>
              </div>
            </div>
          </div>
        </div>
        <img src={image} alt={title} className="h-fit md:max-w-[50%] rounded-lg" />
      </div>

      {/* Keystats */}
      <ul className="grid grid-cols-1 sm:grid-cols-3 my-8 gap-x-16 gap-y-8 w-full mt-10">
        {keystats.map((stat, index) => (
          <li
            key={index}
            className="text-center ring-1 ring-slate-200 dark:ring-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl p-8 shadow-lg"
          >
            <span className="text-2xl lg:text-3xl block w-full font-bold text-blue-600 dark:text-blue-400">
              {stat.split('/n')[0]}
            </span>
            <span className="text-sm block w-full mt-2 text-slate-600 dark:text-slate-400 font-medium">
              {stat.split('/n')[1]}
            </span>
          </li>
        ))}
      </ul>

    </section>
  )
}

function NarrativeSection({ narrative }: { narrative?: string }) {
  if (!narrative) return null
  return (
    <section className="border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-4xl px-4 sm:px-8 xl:px-12 py-16">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
          The story
        </span>
        <div className="mt-6 prose prose-lg prose-headings:font-headings dark:prose-invert prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-li:text-slate-600 dark:prose-li:text-slate-400 max-w-none">
          <ReactMarkdown>{narrative}</ReactMarkdown>
        </div>
      </div>
    </section>
  )
}

function Features({
  features,
  highlight,
}: {
  features: { title: string; text: string; icon: string }[]
  highlight?: string
}) {
  if (!features || features.length === 0) return null
  return (
    <section className="w-full border-y border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40 sm:py-[88px]">
      <div className="mx-auto max-w-8xl px-4 sm:px-8 xl:px-12">
        <div className="max-w-[680px]">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            What we delivered
          </span>
          <h2 className="mt-3.5 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Everything we built.
          </h2>
        </div>
        <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item, index) =>
            item ? (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-slate-300 hover:shadow-[0_16px_36px_-20px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
              >
                <div className="mb-4 grid h-[42px] w-[42px] place-items-center rounded-[11px] bg-gradient-to-br from-sky-400/20 to-blue-600/15 text-blue-800 dark:text-blue-300">
                  <FeatureIcon name={item.icon} />
                </div>
                <h3 className="mb-[7px] text-[17.5px] font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <div className="text-[14.5px] text-slate-600 dark:text-slate-300">
                  <ReactMarkdown>{item.text}</ReactMarkdown>
                </div>
              </div>
            ) : null
          )}
        </div>
        {highlight && (
          <div className="mt-16 max-w-4xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Why PortalJS Cloud + CKAN is the perfect pair?
            </h3>
            <div className="prose prose-headings:font-headings dark:prose-invert prose-a:break-word mt-6 text-slate-600 dark:text-slate-300">
              <ReactMarkdown>{highlight}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function Testimonial({ quote }: { quote: string[] | undefined }) {
  if (!quote || !quote[0]) return null
  return (
    <section className="py-20 border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-4xl px-4 sm:px-8 xl:px-12">
        <figure className="relative">
          <div
            className="pointer-events-none absolute -left-2 -top-4 select-none text-8xl leading-none text-blue-200 dark:text-blue-900 font-serif"
            aria-hidden="true"
          >
            &ldquo;
          </div>
          <blockquote className="relative pl-8 text-xl font-medium leading-relaxed text-slate-900 dark:text-white sm:text-2xl">
            {quote[0]}
          </blockquote>
          <figcaption className="mt-8 pl-8 flex items-center gap-4">
            {quote[1] && (
              <img
                src={quote[1]}
                alt=""
                className="h-12 w-12 rounded-full object-contain ring-1 ring-slate-200 dark:ring-slate-700 bg-white p-1"
              />
            )}
            <span className="text-base font-semibold text-slate-700 dark:text-slate-300">
              {quote[2]}
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

function SeeLive({
  portal,
  images,
}: {
  portal: string[] | undefined
  images: string[] | undefined
}) {
  if (!portal && (!images || images.length === 0)) return null
  const displayUrl = portal?.[2] ? portal[2].replace(/^https?:\/\//, '') : null
  return (
    <section className="border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 py-20">
      <div className="mx-auto max-w-8xl px-4 sm:px-8 xl:px-12">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
          See it live
        </span>
        <div className="mt-8 grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_2fr]">
          {portal && (
            <div className="lg:pt-4">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {portal[0]}
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-slate-600 dark:text-slate-300">
                {portal[1]}
              </p>
              {portal[2] && (
                <a
                  href={portal[2]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]"
                >
                  Visit live portal
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </a>
              )}
            </div>
          )}
          {images && images.length > 0 && (
            <div className="overflow-hidden rounded-2xl shadow-[0_24px_60px_-20px_rgba(15,23,42,0.30)] ring-1 ring-slate-200 dark:ring-slate-700">
              {/* Browser chrome */}
              <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600" />
                </div>
                {displayUrl && (
                  <div className="ml-1 flex-1 truncate rounded-md bg-slate-200 dark:bg-slate-700 px-3 py-1 text-xs text-slate-500 dark:text-slate-400">
                    {displayUrl}
                  </div>
                )}
              </div>
              <img
                src={images[0]}
                alt={portal ? portal[0] : 'Portal screenshot'}
                className="block w-full"
              />
            </div>
          )}
        </div>
        {images && images.length > 1 && (
          <div
            className={`mt-6 grid gap-4 ${
              images.slice(1).length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
            }`}
          >
            {images.slice(1).map((img: string, i: number) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shadow-md"
              >
                <img src={img} alt={`Screenshot ${i + 2}`} className="block w-full" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function FAQSection({ faqs }: { faqs: { question: string; answer: string }[] | undefined }) {
  if (!faqs || faqs.length === 0) return null
  return (
    <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-8 xl:px-12">
        <div className="mb-12">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            FAQs
          </span>
          <h2 className="mt-3.5 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Questions answered.
          </h2>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {faqs.map((faq, index) => (
            <Disclosure key={index}>
              {({ open }) => (
                <div className="py-5">
                  <Disclosure.Button className="flex w-full items-start justify-between text-left">
                    <span className="text-[17px] font-semibold text-slate-900 dark:text-white pr-8">
                      {faq.question}
                    </span>
                    <span className="ml-6 flex h-7 shrink-0 items-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-5 w-5 text-blue-500 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </Disclosure.Button>
                  <Disclosure.Panel className="mt-4 pr-12">
                    <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                      {faq.answer}
                    </p>
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>
          ))}
        </div>
      </div>
    </section>
  )
}

function Cta() {
  return (
    <section className="w-full pb-[88px] pt-16">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1830] via-[#10254a] to-[#173a78] px-7 py-12 text-center sm:px-14 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(50% 90% at 50% -10%,rgba(125,211,252,0.22),transparent 70%)' }}
          />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to build your portal in minutes?
            </h2>
            <p className="mx-auto mt-4 max-w-[48ch] text-[17px] text-[#b9c9e4]">
              Let's discuss how PortalJS can meet your needs.
            </p>
            <div className="mt-[30px] flex flex-wrap justify-center gap-3.5">
              <a
                href="https://calendar.app.google/sn2PU7ZvzjCPo1ok6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]"
              >
                Request a Demo
              </a>
              <a
                href="https://calendar.app.google/sn2PU7ZvzjCPo1ok6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[10px] border border-white/20 bg-white/[0.06] px-[18px] py-2.5 text-[14.5px] font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-white/[0.12]"
              >
                Book a Consultation
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function CaseStudyLayout({ children, ...frontMatter }) {
  const {
    title,
    description,
    image,
    readingTime,
    keystats,
    problem,
    solution,
    results,
    quote,
    portal,
    authorsDetails,
    features,
    images,
    table,
    highlight,
    longRead = true,
    longReadLink,
    longReadTitle,
    longReadSummary,
    fullCaseStudy = false,
    faqs,
    narrative,
  } = frontMatter

  const [mainTitle, mainSubtitle] = title.split('/')
  const tableData = CASE_STUDY_TABLES.filter((item) => item.table === table)

  useEffect(() => {
    const slideContainer = document.querySelector('.slider-container')
    if (slideContainer && !slideContainer.classList.contains('group')) {
      slideContainer.classList.add('group')
    }
  }, [])

  return (
    <article>
      <HeroSection
        title={title}
        mainTitle={mainTitle}
        mainSubtitle={mainSubtitle}
        description={description}
        portal={portal}
        authorsDetails={authorsDetails}
        readingTime={readingTime}
        keystats={keystats}
        fullCaseStudy={fullCaseStudy}
        image={image}
      />
      <NarrativeSection narrative={narrative} />
      <JourneySection
        problem={problem}
        solution={solution}
        results={results}
        fullCaseStudy={fullCaseStudy}
      />
      <Features features={features} highlight={highlight} />
      <Testimonial quote={quote} />
      <SeeLive portal={portal} images={images} />
      <FAQSection faqs={faqs} />
      {longReadLink && !fullCaseStudy && (
        <section className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent">
          <div className="mx-auto max-w-8xl px-4 sm:px-8 xl:px-12 py-14">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-8 sm:p-10">
              <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-sky-400 to-blue-600" />
              <div className="pl-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                <div className="max-w-2xl">
                  <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                    Deep dive
                  </span>
                  <h3 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                    {longReadTitle || 'Read the full case study'}
                  </h3>
                  {longReadSummary && (
                    <p className="mt-3 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 max-w-xl">
                      {longReadSummary}
                    </p>
                  )}
                </div>
                <a
                  href={longReadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]"
                >
                  Read the full story
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}
      <Cta />
      {table && <Tables tableData={tableData} />}
    </article>
  )
}
