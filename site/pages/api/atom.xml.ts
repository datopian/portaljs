import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mddb';

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

    // Process blogs with basic metadata (no file reading)
    const blogList = blogs.map((blog) => {
      const metadata = blog.metadata;
      return {
        title: metadata.title,
        description: metadata.description,
        date: metadata.created || metadata.date,
        urlPath: blog.url_path,
        authors: metadata.authors || [],
      };
    });

    const blogsSorted = blogList
      .filter(blog => blog.title && blog.date && blog.urlPath)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const siteUrl = 'https://portaljs.com';
    const feedUrl = `${siteUrl}/api/atom.xml`;
    const updated = blogsSorted.length > 0 ? new Date(blogsSorted[0].date).toISOString() : new Date().toISOString();

    // Generate Atom XML manually
    const atomXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>PortalJS Blog</title>
  <subtitle>Latest insights, updates and stories from the PortalJS team</subtitle>
  <id>${siteUrl}/</id>
  <link href="${siteUrl}" />
  <link href="${feedUrl}" rel="self" />
  <updated>${updated}</updated>
  <author>
    <name>Datopian</name>
    <email>contact@datopian.com</email>
  </author>
  <rights>Copyright ${new Date().getFullYear()} Datopian</rights>
  <generator uri="https://portaljs.com" version="1.0">PortalJS</generator>
${blogsSorted.map(post => {
  if (!post.title || !post.date || !post.urlPath) return '';
  
  const postUrl = `${siteUrl}${post.urlPath}`;
  const postDate = new Date(post.date).toISOString();
  const author = post.authors && post.authors.length > 0 ? post.authors[0] : 'Datopian';
  const description = post.description || 'Read more...';
  
  return `  <entry>
    <title>${escapeXml(post.title)}</title>
    <id>${postUrl}</id>
    <link href="${postUrl}" />
    <updated>${postDate}</updated>
    <published>${postDate}</published>
    <author>
      <name>${escapeXml(author)}</name>
    </author>
    <summary type="html">${escapeXml(description)}</summary>
  </entry>`;
}).filter(Boolean).join('\n')}
</feed>`;

    res.setHeader('Content-Type', 'application/atom+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    res.status(200).send(atomXml);
  } catch (error) {
    console.error('Error generating Atom feed:', error);
    res.status(500).json({ error: 'Failed to generate Atom feed' });
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}