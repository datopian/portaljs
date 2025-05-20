const config = {
  title: 'PortalJS - The JavaScript framework for data portals.',
  description:
    'PortalJS is a JavaScript framework for rapidly building rich data portal frontends using a modern frontend approach.',
  theme: {
    default: 'dark',
    toggleIcon: '/images/theme-button.svg',
  },
  author: 'Datopian',
  authorLogo: '/datopian-logo.webp',
  authorUrl: 'https://datopian.com/',
  navbarTitle: {
    // logo: "/images/logo.svg",
    text: '🌀 DataHub PortalJS',
    // version: "Alpha",
  },
  navLinks: [
    { name: 'Docs', href: '/docs' },
    // { name: "Components", href: "/docs/components" },
    { name: 'Blog', href: '/blog' },
    { name: 'Howtos', href: '/howtos' },
    { name: 'Guide', href: '/guide' },
    {
      name: 'Showcases',
      href: '/showcases/'
    },
    {
      name: 'Components',
      href: 'https://storybook.portaljs.org',
      target: '_blank',
    },
    {
      name: 'Cloud ☁️',
      href: 'https://portaljs.com/',
      target: '_blank',
      style: 'text-blue-600 dark:text-blue-400'
    },
    // { name: "DL Demo", href: "/data-literate/demo" },
    // { name: "Excel Viewer", href: "/excel-viewer" },
  ],
  footerLinks: [],
  nextSeo: {
    additionalLinkTags: [
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/icon.png', sizes: '120x120' },
    ],
    canonical: 'https://portaljs.com/',
    openGraph: {
      type: 'website',
      title:
        'PortalJS - rapidly build rich data portals using a modern frontend framework.',
      description:
        'PortalJS is a framework for rapidly building rich data portal frontends using a modern frontend approach. PortalJS can be used to present a single dataset or build a full-scale data catalog and portal.',
      locale: 'en_US',
      images: [
        {
          url: '/homepage-screenshot.png', //  TODO
          alt: 'PortalJS - rapidly build rich data portals using a modern frontend framework.',
          width: 1280,
          height: 720,
          type: 'image/jpg',
        },
      ],
    },
    twitter: {
      handle: '@datopian',
      site: 'https://datopian.com/',
      cardType: 'summary_large_image',
    },
  },
  github: 'https://github.com/datopian/datahub',
  discord: 'https://discord.gg/KrRzMKU',
  tableOfContents: true,
  analytics: 'G-96GWZHMH57',
  // editLinkShow: true,
};
export default config;
