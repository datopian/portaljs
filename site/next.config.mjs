import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default {
  // Pin the workspace root so Turbopack doesn't infer it from the parent
  // monorepo lockfile (Next 16 warns when multiple lockfiles are found).
  turbopack: {
    root: projectRoot,
  },
  async redirects() {

    return [
      {
        source: '/blog/create-a-website-from-scratch',
        destination: 'https://flowershow.app/blog/create-a-website-from-scratch',
        permanent: true,
      },
      {
        source: '/blog/edit-a-website-locally',
        destination: 'https://flowershow.app/blog/edit-a-website-locally',
        permanent: true,
      },
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
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
