import Layout from '@/components/Layout';
import computeFields from '@/lib/computeFields';
import clientPromise from '@/lib/mddb';
import { BlogsList, SimpleLayout } from '@portaljs/core';
import * as fs from 'fs';
import { NextSeo } from 'next-seo';

export default function Blog({ blogs }) {
  return (
    <>
      <NextSeo
        title="Blog posts"
        description="Find news and more information about rapidly building rich data portals using a modern frontend framework in the PortalJS blog"
      />
      <Layout>
        <SimpleLayout title="Blog posts">
          <BlogsList blogs={blogs} />
        </SimpleLayout>
      </Layout>
    </>
  );
}

export async function getStaticProps() {
  const mddb = await clientPromise;
  let blogs = await mddb.getFiles({
    folder: 'blog',
    extensions: ['md', 'mdx'],
  });

  //  Temporary, while MarkdownDB doesn't support filetypes
  //  Merges docs that have the "blog" filetype
  let docs = await mddb.getFiles({
    folder: 'docs',
    extensions: ['md', 'mdx'],
  });

  docs = docs.filter((doc) => doc.metadata.filetype === 'blog');

  blogs = [...blogs, ...docs];

  const blogsWithComputedFields = blogs.map(async (blog) => {
    const source = fs.readFileSync(blog.file_path, { encoding: 'utf-8' });

    return await computeFields({
      frontMatter: blog.metadata,
      urlPath: blog.url_path,
      filePath: blog.file_path,
      source,
    });
  });

  const blogList = await Promise.all(blogsWithComputedFields);

  const blogsSorted = blogList.sort(
    (a, b) => new Date(b?.date).getTime() - new Date(a?.date).getTime()
  );

  return {
    props: {
      blogs: blogsSorted,
    },
  };
}
