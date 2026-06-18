import { Fragment } from 'react'
import Link from 'next/link'

interface Author {
  name: string
  avatar?: string
}

interface BlogPost {
  title: string
  description?: string
  date?: string
  urlPath: string
  image?: string
  tags?: string[]
  authors?: Author[]
  readingTime?: number
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function AuthorAvatar({ author }: { author: Author }) {
  return (
    <span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-[10px] font-bold text-white">
      {author.name.charAt(0).toUpperCase()}
    </span>
  )
}

export default function FeaturedBlogPost({ blog, labels }: { blog: BlogPost; labels?: string[] }) {
  const displayLabels = labels ?? blog.tags ?? []
  return (
    <Link
      href={`/${blog.urlPath}`}
      aria-label={blog.title}
      className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:border-slate-300 hover:shadow-[0_20px_40px_-20px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 lg:flex"
    >
      {/* Image side */}
      <div className="relative aspect-video overflow-hidden lg:aspect-auto lg:w-[58%] lg:flex-none">
        {blog.image ? (
          <img
            src={blog.image}
            alt={blog.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-blue-600/15" />
        )}
      </div>

      {/* Content side */}
      <div className="flex flex-col justify-between p-6 lg:w-[42%] lg:p-10">
        <div>
          {displayLabels.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-x-1 gap-y-1">
              {displayLabels.slice(0, 3).map((label, i) => (
                <Fragment key={label}>
                  {i > 0 && (
                    <span aria-hidden="true" className="font-mono text-[11px] text-blue-400 dark:text-blue-500">·</span>
                  )}
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">
                    {label}
                  </span>
                </Fragment>
              ))}
            </div>
          )}

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 transition-colors duration-150 group-hover:text-blue-700 dark:text-white sm:text-3xl">
            {blog.title}
          </h2>

          {blog.description && (
            <p className="mt-3 line-clamp-4 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
              {blog.description}
            </p>
          )}
        </div>

        <div>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400">
            {blog.authors && blog.authors.length > 0 && (
              <>
                <AuthorAvatar author={blog.authors[0]} />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {blog.authors[0].name}
                </span>
                <span aria-hidden="true">·</span>
              </>
            )}
            {blog.date && (
              <time dateTime={blog.date}>{formatDate(blog.date)}</time>
            )}
            {blog.readingTime && (
              <>
                <span aria-hidden="true">·</span>
                <span>{blog.readingTime} min read</span>
              </>
            )}
          </div>

          <div className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-blue-600 dark:text-blue-400">
            Read article
            <span aria-hidden="true">→</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
