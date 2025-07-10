const RSS = require('rss');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');

async function generateFeeds() {
  try {
    console.log('Generating RSS/Atom feeds...');
    
    // Read blog posts directly from filesystem
    const contentDir = path.join(process.cwd(), 'content');
    const blogPattern = path.join(contentDir, 'blog/**/*.{md,mdx}');
    const docsPattern = path.join(contentDir, 'docs/**/*.{md,mdx}');
    
    const blogFiles = glob.sync(blogPattern);
    const docFiles = glob.sync(docsPattern);
    
    const allFiles = [...blogFiles, ...docFiles];
    
    const blogList = [];
    
    for (const filePath of allFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = matter(content);
        const metadata = parsed.data;
        
        // Skip if not a blog post (for docs files)
        if (filePath.includes('/docs/') && metadata.filetype !== 'blog') {
          continue;
        }
        
        // Generate URL path
        const relativePath = path.relative(contentDir, filePath);
        const urlPath = '/' + relativePath
          .replace(/\.(md|mdx)$/, '')
          .replace(/\\/g, '/');
        
        if (metadata.title && (metadata.created || metadata.date)) {
          blogList.push({
            title: metadata.title,
            description: metadata.description,
            content: parsed.content, // Full markdown content
            date: metadata.created || metadata.date,
            urlPath: urlPath,
            authors: metadata.authors || [],
          });
        }
      } catch (error) {
        console.warn(`Failed to process ${filePath}:`, error.message);
      }
    }

    const blogsSorted = blogList
      .filter(blog => blog.title && blog.date && blog.urlPath)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Generate RSS feed
    const feed = new RSS({
      title: 'PortalJS Blog',
      description: 'Latest insights, updates and stories from the PortalJS team',
      feed_url: 'https://portaljs.com/rss.xml',
      site_url: 'https://portaljs.com',
      managingEditor: 'contact@datopian.com (Datopian)',
      webMaster: 'contact@datopian.com (Datopian)',
      copyright: `Copyright ${new Date().getFullYear()} Datopian`,
      language: 'en-US',
      ttl: 60,
      pubDate: new Date(),
    });

    // Add blog posts to RSS feed
    blogsSorted.forEach((post) => {
      feed.item({
        title: post.title,
        description: post.content || post.description || 'Read more...', // Full content for cross-posting
        url: `https://portaljs.com${post.urlPath}`,
        guid: `https://portaljs.com${post.urlPath}`,
        date: new Date(post.date),
        author: post.authors && post.authors.length > 0 ? post.authors[0] : 'Datopian',
      });
    });

    // Generate Atom feed
    const siteUrl = 'https://portaljs.com';
    const updated = blogsSorted.length > 0 ? new Date(blogsSorted[0].date).toISOString() : new Date().toISOString();

    const atomXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>PortalJS Blog</title>
  <subtitle>Latest insights, updates and stories from the PortalJS team</subtitle>
  <id>${siteUrl}/</id>
  <link href="${siteUrl}" />
  <link href="${siteUrl}/atom.xml" rel="self" />
  <updated>${updated}</updated>
  <author>
    <name>Datopian</name>
    <email>contact@datopian.com</email>
  </author>
  <rights>Copyright ${new Date().getFullYear()} Datopian</rights>
  <generator uri="https://portaljs.com" version="1.0">PortalJS</generator>
${blogsSorted.map(post => {
  const postUrl = `${siteUrl}${post.urlPath}`;
  const postDate = new Date(post.date).toISOString();
  const author = post.authors && post.authors.length > 0 ? post.authors[0] : 'Datopian';
  const content = post.content || post.description || 'Read more...';
  
  return `  <entry>
    <title>${escapeXml(post.title)}</title>
    <id>${postUrl}</id>
    <link href="${postUrl}" />
    <updated>${postDate}</updated>
    <published>${postDate}</published>
    <author>
      <name>${escapeXml(author)}</name>
    </author>
    <content type="html">${escapeXml(content)}</content>
    <summary type="html">${escapeXml(post.description || 'Read more...')}</summary>
  </entry>`;
}).join('\n')}
</feed>`;

    // Write feeds to public directory
    const publicDir = path.join(process.cwd(), 'public');
    fs.writeFileSync(path.join(publicDir, 'rss.xml'), feed.xml());
    fs.writeFileSync(path.join(publicDir, 'atom.xml'), atomXml);

    console.log('✅ RSS and Atom feeds generated successfully');
    console.log(`📄 Generated ${blogsSorted.length} blog posts in feeds`);
  } catch (error) {
    console.error('❌ Error generating feeds:', error);
    process.exit(1);
  }
}

function escapeXml(unsafe) {
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

generateFeeds();