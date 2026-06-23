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

export default function MiniCard({ blog, labels }: { blog: BlogPost; labels?: string[] }) {
  const displayLabels = labels ?? blog.tags ?? []
  return (
    <Link
      href={`/${blog.urlPath}`}
      aria-label={blog.title}
      className="group flex min-h-[88px] gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 transition-all duration-200 hover:border-slate-300 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 lg:flex-1"
    >
      {/* Thumbnail */}
      <div className="relative w-[72px] flex-none overflow-hidden rounded-lg">
        {blog.image ? (
          <img
            src={blog.image}
            alt={blog.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-blue-600/15" />
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="min-w-0">
          {displayLabels.length > 0 && (
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
              {displayLabels[0]}
            </span>
          )}
          <h3 className="mt-0.5 line-clamp-2 text-[13.5px] font-bold leading-snug tracking-tight text-slate-900 transition-colors duration-150 group-hover:text-blue-700 dark:text-white">
            {blog.title}
          </h3>
        </div>
        {blog.date && (
          <time
            dateTime={blog.date}
            className="mt-1.5 text-[11.5px] text-slate-500 dark:text-slate-400"
          >
            {formatDate(blog.date)}
          </time>
        )}
      </div>
    </Link>
  )
}
