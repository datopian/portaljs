import { useState } from 'react'
import Layout from '@/components/Layout'
import computeFields from '@/lib/computeFields'
import clientPromise from '@/lib/mddb'
import * as fs from 'fs'
import { BlogStructuredData } from '@/components/schema/BlogStructuredData'
import FeaturedBlogPost from '@/components/blog/FeaturedBlogPost'
import MiniCard from '@/components/blog/MiniCard'
import BlogCard from '@/components/blog/BlogCard'

const GRID_PAGE_SIZE = 9

// ─────────────────────────────────────────────────────────────────────────────
// FEATURED POSTS — edit these 4 slugs to control the hero cluster at the top
// of the blog page. The order matters:
//
//   Position 1 → large card on the left  (most prominent)
//   Position 2 → top mini card on the right
//   Position 3 → middle mini card on the right
//   Position 4 → bottom mini card on the right
//
// How to find a post's slug: it's the last part of the URL.
//   e.g. /blog/my-post-title  →  slug is  my-post-title
//
// All other posts appear in the grid below the hero cluster as usual.
// ─────────────────────────────────────────────────────────────────────────────
const FEATURED_SLUGS = [
  'civic-data-portal-examples',                                          // Position 1 — large card
  'talk-to-your-data-portal-in-plain-english-introducing-queryless-ai', // Position 2 — mini top
  'portaljs-cloud-apis',                                                 // Position 3 — mini middle
  'portaljs-cloud-geospatial',                                           // Position 4 — mini bottom
]

// Human-readable label for each segment ID (no hyphens, proper casing)
const SEGMENT_DISPLAY: Record<string, string> = {
  dev: 'Open Source',
  cloud: 'PortalJS Cloud',
  ckan: 'CKAN',
  ai: 'AI Integration',
  data: 'Open Data',
}

// Per-post label overrides — full curated list
const LABEL_OVERRIDES: Record<string, string[]> = {
  // AI Integration
  'talk-to-your-data-portal-in-plain-english-introducing-queryless-ai': ['PortalJS Cloud', 'AI Integration'],
  'mcp-server-ai-assistants-to-improve-data-portals':                  ['PortalJS', 'AI Integration'],
  'supercharging-data-portals-with-the-portaljs-mcp-server':           ['PortalJS', 'AI Integration'],
  // PortalJS Cloud + Tutorial
  'keep-your-portal-data-fresh-a-hands-on-guide-to-the-portaljs-cloud-api': ['PortalJS Cloud', 'Tutorial'],
  // PortalJS open-source
  'turning-openmetadata-into-a-user-friendly-data-portal-with-portaljs': ['PortalJS', 'Tutorial'],
  'enhancing-geospatial-data-visualization-with-portaljs':              ['PortalJS', 'Tutorial'],
  'the-open-spending-revamp-behind-the-scenes':                         ['PortalJS', 'Case Study'],
  'why-portaljs-is-the-future-of-decoupled-frontend-for-data-portals':  ['PortalJS'],
  // CKAN
  'why-we-decoupled-CKAN-frontend':                                     ['PortalJS', 'CKAN'],
  'why-NASA-and-anyone-using-CKAN-should-consider-a-decoupled-front-end-with-PortalJS': ['CKAN'],
  'how-we-rebuilt-a-legacy-ckan-portal-into-a-static-read-only-site-with-portaljs': ['CKAN', 'PortalJS', 'Tutorial'],
  'ckan-resource-uploads-via-api':                                      ['CKAN', 'Tutorial'],
  'example-ckan-2021':                                                  ['CKAN', 'PortalJS', 'Tutorial'],
  // Open Data
  'basics-of-metadata-how-it-helps-to-understand-your-data':           ['Open Data', 'Tutorial'],
  'frictionless-specs-european-commission':                             ['Open Data', 'Case Study'],
  // Misc
  'summer-updates-2023':                                                ['Open Source'],
}

