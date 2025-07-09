import { NextApiRequest, NextApiResponse } from 'next';
import RSS from 'rss';
import clientPromise from '@/lib/mddb';
import computeFields from '@/lib/computeFields';
import * as fs from 'fs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const mddb = await clientPromise;
    let blogs = await mddb.getFiles({
      folder: 'blog',
      extensions: ['md', 'mdx'],
    });

    // Temporary, while MarkdownDB doesn't support filetypes
    // Merges docs that have the "blog" filetype
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

    // Create RSS feed
    const feed = new RSS({
      title: 'PortalJS Blog',
      description: 'Latest insights, updates and stories from the PortalJS team',
      feed_url: 'https://portaljs.com/api/rss.xml',
      site_url: 'https://portaljs.com',
      managingEditor: 'contact@datopian.com (Datopian)',
      webMaster: 'contact@datopian.com (Datopian)',
      copyright: `Copyright ${new Date().getFullYear()} Datopian`,
      language: 'en-US',
      ttl: 60,
      pubDate: new Date(),
    });

    // Add blog posts to feed
    blogsSorted.forEach((post) => {
      if (post.title && post.date && post.urlPath) {
        feed.item({
          title: post.title,
          description: post.description || post.excerpt || 'Read more...',
          url: `https://portaljs.com${post.urlPath}`,
          guid: `https://portaljs.com${post.urlPath}`,
          date: new Date(post.date),
          author: post.authors && post.authors.length > 0 ? post.authors[0].name : 'Datopian',
        });
      }
    });

    const xml = feed.xml();

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    res.status(500).json({ error: 'Failed to generate RSS feed' });
  }
}