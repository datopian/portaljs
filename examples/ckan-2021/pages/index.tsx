import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { initializeApollo } from '../lib/apolloClient';
import RecentDataset from '../components/home/Recent';
import { SEARCH_QUERY } from '../graphql/queries';
import { loadNamespaces } from './_app';
import useTranslation from 'next-translate/useTranslation';
import NavBar from '../components/home/Nav';
import Hero from '../components/home/Hero';
import Footer from '../components/home/Footer';
import Stats from '../components/home/Stats';

const Home: React.FC<{ locale: any; locales: any }> = ({
  locale,
  locales,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="container mx-auto">
        <Head>
          <title>{t(`common:title`)}</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <NavBar />
        <Hero />
        <Stats />
        <RecentDataset />
        <Footer />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  locales,
}) => {
  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: SEARCH_QUERY,
    variables: {
      sort: 'metadata_created desc',
      rows: 3,
    },
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      _ns: await loadNamespaces(['common'], locale),
      locale,
      locales,
    },
  };
};

export default Home;
