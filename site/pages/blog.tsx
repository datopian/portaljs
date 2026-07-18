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
  'portaljs-is-now-ai-native',                                            // Position 1 — large card
  'rebuilt-city-of-kyle-open-data-portal-in-30-minutes-with-claude-code', // Position 2 — mini top
  'scaling-portaljs-data-with-giftless-and-r2',                           // Position 3 — mini middle
  'talk-to-your-data-portal-in-plain-english-introducing-queryless-ai',   // Position 4 — mini bottom
]

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES — the ONLY labels a blog post can have. This is a closed set: a
// post shows a label chip and appears under a filter button ONLY for categories
// listed here. Anything else (typos, ad-hoc tags) is ignored, and the build
// fails if a post declares a category not in this list.
//
// To categorize a post, add a `categories:` list to its frontmatter using these
// exact strings, e.g.
//
//   categories:
//     - PortalJS
//     - AI Integration
//
// Frontmatter is the source of truth. POST_CATEGORIES below is only a fallback
// for older posts that don't declare categories in their frontmatter yet.
//
// Adding a new category = adding it here (and, optionally, an icon in
// CategoryIcon). Keep the list short and meaningful.
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'PortalJS',
  'PortalJS Cloud',
  'CKAN',
  'AI Integration',
  'Open Data',
] as const
type Category = (typeof CATEGORIES)[number]
const CATEGORY_SET = new Set<string>(CATEGORIES)

// Fallback categories for posts that don't declare `categories:` in frontmatter.
// Values MUST be exact entries from CATEGORIES above. Frontmatter wins when set.
const POST_CATEGORIES: Record<string, Category[]> = {
  'basics-of-metadata-how-it-helps-to-understand-your-data': ['Open Data'],
  'ckan-resource-uploads-via-api': ['CKAN', 'PortalJS'],
  'ckan-vs-portaljs-cloud': ['CKAN', 'PortalJS Cloud'],
  'civic-data-portal-examples': ['PortalJS Cloud', 'Open Data'],
  'create-a-simple-catalog-of-anything-using-markdown': ['PortalJS'],
  'effortless-user-management-portaljs': ['PortalJS Cloud'],
  'enhancing-geospatial-data-visualization-with-portaljs': ['PortalJS'],
  'example-ckan-2021': ['CKAN', 'PortalJS'],
  'frictionless-specs-european-commission': ['Open Data'],
  'generate-an-interactive-webpage-from-csv-data-and-markdown': ['PortalJS'],
  'how-rich-metadata-powers-data-discovery-in-modern-data-catalogs': ['Open Data'],
  'how-to-reduce-data-portal-costs-by-90-percent': ['PortalJS Cloud'],
  'how-we-rebuilt-a-legacy-ckan-portal-into-a-static-read-only-site-with-portaljs': ['CKAN', 'PortalJS'],
  'introducing-visualizations-in-portaljs-cloud': ['PortalJS Cloud'],
  'keep-your-portal-data-fresh-a-hands-on-guide-to-the-portaljs-cloud-api': ['PortalJS Cloud'],
  'making-portalJS-cloud-admin-panel-accessible': ['PortalJS Cloud'],
  'markdowndb-basics-tutorial-2023': ['PortalJS'],
  'markdowndb-launch': ['PortalJS'],
  'mcp-server-ai-assistants-to-improve-data-portals': ['PortalJS', 'AI Integration'],
  'portaljs-cloud-apis': ['PortalJS Cloud'],
  'portaljs-cloud-frontend-customization': ['PortalJS Cloud'],
  'portaljs-cloud-geospatial': ['PortalJS Cloud'],
  'portaljs-cloud-private-datasets': ['PortalJS Cloud'],
  'portaljs-is-now-ai-native': ['PortalJS', 'AI Integration'],
  'portaljs-skills-launch': ['PortalJS', 'AI Integration'],
  'rebuilt-city-of-kyle-open-data-portal-in-30-minutes-with-claude-code': ['PortalJS'],
  'scaling-portaljs-data-with-giftless-and-r2': ['PortalJS'],
  'summer-updates-2023': ['PortalJS'],
  'supercharging-data-portals-with-the-portaljs-mcp-server': ['PortalJS', 'AI Integration'],
  'talk-to-your-data-portal-in-plain-english-introducing-queryless-ai': ['PortalJS Cloud', 'AI Integration'],
  'the-metadata-standards-landscape-making-data-discoverable-across-organizations': ['Open Data'],
  'the-new-look-of-portaljs-cloud': ['PortalJS Cloud'],
  'the-open-spending-revamp-behind-the-scenes': ['PortalJS'],
  'turning-openmetadata-into-a-user-friendly-data-portal-with-portaljs': ['PortalJS'],
  'why-NASA-and-anyone-using-CKAN-should-consider-a-decoupled-front-end-with-PortalJS': ['CKAN', 'PortalJS'],
  'why-portaljs-is-the-future-of-decoupled-frontend-for-data-portals': ['PortalJS'],
  'why-we-decoupled-CKAN-frontend': ['PortalJS', 'CKAN'],
}

