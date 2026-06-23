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

export default function BlogCard({ blog, labels }: { blog: BlogPost; labels?: string[] }) {
  const displayLabels = labels ?? blog.tags ?? []
  return (
    <Link
      href={`/${blog.urlPath}`}
      aria-label={blog.title}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-[3px] hover:border-slate-300 hover:shadow-[0_16px_36px_-20px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
    >
      {/* Image */}
      <div className="relative aspect-video flex-none overflow-hidden">
        {blog.image ? (
          <img
            src={blog.image}
            alt={blog.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/15 to-blue-600/10" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {displayLabels.length > 0 && (
          <div className="mb-2.5 flex flex-wrap items-center gap-x-1 gap-y-1">
            {displayLabels.slice(0, 3).map((label, i) => (
              <Fragment key={label}>
                {i > 0 && (
                  <span aria-hidden="true" className="font-mono text-[10.5px] text-blue-400 dark:text-blue-500">·</span>
                )}
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
                  {label}
                </span>
              </Fragment>
            ))}
          </div>
        )}

        <h3 className="line-clamp-2 text-[17px] font-bold leading-snug tracking-tight text-slate-900 transition-colors duration-150 group-hover:text-blue-700 dark:text-white">
          {blog.title}
        </h3>

        {blog.description && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {blog.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[12.5px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {blog.authors && blog.authors.length > 0 && (
            <>
              <AuthorAvatar author={blog.authors[0]} />
              <span className="truncate font-medium text-slate-600 dark:text-slate-300">
                {blog.authors[0].name}
              </span>
              <span aria-hidden="true" className="flex-none">·</span>
            </>
          )}
          {blog.date && (
            <time dateTime={blog.date} className="flex-none">
              {formatDate(blog.date)}
            </time>
          )}
        </div>
      </div>
    </Link>
  )
}
