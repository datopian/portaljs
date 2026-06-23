import Layout from '@/components/Layout'
import computeFields from '@/lib/computeFields'
import clientPromise from '@/lib/mddb'
import fs from 'fs'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { CaseStudiesStructuredData } from '@/components/schema/CaseStudiesStructuredData'

export default function CaseStudiesPage(casestudies) {
  return (
    <Layout isHomePage={true}>
      <CaseStudiesStructuredData casestudies={casestudies.casestudies} />
      <div className="flex justify-center">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12 w-full">
      <section className="py-16 sm:py-20">
        <div className="text-center lg:text-left">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Case Studies
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-5xl xl:text-6xl">
            See our <br />
            <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
              client stories
            </span>
          </h1>
        </div>
        <div className="grid grid-cols-1 gap-12 min-w-full my-8">
          {casestudies &&
            casestudies.casestudies.map((study, key) => (
              <article
                key={study.urlPath}
                className="mt-8 min-w-full shrink-0 group"
              >
                <div className={`flex flex-col sm:flex-row text-start gap-8 `}>
                  <Link
                    href={study.urlPath}
                    className="overflow-hidden h-full rounded-lg min-w-[1/2]"
                  >
                    <Image
                      width={360}
                      height={360}
                      src={study.image}
                      alt={study.title}
                      className="!aspect-[16/9] h-full rounded-lg object-cover w-full shadow-xl ease-in duration-500 group-hover:scale-105 transform bypass-filter "
                    />
                  </Link>
                  <div className="">
                    <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                      Case Study
                    </span>
                    <div className="">
                      <Link
                        className="line-clamp-3 text-[#2A3342]  group-hover:text-[#60a5fa] dark:text-[#f3f4f6] dark:hover:text-[#60a5fa] text-2xl font-bold transition ease-in-out capitalize max-w-3xl"
                        href={study.urlPath}
                      >
                        <h2 className="text-2xl font-bold">{study.title.replace('/', '-')}</h2>
                      </Link>
                    </div>
                    <div className="pt-2 text-justify opacity-75 font-regular prose dark:prose-invert max-w-4xl">
                      <ReactMarkdown>{study.description}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </section>
        </div>
      </div>
    </Layout>
  )
}

export async function getStaticProps() {
  const mddb = await clientPromise
  let casestudies = await mddb.getFiles({
    folder: 'case-studies',
    extensions: ['md', 'mdx'],
  })

  const studiesWithComputedFields = casestudies.map(async (caseStudy) => {
    const source = fs.readFileSync(caseStudy.file_path, { encoding: 'utf-8' })

    return await computeFields({
      frontMatter: caseStudy.metadata,
      urlPath: caseStudy.url_path,
      filePath: caseStudy.file_path,
      source,
    })
  })

  const caseStudyList = await Promise.all(studiesWithComputedFields)

  const caseStudiesSorted = caseStudyList.sort(
    (a, b) => new Date(b?.date).getTime() - new Date(a?.date).getTime()
  )

  return {
    props: {
      casestudies: caseStudiesSorted,
    },
  }
}