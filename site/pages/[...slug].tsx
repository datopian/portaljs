import fs from 'fs'
import parse from '../lib/markdown.mjs'
import MDXPage from '../components/MDXPage'
import clientPromise from '@/lib/mddb'
import Layout from 'components/Layout'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router.js'
import { NavGroup, NavItem, collectHeadings } from '@portaljs/core'
import { GetStaticProps, GetStaticPropsResult } from 'next'
import { CustomAppProps } from './_app.jsx'
import computeFields from '@/lib/computeFields'
import { getAuthorsDetails } from '@/lib/getAuthorsDetails'
import JSONLD from '@/components/JSONLD'
import { BreadcrumbJsonLd, FAQPageJsonLd, NextSeo } from 'next-seo'
import siteConfig from '@/config/siteConfig'

export default function Page({ source, meta, sidebarTree }) {
  source = JSON.parse(source)
  const router = useRouter()
  const [tableOfContents, setTableOfContents] = useState([])

  useEffect(() => {
    const headingNodes = document.querySelectorAll(
      'h2,h3'
    ) as NodeListOf<HTMLHeadingElement>
    const toc = collectHeadings(headingNodes)
    setTableOfContents(toc ?? [])
  }, [router.asPath]) // update table of contents on route change with next/link

  const urlSegments = meta.urlPath.split('/')
  const breadcrumbs = urlSegments.map((segment, i) => {
    return {
      position: i + 1,
      name: i == urlSegments.length - 1 ? meta.title || segment : segment,
      item: '/' + urlSegments.slice(0, i + 1).join('/'),
    }
  })
  const canonicalUrl = `https://www.portaljs.com/${meta.urlPath}`
  const title = meta.metatitle || meta.title
  const description = meta.metadescription || meta.description
  const ogImage = meta.image || (Array.isArray(meta.images) && meta.images[0])
  const image = ogImage ? `https://www.portaljs.com${ogImage}` : siteConfig.nextSeo.openGraph.images[0].url

  return (
    <>
      <NextSeo
        title={title}
        description={description}
        canonical={canonicalUrl}
        openGraph={{
          url: canonicalUrl,
          title,
          description,
          type: 'article',
          article: {
            publishedTime: meta.date,
            authors: meta.authors?.map(a => a.name) || "PortalJS Cloud"
          },
          images: [
            {
              url: image,
              alt: title,
            },
          ],
        }}
        twitter={{
          cardType: 'summary_large_image',
          site: '@PortalJS_',
        }}
      />
      <BreadcrumbJsonLd itemListElements={breadcrumbs} />
      <JSONLD meta={meta} source={source.compiledSource} />
      {meta.faqs && meta.faqs.length > 0 && (
        <FAQPageJsonLd
          mainEntity={meta.faqs.map(faq => ({
            questionName: faq.question,
            acceptedAnswerText: faq.answer
          }))}
        />
      )}

      <Layout
        tableOfContents={tableOfContents}
        title={meta.title}
        description={meta.description}
        sidebarTree={sidebarTree}
        urlPath={meta.urlPath}
        layout={meta.layout}
      >
        <MDXPage source={source} frontMatter={meta} />
      </Layout>
    </>
  )
}

interface SlugPageProps extends CustomAppProps {
  source: any
}

export const getStaticProps: GetStaticProps = async ({
  params,
}): Promise<GetStaticPropsResult<SlugPageProps>> => {
  const urlPath = params?.slug ? (params.slug as string[]).join('/') : '/'

  const mddb = await clientPromise
  const dbFile = await mddb.getFileByUrl(urlPath)
  const filePath = dbFile!.file_path
  const frontMatter = dbFile!.metadata ?? {}

  // Temporary, so that blogs work properly
  if (dbFile.metadata.filetype === 'blog') {
    frontMatter.layout = 'blog'
    frontMatter.authorsDetails = await getAuthorsDetails(
      dbFile.metadata.authors
    )
  }

  if (dbFile.metadata.filetype === 'casestudy') {
    frontMatter.layout = 'casestudy'
    frontMatter.showSidebar = false
    frontMatter.authorsDetails = await getAuthorsDetails(
      dbFile.metadata.authors
    )
  }

  if (dbFile.url_path.startsWith('opensource')) {
    frontMatter.showSidebar = true
    frontMatter.sidebarTreeFile = 'content/assets/sidebar.json'
  }
  const source = fs.readFileSync(filePath, { encoding: 'utf-8' })
  const { mdxSource } = await parse(source, 'mdx', {})

  // TODO temporary replacement for contentlayer's computedFields
  const frontMatterWithComputedFields = await computeFields({
    frontMatter,
    urlPath,
    filePath,
    source,
  })

  let sidebarTree: Array<NavGroup | NavItem> = []

  if (frontMatterWithComputedFields?.showSidebar) {
    let sidebarTreeFile = frontMatterWithComputedFields?.sidebarTreeFile

    if (sidebarTreeFile) {
      const tree = fs.readFileSync(sidebarTreeFile, { encoding: 'utf-8' })
      sidebarTree = JSON.parse(tree)
    } else {
      const allPages = await mddb.getFiles({ extensions: ['md', 'mdx'] })
      const pages = allPages.filter((p) => !p.metadata?.isDraft)
      pages.forEach((page) => {
        addPageToSitemap(page, sidebarTree)
      })
    }
  }

  return {
    props: {
      source: JSON.stringify(mdxSource),
      meta: frontMatterWithComputedFields,
      sidebarTree,
    },
  }
}

export async function getStaticPaths() {
  const mddb = await clientPromise
  let allDocuments = await mddb.getFiles({ extensions: ['md', 'mdx'] })

  const paths = allDocuments
    .filter((page) => page.metadata?.isDraft !== true)
    .map((page) => {
      const parts = page.url_path!.split('/')
      return { params: { slug: parts } }
    })

  return {
    paths,
    fallback: false,
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function addPageToSitemap(page: any, sitemap: Array<NavGroup | NavItem>) {
  const urlParts = page.url_path!.split('/').filter((part) => part)
  if (urlParts.length === 0) return
  if (urlParts.length === 1) {
    sitemap.push({
      name: page.metadata?.title || urlParts[0],
      href: page.url_path,
    })
  } else {
    const nestingLevel = urlParts.length - 1
    let currArray: Array<NavItem | NavGroup> = sitemap

    for (let level = 0; level <= nestingLevel; level++) {
      if (level === nestingLevel) {
        currArray.push({
          name: urlParts[level],
          href: page.url_path,
        })
        continue
      }

      const matchingGroup = currArray
        .filter(isNavGroup)
        .find(
          (group) =>
            group.path !== undefined && page.url_path.startsWith(group.path)
        )
      if (!matchingGroup) {
        const newGroup: NavGroup = {
          name: capitalize(urlParts[level]),
          path: urlParts.slice(0, level + 1).join('/'),
          level,
          children: [],
        }
        currArray.push(newGroup)
        currArray = newGroup.children
      } else {
        currArray = matchingGroup.children
      }
    }
  }
}

function isNavGroup(item: NavItem | NavGroup): item is NavGroup {
  return (item as NavGroup).children !== undefined
}
