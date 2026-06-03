import Container from './Container';

const features: { title: string; description: string; icon: string }[] = [
  {
    title: 'Unified sites',
    description:
      'Present data and content in one seamless site, pulling datasets from a DMS (e.g. CKAN) and content from a CMS (e.g. wordpress) with a common internal API',
    icon: '/images/icon-unified-sites.svg',
  },
  {
    title: 'Developer friendly',
    description: 'Built with familiar frontend tech Javascript, React etc',
    icon: '/images/icon-dev-friendly.svg',
  },
  {
    title: 'Batteries included',
    description:
      'Full set of portal components out of the box e.g. catalog search, dataset showcase, blog etc.',
    icon: '/images/icon-batteries-included.svg',
  },
  {
    title: 'Easy to theme and customize',
    description:
      'installable themes, use standard CSS and React+CSS tooling. Add new routes quickly.',
    icon: '/images/icon-easy-to-theme.svg',
  },
  {
    title: 'Extensible',
    description: 'quickly extend and develop/import your own React components',
    icon: '/images/icon-extensible.svg',
  },
  {
    title: 'Well documented',
    description:
      'full set of documentation plus the documentation of NextJS and Apollo.',
    icon: '/images/icon-well-documented.svg',
  },
];

export default function Features() {
  return (
    <Container>
      <h2 className="text-3xl font-bold text-primary dark:text-primary-dark" id="how-portaljs-works">
        How PortalJS works?
      </h2>
      <p className="text-lg mt-2">
        PortalJS is built in JavaScript and React on top of the popular Next.js
        framework, assuming a "decoupled" approach where the frontend is a
        separate service from the backend and interacts with backend(s) via an
        API. It can be used with any backend and has out of the box support for
        CKAN.
      </p>
      <div className="not-prose my-12 grid grid-cols-1 gap-6 md:grid-cols-2 ">
        {features.map((feature, i) => (
          <div
            key={`feature-${i}`}
            className="group relative rounded-xl border border-slate-200 dark:border-slate-800"
          >
            <div className="absolute -inset-px rounded-xl border-2 border-transparent opacity-0 [background:linear-gradient(var(--quick-links-hover-bg,theme(colors.sky.50)),var(--quick-links-hover-bg,theme(colors.sky.50)))_padding-box,linear-gradient(to_top,theme(colors.blue.300),theme(colors.blue.400),theme(colors.blue.500))_border-box] group-hover:opacity-100 dark:[--quick-links-hover-bg:theme(colors.slate.800)]" />
            <div className="relative overflow-hidden rounded-xl p-6">
              <img src={feature.icon} alt={feature.title} className="h-24 w-auto" />
              <h2 className="mt-4 font-display text-base text-primary dark:text-primary-dark">
                <span className="absolute -inset-px rounded-xl" />
                {feature.title}
              </h2>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
