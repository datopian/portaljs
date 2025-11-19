import ShowCaseMobile from './ShowCaseMobile'
import ShowcasesItem from './ShowcasesItem'

export const dataPortals = [
  {
    title: 'City of Ann Arbor',
    subtitle: 'Municipal Open Data Portal',
    href: 'https://data.a2gov.org/',
    image: '/static/img/showcases/ann-arbor.webp',
    description:
      'Shares municipal datasets and dashboards focused on sustainability, infrastructure, and civic transparency.',
  },
  {
    title: 'Open Data Nepal',
    subtitle: 'National Open Data Hub',
    href: 'https://opendatanepal.com/',
    image: '/static/img/showcases/open-data-nepal.webp',
    description:
      'Aggregates public datasets and research resources that highlight development indicators across Nepal.',
  },
  {
    title: 'Open Data Bhutan',
    subtitle: 'Government Data Portal',
    href: 'https://data.gov.bt/',
    image: '/static/img/showcases/open-data-bhutan.webp',
    description:
      'Publishes official statistics and administrative datasets from agencies in Bhutan.',
  },
  {
    title: 'Lincolnshire County Council',
    subtitle: 'Local Government Data Portal',
    href: 'https://data.lincolnshire.gov.uk/',
    image: '/static/img/showcases/lincolnshire-open-data.webp',
    description:
      'Provides location-based services data, community statistics, and council transparency reports.',
  },
  {
    title: 'NIRD Research Data Archive',
    subtitle: 'Research Data Repository',
    href: 'https://archive.sigma2.no/',
    image: '/static/img/showcases/nird-sigma2.webp',
    description:
      'Hosts curated datasets from Norwegian research projects with controlled access workflows.',
  },
  {
    title: 'Transport Data Commons',
    subtitle: 'A Global Transport Hub - Building a shared, open data infrastructure for 30+ transport organizations.',
    href: 'https://portal.transport-data.org/',
    image: '/static/img/showcases/2025-06-06-TDC/featured-image.jpg',
    description:
      'Transport Data Commons aims to improve access, sharing, and analysing transportation data for a more sustainable future.',
    sourceUrl: 'https://github.com/transport-data/portal',
  },
  {
    title: 'SSEN',
    subtitle: 'Energy Open Data Portal',
    href: 'https://data.ssen.co.uk/',
    image: '/static/img/showcases/ssen.webp',
    description:
      'Shares data on electricity networks, power distribution, and infrastructure planning.',
  },
  {
    title: 'MOEI',
    subtitle: 'Government Data Portal',
    href: 'https://opendata.moei.gov.ae/',
    image: '/static/img/showcases/mu-dataportal.webp',
    description:
      'Provides data on energy, sustainability, and infrastructure in the UAE.',
  },
  {
    title: 'FIND',
    subtitle: 'Global Health and Diagnostics Data Portal',
    href: 'https://finddx.portaljs.com/',
    image: '/static/img/showcases/dxconnect.webp',
    description:
      'Provides data and insights on diagnostic solutions for infectious diseases.',
  },
  {
    title: 'Open Data Northern Ireland',
    subtitle: 'Government Data Portal',
    href: 'https://www.opendatani.gov.uk/',
    image: '/static/img/showcases/odni.webp',
    description:
      'Provides open datasets on a wide range of topics to support transparency and innovation in Northern Ireland.',
  },
  {
    title: 'Marcus Institute',
    subtitle: 'Research Data Portal',
    href: 'https://data.hsl.harvard.edu/',
    image: '/static/img/showcases/marcus-havard.webp',
    description:
      'Offers datasets and tools for global health and infectious disease research.',
  },
  {
    title: 'UAE Open Data Portal',
    subtitle: 'Government Data Portal',
    href: 'https://opendata.fcsc.gov.ae/',
    image: '/static/img/showcases/uae.webp',
    description:
      'Provides UAE national statistics and socio-economic datasets for public policy and transparency.',
    sourceUrl: 'https://github.com/FCSCOpendata/frontend',
  },
  {
    title: 'London Borough of Hounslow',
    subtitle: 'Government Data Portal',
    href: 'https://data.hounslow.gov.uk/',
    image: '/static/img/showcases/london.webp',
    description:
      'Offers datasets on local government services and community statistics.',
  },
  {
    title: 'Open Spending',
    subtitle: 'Public Financial Data Portal',
    image: '/static/img/showcases/openspending.webp',
    href: 'https://www.openspending.org',
    repository:
      'https://github.com/datopian/datahub/tree/main/examples/openspending',
    description:
      'OpenSpending is a free, open and global platform to search, visualise and analyse fiscal data in the public sphere.',
  },
  {
    title: 'EITI',
    subtitle: 'Transparency Data Portal',
    href: 'https://eiti.portaljs.com/',
    image: '/static/img/showcases/eiti.webp',
    description:
      'Shares data on revenues, payments, and governance in the extractive industries.',
  },
  {
    title: 'FiveThirtyEight',
    subtitle: 'Data Journalism Portal',
    image: '/static/img/showcases/fivethirty.webp',
    href: 'https://fivethirtyeight.portaljs.org/',
    repository:
      'https://github.com/datopian/datahub/tree/main/examples/fivethirtyeight',
    description:
      'This is a replica of data.fivethirtyeight.com using PortalJS.',
  },
  {
    title: 'CO2 PPM',
    subtitle: 'Frictionless Data',
    href: 'https://datahub.io/core/co2-ppm',
    repository:
      'https://github.com/datopian/datahub/tree/main/examples/dataset-frictionless',
    image: '/static/img/showcases/co2.webp',
    description:
      'Progressive open-source framework for building data infrastructure - data management, data integration, data flows, etc. It includes various data standards and provides software to work with data.',
  },
  {
    title: 'Github Datasets',
    subtitle: 'Data Catalog',
    image: '/static/img/showcases/github.webp',
    href: 'https://example.portaljs.org/',
    repository:
      'https://github.com/datopian/datahub/tree/main/examples/github-backed-catalog',
    description:
      'A simple data catalog that get its data from a list of GitHub repos that serve as datasets.',
  },
  {
    title: 'Hatespeech Data',
    subtitle: 'Social Research Data Portal',
    image: '/static/img/showcases/hatespeech.webp',
    href: 'https://hatespeechdata.com/',
    repository: 'https://github.com/datopian/datahub/tree/main/examples/turing',
    description:
      'Datasets annotated for hate speech, online abuse, and offensive language which are useful for training a natural language processing system to detect this online abuse.',
  },
]

export default function Showcases() {
  return (
    <div className="max-w-8xl px-4 xl:px-12 mx-auto">
      <div>
        {/* <p className="text-sm font-bold text-blue-400">LONG READ</p> */}
        <div className="flex items-center justify-start gap-2 transition blink">
          <p className="text-start text-5xl sm:text-7xl sm:my-8 tracking-tight">
            Discover <br />
            data portals <br />
            powered by PortalJS{' '}
          </p>
        </div>
      </div>
      <div className="not-prose my-12 grid grid-cols-1 gap-6 lg:gap-12 md:grid-cols-2">
        {dataPortals.map((item) => {
          return (
            <div className="hidden sm:block" key={item.title}>
              <ShowcasesItem item={item} />
            </div>
          )
        })}
        {dataPortals.map((item) => {
          return (
            <div className="sm:hidden" key={item.title}>
              <ShowCaseMobile item={item} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
