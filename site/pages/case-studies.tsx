import Layout from '@/components/Layout'
import computeFields from '@/lib/computeFields'
import clientPromise from '@/lib/mddb'
import { NextSeo } from 'next-seo'
import fs from 'fs'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { CaseStudiesStructuredData } from '@/components/schema/CaseStudiesStructuredData'

export default function CaseStudiesPage(casestudies) {
  return (
    <Layout>
      <NextSeo
        title="Case Studies | PortalJS"
        description="Discover how organizations worldwide build powerful data portals with PortalJS. Real client stories, implementations, and success stories."
        canonical="https://portaljs.org/case-studies"
      />
      <CaseStudiesStructuredData casestudies={casestudies.casestudies} />
      <section className="">
        <div>
          <div className="flex items-center gap-2 transition blink">
            <p className="text-start text-5xl sm:text-7xl max-w-lg sm:my-8 tracking-tight">
              See our client stories{' '}
            </p>
          </div>
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
                      alt="Case Study"
                      className="!aspect-[16/9] h-full rounded-lg object-cover w-full shadow-xl ease-in duration-500 group-hover:scale-105 transform bypass-filter "
                    />
                  </Link>
                  <div className="">
                    <p className="text-sm font-bold text-blue-400 mb-1">
                      CASE STUDY
                    </p>
                    <div className="">
                      <Link
                        className="line-clamp-3 text-[#2A3342]  group-hover:text-[#60a5fa] dark:text-[#f3f4f6] dark:hover:text-[#60a5fa] text-2xl font-bold transition ease-in-out capitalize max-w-3xl"
                        href={study.urlPath}
                      >
                        <h3>{study.title.replace('/', '-')}</h3>
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