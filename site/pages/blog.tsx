import { useState } from 'react'
import Layout from '@/components/Layout'
import computeFields from '@/lib/computeFields'
import clientPromise from '@/lib/mddb'
import * as fs from 'fs'
import { BlogStructuredData } from '@/components/schema/BlogStructuredData'
import FeaturedBlogPost from '@/components/blog/FeaturedBlogPost'
import MiniCard from '@/components/blog/MiniCard'
import BlogCard from '@/components/blog/BlogCard'
import { BLOG_CATEGORIES, parseBlogCategories } from '@/lib/blogCategories'

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

// Filter buttons: "All" plus the category vocabulary. Chips and filters read
// the same list (site/lib/blogCategories.ts), so they can never drift apart.
// To categorize a post, set `categories:` in its frontmatter (see site/CLAUDE.md).
const FILTERS: Array<{ id: string; label: string; icon?: string }> = [
  { id: 'all', label: 'All' },
  ...BLOG_CATEGORIES.map((c) => ({
    id: c.label,
    label: c.label,
    icon: 'icon' in c ? c.icon : undefined,
  })),
]

function getPostSlug(post: any): string {
  return post.urlPath?.split('/').pop() ?? ''
}

// A post's categories from its frontmatter `categories:`, already validated and
// put in vocabulary order by getStaticProps. No categories → no chips/filters.
function getPostCategories(post: any): string[] {
  return post.categories ?? []
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
      : blogs.filter((b) => getPostCategories(b).includes(activeCategory))

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

    const fields = await computeFields({
      frontMatter: blog.metadata,
      urlPath: blog.url_path,
      filePath: blog.file_path,
      source,
    })

    // Throws (failing the build) on a category outside lib/blogCategories.ts
    return {
      ...fields,
      categories: parseBlogCategories(blog.metadata.categories, blog.file_path),
    }
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
