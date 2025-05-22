import { MDXRemote } from 'next-mdx-remote'
import { NextSeo } from 'next-seo'
import layouts from '@/layouts'
import DocsPagination from './DocsPagination'
import { Hero } from '@portaljs/core'
import Community from '@/components/home/community'
import Features from '@/components/Features'

export default function MDXPage({ source, frontMatter }) {
  const Layout = ({ children }) => {
    const layoutName = frontMatter.layout || 'docs'
    const LayoutComponent = layouts[layoutName]

    return (
      <LayoutComponent {...frontMatter}>
        <NextSeo
          title={frontMatter?.title}
          description={frontMatter?.description}
          openGraph={{
            title: frontMatter?.title,
            description: frontMatter?.description,
            url: frontMatter?.urlPath,
            images: [
              {
                url: frontMatter?.image,
                alt: frontMatter?.title,
              },
            ],
          }}
        />
        {children}
      </LayoutComponent>
    )
  }

  return (
    <Layout>
      <MDXRemote
        {...source}
        components={{ DocsPagination, NextSeo, Features, Community, Hero }}
      />
    </Layout>
  )
}
