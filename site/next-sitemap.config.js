/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://portaljs.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', disallow: '/people' },
      { userAgent: '*', disallow: '/?amp=1' },
    ],
    
  },
  exclude: ['/people*', '/docs*', '/?amp=1'],
};
