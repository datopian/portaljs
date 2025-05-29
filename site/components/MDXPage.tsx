import { MDXRemote } from 'next-mdx-remote'
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
        {children}
      </LayoutComponent>
    )
  }

  return (
    <Layout>
      <MDXRemote
        {...source}
        components={{ DocsPagination, Features, Community, Hero }}
      />
    </Layout>
  )
}
