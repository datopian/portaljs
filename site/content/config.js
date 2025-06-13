const config = {
  title: 'Open-Source Open Data Portal in the Cloud | PortalJS',
  description:
    'PortalJS Cloud is the easiest way to get started with Open Data. Perfect for governments, non-profits, academics, and companies of all sizes.',
  navbarTitle: {
    text: '🌀 PortalJS',
  },
  theme: {
    default: 'dark',
  },
  contentExclude: ['data-literate-demo.md'],
  author: 'Datopian',
  authorLogo: '/static/img/datopian-logo-white.svg',
  authorUrl: 'https://datopian.com/',
  navLinks: [
    {
      name: 'Showcase',
      href: '/showcase',
    },
    {
      name: 'Integrations',
      subItems: [
        {
          name: 'CKAN',
          href: '/ckan',
        },
        {
          name: 'OpenMetadata',
          href: '/openmetadata',
        },
        {
          name: 'Git (coming soon)',
          href: '#',
          disabled: true,
          style: 'whitespace-nowrap',
        },
      ],
    },
    {
      name: 'Compare',
      subItems: [
        {
          name: 'Overview',
          href: '/compare',
        },
        {
          name: 'OpenDataSoft',
          href: '/compare/opendatasoft',
        },
        {
          name: 'CKAN',
          href: '#',
          disabled: true,
        },
        {
          name: 'Socrata',
          href: '#',
          disabled: true,
        },
        {
          name: 'ArcGIS',
          href: '#',
          disabled: true,
        },
        {
          name: 'DKAN',
          href: '#',
          disabled: true,
        },
        {
          name: 'Dataverse (Harvard)',
          href: '#',
          disabled: true,
        },
        {
          name: 'Custom Solution',
          href: '#',
          disabled: true,
        },
      ],
    },
    {
      name: 'Resources',
      subItems: [
        {
          name: 'Blog',
          href: '/blog',
        },
        {
          name: 'FAQ',
          href: '/faq',
        },
        {
          name: 'Partners',
          href: '/partners',
        },
      ],
    },
    {
      name: 'Pricing',
      href: '/pricing',
    },
    {
      name: 'Docs',
      href: '/opensource/docs',
    },
    {
      name: 'Open source 🌐',
      href: '/opensource',
      target: '_blank',
      style: 'text-blue-400 ',
    },
  ],
  footerLinks: [
    {
      name: 'LINKS',
      subItems: [
        { href: '/', name: 'Home' },
        { href: '/partners', name: 'Partners' },
      ],
    },
    {
      name: 'Contact',
      subItems: [
        { href: 'mailto:contact@datopian.com', name: 'contact@datopian.com' },
      ],
    },
  ],
  nextSeo: {
    openGraph: {
      additionalLinkTags: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/icon.png', sizes: '120x120' },
      ],
      images: [
        {
          url: 'https://portaljs.com/static/img/seo.webp',
          alt: 'PortalJS Cloud',
          width: 1280,
          height: 720,
          type: 'image/webp',
        },
      ],
      description:
        'PortalJS Cloud is the easiest way to get started with Open Data. Perfect for governments, non-profits, academics, and companies of all sizes.',
    },
    twitter: {
      handle: '@datopian',
      site: 'https://datopian.com/',
      cardType: 'summary_large_image',
    },
  },
  showToc: true,
  analytics: 'G-48FQ78FSGJ',
  github: 'https://github.com/datopian/portaljs',
  discord: 'https://discord.com/invite/KrRzMKU ',
};
export default config;
