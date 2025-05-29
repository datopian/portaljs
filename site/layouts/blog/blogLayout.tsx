import { formatDate } from '@/lib/common'
import { Avatar } from '@/components/Avatar'
import { NextSeo } from 'next-seo'
import siteConfig from '../../config/siteConfig'

type Props = any

export const BlogLayout: React.FC<Props> = ({ children, ...frontMatter }) => {
  const { title, metatitle, date, authors, description, metadescription, image } = frontMatter

  return (
    <>
      <NextSeo
        title={ metatitle || title }
        description={ metadescription || description }
        openGraph={{
          title: metatitle || title,
          description: metadescription || description,
          images: [
            {
              url: image ? `https://www.portaljs.com` + image : siteConfig.nextSeo.openGraph.images[0].url,
              alt: title,
            },
          ],
          type: 'article',
        }}
        twitter={{
          cardType: 'summary_large_image',
          site: '@PortalJS_',
        }}
      />
      <article className="docs prose prose-a:text-primary dark:prose-a:text-primary-dark prose-strong:text-primary dark:prose-strong:text-primary-dark prose-code:text-primary dark:prose-code:text-primary-dark prose-headings:text-primary dark:prose-headings:text-primary-dark prose text-primary dark:text-primary-dark prose-headings:font-headings dark:prose-invert prose-a:break-words mx-auto p-6">
        <header>
          <div className="mb-4 flex-col items-center">
            {title && <h1 className="flex justify-center mb-0">{title}</h1>}
            {date && (
              <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500 flex justify-left">
                <time dateTime={date}>{formatDate(date)}</time>
              </p>
            )}
            {authors && (
              <div className="flex flex-wrap not-prose items-center justify-left gap-4">
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
          </div>
        </header>
        <section>{children}</section>
      </article>
    </>
  )
}
