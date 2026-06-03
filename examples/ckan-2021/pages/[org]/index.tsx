import { GetServerSideProps } from 'next';
import { useQuery } from '@apollo/react-hooks';
import Head from 'next/head';
import { initializeApollo } from '../../lib/apolloClient';
import Nav from '../../components/home/Nav';
import About from '../../components/org/About';
import Footer from '../../components/home/Footer';
import { GET_ORG_QUERY } from '../../graphql/queries';

const Org: React.FC<{ variables: any }> = ({ variables }) => {
  const { data, loading } = useQuery(GET_ORG_QUERY, { variables });

  if (loading) return <div>Loading</div>;

  const { result } = data.org;

  return (
    <>
      <Head>
        <title>Portal | {result.title || result.name}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Nav />
      <About variables={variables} />
      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apolloClient = initializeApollo();
  const variables = {
    id: (context.query.org as string).replace('@', ''),
  };

  await apolloClient.query({
    query: GET_ORG_QUERY,
    variables,
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      variables,
    },
  };
};

export default Org;
