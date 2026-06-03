import Container from './Container';
import ShowcasesItem from './ShowcasesItem';

const items = [
  {
    title: 'Open Data Northern Ireland',
    href: 'https://www.opendatani.gov.uk/',
    image: '/images/showcases/odni.webp',
    description: 'Government Open Data Portal',
  },
  {
    title: 'Birmingham City Observatory',
    href: 'https://www.cityobservatory.birmingham.gov.uk/',
    image: '/images/showcases/birmingham.webp',
    description: 'Government Open Data Portal',
  },
  {
    title: 'UAE Open Data',
    href: 'https://opendata.fcsc.gov.ae/',
    image: '/images/showcases/uae.webp',
    description: 'Government Open Data Portal',
    sourceUrl: 'https://github.com/FCSCOpendata/frontend',
  },
  {
    title: 'Frictionless Data',
    href: 'https://datahub.io/core/co2-ppm',
    repository: 'https://github.com/datopian/datahub/tree/main/examples/dataset-frictionless',
    image: '/images/showcases/frictionless-capture.png',
    description: 'Progressive open-source framework for building data infrastructure - data management, data integration, data flows, etc. It includes various data standards and provides software to work with data.',
  },
  {
    title: "OpenSpending",
    image: "/images/showcases/openspending.png",
    href: "https://www.openspending.org",
    repository: 'https://github.com/datopian/datahub/tree/main/examples/openspending',
    description: "OpenSpending is a free, open and global platform to search, visualise and analyse fiscal data in the public sphere."
  },
  {
    title: "FiveThirtyEight",
    image: "/images/showcases/fivethirtyeight.png",
    href: "https://fivethirtyeight.portaljs.org/",
    repository: 'https://github.com/datopian/datahub/tree/main/examples/fivethirtyeight',
    description: "This is a replica of data.fivethirtyeight.com using PortalJS."
  },
  {
    title: "Github Datasets",
    image: "/images/showcases/github-datasets.png",
    href: "https://example.portaljs.org/",
    repository: 'https://github.com/datopian/datahub/tree/main/examples/github-backed-catalog',
    description: "A simple data catalog that get its data from a list of GitHub repos that serve as datasets."
  },
  {
    title: "Hatespeech Data",
    image: "/images/showcases/turing.png",
    href: "https://hatespeechdata.com/",
    repository: 'https://github.com/datopian/datahub/tree/main/examples/turing',
    description: "Datasets annotated for hate speech, online abuse, and offensive language which are useful for training a natural language processing system to detect this online abuse."
  },
  
];

export default function Showcases() {
  return (
    <Container>
      <h2
        className="text-3xl font-bold text-primary dark:text-primary-dark"
        id="showcases"
      >
        Showcases
      </h2>
      <p className="text-lg mt-2">Discover what's being powered by PortalJS</p>
      <div className="not-prose my-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {items.map((item) => {
          return <ShowcasesItem item={item} />;
        })}
      </div>
    </Container>
  );
}
