import Link from 'next/link'
import { formatDate } from '@/lib/common'
import { Avatar } from '@/components/Avatar'
import { FAQ } from '@/components/FAQ'

type Props = any

export const BlogLayout: React.FC<Props> = ({ children, ...frontMatter }) => {
  const { title, date, authors, faqs, image, readingTime, tags } = frontMatter
  return (
    <article className="docs mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">

      {/* Back link */}
      <div className="not-prose mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M10 3L5 8l5 5" />
          </svg>
          Back to blog
        </Link>
      </div>

      {/* Header */}
      <header className="not-prose mb-10">
        {tags && tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
          {date && (
            <time dateTime={date}>{formatDate(date)}</time>
          )}
          {date && readingTime && <span aria-hidden="true">·</span>}
          {readingTime && <span>{readingTime} min read</span>}
        </div>

        {authors && authors.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-4">
            {authors.map(({ name, avatar, urlPath }) => (
              <Avatar
                key={urlPath || name}
                name={name}
                img={avatar}
                href={urlPath ? `/${urlPath}` : undefined}
              />
            ))}
          </div>
        )}
      </header>

      {/* Hero image */}
      {image && (
        <div className="not-prose mb-10 overflow-hidden rounded-2xl">
          <img
            src={image}
            alt={title ?? ''}
            className="w-full object-cover"
          />
        </div>
      )}

      {/* Article body */}
      <div className="prose prose-lg prose-a:text-primary dark:prose-a:text-primary-dark prose-strong:text-primary dark:prose-strong:text-primary-dark prose-code:text-primary dark:prose-code:text-primary-dark prose-headings:text-primary dark:prose-headings:text-primary-dark text-primary dark:text-primary-dark prose-headings:font-headings dark:prose-invert prose-a:break-words max-w-none">
        {children}
      </div>

      {faqs && faqs.length > 0 && (
        <div className="not-prose mt-16">
          <FAQ faqItems={faqs} />
        </div>
      )}
    </article>
  )
}