// Curated segment map: post slug → segment IDs
// Slug = last part of urlPath (e.g. "blog/portaljs-cloud-apis" → "portaljs-cloud-apis")
const CATEGORY_MAP: Record<string, string[]> = {
  'basics-of-metadata-how-it-helps-to-understand-your-data': ['data'],
  'ckan-resource-uploads-via-api': ['dev', 'ckan'],
  'ckan-vs-portaljs-cloud': ['ckan', 'cloud'],
  'create-a-simple-catalog-of-anything-using-markdown': ['dev'],
  'effortless-user-management-portaljs': ['cloud'],
  'enhancing-geospatial-data-visualization-with-portaljs': ['dev'],
  'example-ckan-2021': ['ckan', 'dev'],
  'frictionless-specs-european-commission': ['data'],
  'generate-an-interactive-webpage-from-csv-data-and-markdown': ['dev'],
  'how-rich-metadata-powers-data-discovery-in-modern-data-catalogs': ['data'],
  'how-to-reduce-data-portal-costs-by-90-percent': ['cloud'],
  'how-we-rebuilt-a-legacy-ckan-portal-into-a-static-read-only-site-with-portaljs': ['dev', 'ckan'],
  'introducing-visualizations-in-portaljs-cloud': ['cloud'],
  'keep-your-portal-data-fresh-a-hands-on-guide-to-the-portaljs-cloud-api': ['cloud'],
  'making-portalJS-cloud-admin-panel-accessible': ['cloud'],
  'markdowndb-basics-tutorial-2023': ['dev'],
  'markdowndb-launch': ['dev'],
  'mcp-server-ai-assistants-to-improve-data-portals': ['ai'],
  'portaljs-cloud-apis': ['cloud'],
  'portaljs-cloud-frontend-customization': ['cloud'],
  'portaljs-cloud-geospatial': ['cloud'],
  'portaljs-cloud-private-datasets': ['cloud'],
  'summer-updates-2023': ['dev'],
  'supercharging-data-portals-with-the-portaljs-mcp-server': ['ai', 'dev'],
  'talk-to-your-data-portal-in-plain-english-introducing-queryless-ai': ['ai', 'cloud'],
  'the-metadata-standards-landscape-making-data-discoverable-across-organizations': ['data'],
  'the-new-look-of-portaljs-cloud': ['cloud'],
  'the-open-spending-revamp-behind-the-scenes': ['dev'],
  'turning-openmetadata-into-a-user-friendly-data-portal-with-portaljs': ['dev'],
  'why-NASA-and-anyone-using-CKAN-should-consider-a-decoupled-front-end-with-PortalJS': ['ckan', 'dev'],
  'why-portaljs-is-the-future-of-decoupled-frontend-for-data-portals': ['dev'],
  'why-we-decoupled-CKAN-frontend': ['ckan', 'dev'],
}

const SEGMENTS = [
  { id: 'all', label: 'All' },
  { id: 'dev', label: 'PortalJS', icon: 'dev' },
  { id: 'cloud', label: 'PortalJS Cloud', icon: 'cloud' },
  { id: 'ckan', label: 'CKAN' },
  { id: 'ai', label: 'AI Integration' },
  { id: 'data', label: 'Open Data' },
]

function getPostSlug(post: any): string {
  return post.urlPath?.split('/').pop() ?? ''
}

function getPostSegments(post: any): string[] {
  return CATEGORY_MAP[getPostSlug(post)] ?? []
}

function getBlogLabels(post: any): string[] {
  const slug = getPostSlug(post)
  if (LABEL_OVERRIDES[slug]) return LABEL_OVERRIDES[slug]
  const segments = CATEGORY_MAP[slug] ?? []
  return segments.map((s) => SEGMENT_DISPLAY[s]).filter(Boolean)
}

function SegmentIcon({ id }: { id: string }) {
  if (id === 'dev') {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
        <path d="M5 4L1 8l4 4M11 4l4 4-4 4M9 2l-2 12" />
      </svg>
    )
  }
  if (id === 'cloud') {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
        <path d="M12.5 10a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 0-4.95-.5A3 3 0 1 0 3.5 10h9Z" />
      </svg>
    )
  }
  return null
}