// Filter buttons at the top of the page — always "All" plus the category list,
// so filters and labels can never drift apart.
const FILTERS: Array<{ id: string; label: string; icon?: string }> = [
  { id: 'all', label: 'All' },
  { id: 'PortalJS', label: 'PortalJS', icon: 'dev' },
  { id: 'PortalJS Cloud', label: 'PortalJS Cloud', icon: 'cloud' },
  { id: 'CKAN', label: 'CKAN' },
  { id: 'AI Integration', label: 'AI Integration' },
  { id: 'Open Data', label: 'Open Data' },
]

function getPostSlug(post: any): string {
  return post.urlPath?.split('/').pop() ?? ''
}

// A post's categories: frontmatter `categories:` if present, otherwise the
// curated POST_CATEGORIES fallback. Always filtered to the closed CATEGORIES
// set so nothing outside the vocabulary can ever render.
function getPostCategories(post: any): Category[] {
  const declared: string[] = post.categories ?? POST_CATEGORIES[getPostSlug(post)] ?? []
  return declared.filter((c): c is Category => CATEGORY_SET.has(c))
}

function CategoryIcon({ id }: { id: string }) {
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
  const [activeCategory, setActiveCategory] = useState('all')
  const [visibleCount, setVisibleCount] = useState(GRID_PAGE_SIZE)

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id)
    setVisibleCount(GRID_PAGE_SIZE)
  }

  // Hero cluster: driven by FEATURED_SLUGS
  const featuredSet = new Set(FEATURED_SLUGS)
  const featuredPosts = FEATURED_SLUGS.map((slug) =>
    blogs.find((b) => getPostSlug(b) === slug)
  ).filter(Boolean)
  const [featured, ...miniPosts] = featuredPosts

  // Grid: all posts NOT in the hero cluster (filtered by category when active)
  const nonFeatured = blogs.filter((b) => !featuredSet.has(getPostSlug(b)))
  const gridSource =
    activeCategory === 'all'
      ? nonFeatured
      : blogs.filter((b) => getPostCategories(b).includes(activeCategory as Category))

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
              <FeaturedBlogPost blog={featured} labels={getPostCategories(featured)} />
              {miniPosts.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-3 lg:flex lg:h-full lg:flex-col lg:gap-3">
                  {miniPosts.map((blog) => (
                    <MiniCard key={blog.urlPath} blog={blog} labels={getPostCategories(blog)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Category filter */}
          <div className="mt-14">
            <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Browse by topic
            </p>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => {
                const active = activeCategory === filter.id
                return (
                  <button
                    key={filter.id}
                    onClick={() => handleCategoryChange(filter.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-400'
                    }`}
                  >
                    {filter.icon && <CategoryIcon id={filter.icon} />}
                    {filter.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Article grid */}
          {gridPosts.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((blog) => (
                <BlogCard key={blog.urlPath} blog={blog} labels={getPostCategories(blog)} />
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

  // Guard the closed vocabulary: a post may only declare categories from the
  // CATEGORIES list. A typo or a retired category fails the build loudly rather
  // than silently rendering nothing.
  for (const blog of blogList) {
    if (Array.isArray(blog?.categories)) {
      const invalid = blog.categories.filter((c: string) => !CATEGORY_SET.has(c))
      if (invalid.length) {
        throw new Error(
          `Blog post "${blog.urlPath}" has invalid categories: ${invalid.join(', ')}. ` +
            `Allowed categories are: ${CATEGORIES.join(', ')}.`
        )
      }
    }
  }

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
