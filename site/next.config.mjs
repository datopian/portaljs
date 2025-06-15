export default {
  async redirects() {

    return [
      {
        source: '/showcases',
        has: [
          {
            type: 'host',
            value: 'portaljs.org',
          },
        ],
        destination: 'https://www.portaljs.com/showcase',
        permanent: true,
      },
      {
        source: '/howtos/drd',
        has: [
          {
            type: 'host',
            value: 'portaljs.org',
          },
        ],
        destination: 'https://www.portaljs.com/opensource/howtos/data-rich-documents',
        permanent: true,
      },
      {
        source: '/showcase',
        destination: '/case-studies',
        permanent: true,
      },
      {
        source: '/casestudies',
        destination: '/case-studies',
        permanent: true,
      },
      {
        source: '/casestudies/:slug*',
        destination: '/case-studies/:slug*',
        permanent: true,
      },
      {
        source: '/docs',
        destination: '/opensource/docs',
        permanent: true,  // 301 redirect; set to false for a 302
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.infrastructureLogging = {
      level: "error",
    };
    return config;
  },
};
