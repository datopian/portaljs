import ButtonLink from '@/components/ButtonLink'
import { H1, H2, H3 } from '@/components/custom/header'
import ReactMarkdown from 'react-markdown'
import { Disclosure } from '@headlessui/react'
import Head from 'next/head'
import { Avatar } from '@/components/Avatar'
import * as FaIcons from 'react-icons/fa'
import FAQ from '@/components/casestudy/FAQ'
import { CASE_STUDY_TABLES } from '@/constants'
import React, { useEffect } from 'react'
import { Player } from '@lottiefiles/react-lottie-player'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { useTheme } from 'next-themes'

export default function CaseStudyLayout({ children, ...frontMatter }) {
  const {
    title,
    metatitle,
    metaDescription,
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
    faq
  } = frontMatter

  const { theme } = useTheme()
  const _keystats = [
    ['50% reduction', 'in cloud costs'],
    ['Zero maintenance', 'overhead'],
    ['Enhanced UI/UX', '& acessibility'],
  ]

  const _stats = [
    { id: 1, name: 'Institutions worldwide', value: '100+' },
    { id: 2, name: 'Saved per year', value: '$5,000+ ' },
    { id: 3, name: 'Client satisfaction rate', value: '95%' },
  ]

  const [mainTitle, mainSubtitle] = title.split('/')

  const IconWrapper: React.FC<any> = ({ features }) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mt-9">
        {features.map((item, index) => {
          if (index % 2 === 0) {
            const text = item
            const icon = features[index + 1]
            const IconComponent = ({ className }) => (
              <Player
                autoplay
                loop
                src={`/static/icons/${theme}/${icon}.json`}
                style={{ height: '60px', width: '60px' }}
                className={className}
              />
            )

            return IconComponent ? (
              <div key={index} className="flex items-center gap-3">
                <div className="flex justify-center items-center p-3 ">
                  <IconComponent className="mr-2 text-blue-400 min-w-4 min-h-4 dark:-rotate-[4deg] " />
                </div>

                <div className="">
                  {' '}
                  <ReactMarkdown>{text}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div key={index}>Icon not found</div>
            )
          }
          return null
        })}
      </div>
    )
  }

  const tableData = CASE_STUDY_TABLES.filter((item) => item.table === table)

  const Tables = ({ tableData }) => {
    return (
      <div>
        {tableData.map((table, index) => (
          <div className="flex flex-col items-center mt-16" key={index}>
            <div className="text-2xl font-bold">{table.title}</div>
            <div className="text-lg text-center mt-4">{table.description}</div>
            <table className="mt-12 prose prose-headings:font-headings dark:prose-invert prose-a:break-word text-xs sm:text-base max-w-none w-full text-slate-400">
              <thead>
                <tr className="bg-slate-100 dark:bg-[#1d283a]">
                  {table.headers.map((header, idx) => (
                    <th
                      key={idx}
                      className="whitespace-nowrap px-6 py-4 uppercase text-slate-500 text-sm"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`${idx % 2 === 0 ? 'bg-[#fafafa] dark:bg-[#070e19]' : ''
                      } `}
                  >
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

  useEffect(() => {
    const slideContainer = document.querySelector('.slider-container')
    if (slideContainer && !slideContainer.classList.contains('group')) {
      slideContainer.classList.add('group')
    }
  }, [])

  const Header = () => {
    return (
      <section className="max-w-2xl px-4 sm:max-w-8xl justify-center mx-auto sm:px-8 xl:px-12">
        <Head>
          <title>{title}</title>
          <meta name="title" content={metatitle} />
          <meta name="description" content={metaDescription} />
        </Head>

        <div className="flex flex-col md:flex-row w-full object-cover relative overflow-hidden gap-10">
          <div className="   ">
            <span className="text-sm font-bold text-blue-400">CASE STUDY</span>
            <h1 className="!dark:text-white max-w-xl text-3xl lg:text-6xl font-semibold tracking-tight  drop-shadow font-bold ">
              {mainTitle}
            </h1>
            <div className="dark:text-white sm:text-2xl mt-4 prose dark:prose-invert max-w-2xl font-semibold">
              {mainSubtitle}
            </div>
            <div className="">
              <H1 className="sr-only">{title}</H1>
              <H2
                sub
                className="mt-4 text-base dark:text-slate-400 dark:opacity-100 prose prose-headings:font-headings dark:prose-invert prose-a:break-word max-w-none prose-a:text-blue-400 prose-a:no-underline prose-a:font-normal text-[16px] leading-6"
              >
                <ReactMarkdown>{description}</ReactMarkdown>
              </H2>

              <div className="flex items-center justify-start mt-6">
                <div className="flex gap-4">
                  {portal && (
                    <ButtonLink
                      href={portal[2]}
                      title="Get started with PortalJS Cloud"
                      className="text-sm"
                    >
                      See the portal
                    </ButtonLink>
                  )}
                  <ButtonLink
                    href="https://calendar.app.google/sn2PU7ZvzjCPo1ok6"
                    title="Book a demo"
                    style="secondary"
                    className="text-sm"
                  >
                    Book a demo
                  </ButtonLink>
                </div>
              </div>
              <div className="flex gap-2.5 items-center mt-8">
                {authorsDetails && (
                  <div className="flex flex-wrap items-center -space-x-4  ">
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

                <div className=" flex gap-4 mt-2">
                  <div className="font-semibold">
                    {readingTime == '1'
                      ? readingTime + ' min read'
                      : readingTime + ' mins read'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <img
            src={image}
            alt={title}
            className="h-fit md:max-w-[50%] rounded-lg"
          />
        </div>

        <div className=" flex flex-col w-full justify-center mt-8">
          <ul className="grid grid-cols-1 sm:grid-cols-3 my-8 gap-x-16 gap-y-8 w-full">
            {keystats.map((stat, index) => (
              <li
                key={index}
                className="text-center ring-1 ring-slate-200 dark:ring-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl p-8 shadow-lg"
              >
                <span className="text-xl lg:text-3xl block w-full font-semibold text-blue-400">
                  {stat.split('/n')[0]}
                </span>
                <span className="text-xl lg:text-xl block w-full mt-2">
                  {stat.split('/n')[1]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Journey />

        <div className="text-2xl font-bold mt-16 ">Why PortalJS Cloud?</div>

        <div className="flex ">
          <IconWrapper features={features} />
        </div>

        {highlight && (
          <>
            <div className="text-2xl font-bold mt-8 ">
              Why PortalJS Cloud + CKAN is the perfect pair?
            </div>
            <ReactMarkdown className="prose prose-headings:font-headings dark:prose-invert prose-a:break-word mt-8">
              {highlight}
            </ReactMarkdown>
          </>
        )}
        <div className="w-full flex flex-col items-center mt-32">
          <div className="max-w-4xl relative">
            <p className=" text-2xl ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl p-10 bg-zinc-50 dark:bg-slate-800/75 shadow-lg ">
              {quote[0]}
            </p>
            <div className="w-full max-w-4xl flex items-center justify-center sm:justify-end mt-6 gap-4 ">
              {quote[1] != '' && <img
                src={quote[1]}
                alt="quote"
                className="w-12 h-12 object-contain bg-white rounded-full ring-1 ring-slate-200 dark:ring-slate-800"
              />}
              <p className="max-4w-xl text-base font-semibold">{quote[2]}</p>
              <div className="absolute w-16 h-16 sm:w-32 sm:h-32 text-[96px] left-0 sm:-left-16 -top-24 opacity-15 z-10 text-blue-300 rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  shapeRendering="geometricPrecision"
                  textRendering="geometricPrecision"
                  imageRendering="optimizeQuality"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  viewBox="0 0 512 379.51"
                  fill="currentColor"
                >
                  <path d="M299.73 345.54c81.25-22.55 134.13-69.68 147.28-151.7 3.58-22.31-1.42-5.46-16.55 5.86-49.4 36.97-146.53 23.88-160.01-60.55C243.33-10.34 430.24-36.22 485.56 46.34c12.87 19.19 21.39 41.59 24.46 66.19 13.33 106.99-41.5 202.28-137.82 247.04-17.82 8.28-36.6 14.76-56.81 19.52-10.12 2.04-17.47-3.46-20.86-12.78-2.87-7.95-3.85-16.72 5.2-20.77zm-267.78 0c81.25-22.55 134.14-69.68 147.28-151.7 3.58-22.31-1.42-5.46-16.55 5.86-49.4 36.97-146.53 23.88-160-60.55-27.14-149.49 159.78-175.37 215.1-92.81 12.87 19.19 21.39 41.59 24.46 66.19 13.33 106.99-41.5 202.28-137.82 247.04-17.82 8.28-36.59 14.76-56.81 19.52-10.12 2.04-17.47-3.46-20.86-12.78-2.87-7.95-3.85-16.72 5.2-20.77z" />
                </svg>
              </div>
              <div className="absolute w-16 h-16 sm:w-32 sm:h-32 text-[96px] right-0 sm:-right-16  opacity-15 z-10 text-blue-300 ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  shape-rendering="geometricPrecision"
                  text-rendering="geometricPrecision"
                  image-rendering="optimizeQuality"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  viewBox="0 0 512 379.51"
                  fill="currentColor"
                >
                  <path d="M299.73 345.54c81.25-22.55 134.13-69.68 147.28-151.7 3.58-22.31-1.42-5.46-16.55 5.86-49.4 36.97-146.53 23.88-160.01-60.55C243.33-10.34 430.24-36.22 485.56 46.34c12.87 19.19 21.39 41.59 24.46 66.19 13.33 106.99-41.5 202.28-137.82 247.04-17.82 8.28-36.6 14.76-56.81 19.52-10.12 2.04-17.47-3.46-20.86-12.78-2.87-7.95-3.85-16.72 5.2-20.77zm-267.78 0c81.25-22.55 134.14-69.68 147.28-151.7 3.58-22.31-1.42-5.46-16.55 5.86-49.4 36.97-146.53 23.88-160-60.55-27.14-149.49 159.78-175.37 215.1-92.81 12.87 19.19 21.39 41.59 24.46 66.19 13.33 106.99-41.5 202.28-137.82 247.04-17.82 8.28-36.59 14.76-56.81 19.52-10.12 2.04-17.47-3.46-20.86-12.78-2.87-7.95-3.85-16.72 5.2-20.77z" />
                </svg>
              </div>
            </div>
          </div>

          {portal && (
            <div className="flex flex-col items-center mt-16 max-w-2xl">
              <h2 className="text-3xl font-bold text-center">{portal[0]}</h2>
              <p className="text-lg text-center mt-4">{portal[1]}</p>
              {portal[2] && <ButtonLink
                href={portal[2]}
                title="Explore"
                className="mt-6 text-sm"
                style="secondary"
              >
                Explore
              </ButtonLink>}
            </div>
          )}
          {images && (
            <div className="flex flex-col items-center gap-8 mt-16">
              {images.map((image: string, index: number) => (
                <img
                  key={index}
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-full max-w-4xl rounded-xl object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {table && <Tables tableData={tableData} />}
      </section>
    )
  }

  const Cta = () => {
    return (
      <div className="!max-w-none ring-1 ring-slate-200 dark:ring-slate-800 py-24 bg-zinc-50 dark:bg-slate-800/75 mt-24 relative overflow-hidden">
        <div className="flex flex-col items-center px-4">
          <div className="text-3xl font-bold text-center sm">
            Ready to build your portal in minutes?
          </div>
          <p className="mt-8 text-lg text-center sm:text-start">
            Let’s discuss how PortalJS can meet your needs.
          </p>
          <div className="mt-8 flex gap-4">
            <ButtonLink
              href="https://calendar.app.google/sn2PU7ZvzjCPo1ok6"
              title="Get started with PortalJS Cloud"
              className="text-sm z-20"
            >
              Request a Demo
            </ButtonLink>
            <ButtonLink
              href="https://calendar.app.google/sn2PU7ZvzjCPo1ok6"
              title="Book a demo"
              style="secondary"
              className="text-sm z-20"
            >
              Book a Consultation
            </ButtonLink>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-16 z-10 flex transform-gpu justify-center overflow-hidden blur-3xl"
        >
          <div
            style={{
              clipPath:
                'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
            }}
            className="aspect-[1318/752] w-[82.375rem] flex-none bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-25"
          />
        </div>
      </div>
    )
  }

  const Stats = () => {
    return (
      <div className="py-24">
        <div className="mx-auto max-w-8xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
            {_stats.map((stat) => (
              <div
                key={stat.id}
                className="mx-auto flex max-w-xs flex-col gap-y-4"
              >
                <dt className="text-xl">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold sm:text-5xl ">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    )
  }

  const Journey = () => {
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="border-t-4 border-red-500 rounded-t-xl p-8 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl shadow-lg">
            <div className="flex gap-4 items-center">
              <div className="bg-red-900 bg-opacity-10 dark:bg-opacity-40 rounded-full h-14 w-14 p-3">
                <XCircleIcon className="text-red-500" />
              </div>

              <h3 className="text-xl font-bold"> The Problem</h3>
            </div>

            <p className="mt-6 prose prose-headings:font-headings dark:prose-invert prose-a:break-word">
              <ReactMarkdown>{problem}</ReactMarkdown>
            </p>
          </div>
          <div className="border-t-4 border-blue-500 rounded-t-xl p-8 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl shadow-lg">
            <div className="flex gap-4 items-center">
              <div className="bg-blue-900 bg-opacity-10 dark:bg-opacity-40 rounded-full h-14 w-14 p-3 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-zap h-6 w-6 text-blue-500"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>

              <h3 className="text-xl font-bold"> The Solution</h3>
            </div>

            <p className="mt-6 prose prose-headings:font-headings dark:prose-invert prose-a:break-word">
              <ReactMarkdown>{solution}</ReactMarkdown>
            </p>
          </div>
          <div className="border-t-4 border-green-500  rounded-t-xl p-8 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl shadow-lg">
            <div className="flex gap-4 items-center">
              <div className="bg-green-900 bg-opacity-10 dark:bg-opacity-40 rounded-full h-14 w-14 p-3 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-check-circle h-6 w-6 text-green-500"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <path d="m9 11 3 3L22 4"></path>
                </svg>
              </div>

              <h3 className="text-xl font-bold"> The Impact</h3>
            </div>

            <p className="mt-6 prose prose-headings:font-headings dark:prose-invert prose-a:break-word">
              <ReactMarkdown>{results}</ReactMarkdown>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <article>
      <Header />
      <Cta />
      {longRead && <main className="flex flex-col mt-16 w-full mx-auto max-w-8xl px-4 sm:px-8 xl:px-12">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="text-start text-base font-medium">
                {open ? (
                  <div>
                    <p className="text-sm font-bold text-blue-400">LONG READ</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl">Hide</p>
                      <FaIcons.FaAngleDoubleUp className="text-blue-400 mt-1 " />
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-blue-400">LONG READ</p>
                    <div className="flex items-center gap-2 transition blink">
                      <p className="text-start text-5xl sm:text-7xl max-w-lg sm:mb-16 tracking-tight">
                        Click to read the detailed case study{' '}
                        <FaIcons.FaAngleDoubleDown className=" inline text-blue-400 -ml-3 mt-1 sm:h-16 sm:w-16 " />
                      </p>
                    </div>
                  </div>
                )}
              </Disclosure.Button>
              <Disclosure.Panel>
                <div className="text-center text-3xl font-semibold mt-8 mb-6 max-w-l">
                  A Detailed Case Study for a Deep Dive
                </div>
                <div className="flex justify-center">
                  {' '}
                  <div className="max-w-4xl docs mt-6 prose prose-headings:font-headings dark:prose-invert prose-a:break-word ">
                    {children}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </main>}
      <Stats />
      <FAQ faq={faq} />
    </article>
  )
}