export default function Blog({ blogs }) {
  const [activeSegment, setActiveSegment] = useState('all')
  const [visibleCount, setVisibleCount] = useState(GRID_PAGE_SIZE)

  const handleSegmentChange = (id: string) => {
    setActiveSegment(id)
    setVisibleCount(GRID_PAGE_SIZE)
  }

  // Hero cluster: driven by FEATURED_SLUGS
  const featuredSet = new Set(FEATURED_SLUGS)
  const featuredPosts = FEATURED_SLUGS.map((slug) =>
    blogs.find((b) => getPostSlug(b) === slug)
  ).filter(Boolean)
  const [featured, ...miniPosts] = featuredPosts

  // Grid: all posts NOT in the hero cluster (filtered by segment when active)
  const nonFeatured = blogs.filter((b) => !featuredSet.has(getPostSlug(b)))
  const gridSource =
    activeSegment === 'all'
      ? nonFeatured
      : blogs.filter((b) => getPostSegments(b).includes(activeSegment))

  const gridPosts = gridSource.slice(0, visibleCount)
  const hasMore = gridSource.length > visibleCount

  return (
    <>
      <BlogStructuredData blogs={blogs} />
      <Layout>
        <div className="mx-auto max-w-8xl px-4 sm:px-8 xl:px-12">
          {/* Page header */}
          <div className="pb-12 pt-16 text-center">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Resources
            </span>
            <h1 className="mt-3.5 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Blog
            </h1>
            <p className="mx-auto mt-3.5 max-w-[42ch] text-lg text-slate-600 dark:text-slate-400">
              Discover insights, updates and stories
            </p>
          </div>

          {/* Hero cluster: 1 big + 3 mini */}
          {featured && (
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[3fr_2fr] lg:gap-5">
              <FeaturedBlogPost blog={featured} labels={getBlogLabels(featured)} />
              {miniPosts.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-3 lg:flex lg:h-full lg:flex-col lg:gap-3">
                  {miniPosts.map((blog) => (
                    <MiniCard key={blog.urlPath} blog={blog} labels={getBlogLabels(blog)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Segment filter */}
          <div className="mt-14">
            <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Browse by topic
            </p>
            <div className="flex flex-wrap gap-2">
              {SEGMENTS.map((seg) => {
                const active = activeSegment === seg.id
                return (
                  <button
                    key={seg.id}
                    onClick={() => handleSegmentChange(seg.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-400'
                    }`}
                  >
                    {seg.icon && <SegmentIcon id={seg.icon} />}
                    {seg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Article grid */}
          {gridPosts.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((blog) => (
                <BlogCard key={blog.urlPath} blog={blog} labels={getBlogLabels(blog)} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-slate-500">
              No articles found in this category yet.
            </p>
          )}

          {/* Load more */}
          {hasMore && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setVisibleCount((c) => c + GRID_PAGE_SIZE)}
                className="inline-flex items-center justify-center rounded-[10px] border border-slate-300 bg-white px-[18px] py-2.5 text-[14.5px] font-semibold text-slate-700 transition-all duration-150 hover:-translate-y-px hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                Load more articles
              </button>
            </div>
          )}

          <div className="pb-16" />
        </div>
      </Layout>
    </>
  )
}

export async function getStaticProps() {
  const mddb = await clientPromise
  let blogs = await mddb.getFiles({
    folder: 'blog',
    extensions: ['md', 'mdx'],
  })

  let docs = await mddb.getFiles({
    folder: 'docs',
    extensions: ['md', 'mdx'],
  })

  docs = docs.filter((doc) => doc.metadata.filetype === 'blog')

  blogs = [...blogs, ...docs]

  const blogsWithComputedFields = blogs.map(async (blog) => {
    const source = fs.readFileSync(blog.file_path, { encoding: 'utf-8' })

    return await computeFields({
      frontMatter: blog.metadata,
      urlPath: blog.url_path,
      filePath: blog.file_path,
      source,
    })
  })

  const blogList = await Promise.all(blogsWithComputedFields)

  const blogsSorted = blogList.sort((a, b) => {
    const dateA = a?.date ? new Date(a.date).getTime() : 0
    const dateB = b?.date ? new Date(b.date).getTime() : 0
    return dateB - dateA
  })

  return {
    props: {
      blogs: blogsSorted,
    },
  }
}
