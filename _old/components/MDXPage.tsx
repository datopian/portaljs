import { MDXRemote } from 'next-mdx-remote';
import { NextSeo } from 'next-seo';
import layouts from 'layouts';
import DocsPagination from './DocsPagination';
import { Hero } from "@portaljs/core";

export default function MDXPage({ source, frontMatter }) {
    const Layout = ({ children }) => {
        const layoutName = frontMatter?.layout || 'default';
        const LayoutComponent = layouts[layoutName];

        return <LayoutComponent {...frontMatter}>{children}</LayoutComponent>;
    };

    return (
        <Layout>
            <MDXRemote {...source} components={{ DocsPagination, NextSeo, Hero }} />
        </Layout>
    );
}
