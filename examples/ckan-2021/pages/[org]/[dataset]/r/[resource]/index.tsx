import { GetServerSideProps } from 'next';
import { useQuery } from '@apollo/react-hooks';
import Head from 'next/head';
import { initializeApollo } from '../../../../../lib/apolloClient';
import Nav from '../../../../../components/home/Nav';
import About from '../../../../../components/resource/About';
import View from '../../../../../components/resource/View';
import Footer from '../../../../../components/home/Footer';
import { GET_DATASET_QUERY } from '../../../../../graphql/queries';

const Resource: React.FC<{ variables: any }> = ({ variables }) => {
  const { data, loading } = useQuery(GET_DATASET_QUERY, { variables });

  if (loading) return <div>Loading</div>;
  const result = data.dataset.result;
  // Find right resource
  const resource = result.resources.find(
    (item) => item.name === variables.resource
  );
  return (
    <>
      <Head>
        <title>Portal | {resource.title || resource.name}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Nav />
      <main className="p-6">
        <About variables={variables} />
        <View variables={{ id: resource.id }} />
        <Footer />
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apolloClient = initializeApollo();
  const variables = {
    id: context.query.dataset,
    resource: context.query.resource,
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

export default Resource;
