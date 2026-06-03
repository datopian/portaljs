import { GetServerSideProps } from 'next';
import { useQuery } from '@apollo/react-hooks';
import Head from 'next/head';
import { initializeApollo } from '../../../lib/apolloClient';
import Nav from '../../../components/home/Nav';
import About from '../../../components/dataset/About';
import Org from '../../../components/dataset/Org';
import Resources from '../../../components/dataset/Resources';
import Footer from '../../../components/home/Footer';
import { GET_DATASET_QUERY } from '../../../graphql/queries';

const Dataset: React.FC<{ variables: any }> = ({ variables }) => {
  const { data, loading } = useQuery(GET_DATASET_QUERY, { variables });

  if (loading) return <div>Loading</div>;
  const { result } = data.dataset;

  return (
    <>
      <Head>
        <title>Portal | {result.title || result.name}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Nav />
      <main className="p-8">
        <About variables={variables} />
        <Resources variables={variables} />
        <Footer />
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apolloClient = initializeApollo();
  const variables = {
    id: context.query.dataset,
  };

  await apolloClient.query({
    query: GET_DATASET_QUERY,
    variables,
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      variables,
    },
  };
};

export default Dataset;
