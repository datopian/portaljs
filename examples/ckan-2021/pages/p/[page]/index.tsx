import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { initializeApollo } from '../../../lib/apolloClient';
import Nav from '../../../components/home/Nav';
import Page from '../../../components/static/Page';
import { GET_PAGE_QUERY } from '../../../graphql/queries';

type Props = {
  variables: any;
};

const PageItem: React.FC<Props> = ({ variables }) => (
  <>
    <Head>
      <title>Portal | {variables.slug}</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Nav />
    <main className="p-6">
      <Page variables={variables} />
    </main>
  </>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const variables = {
    slug: context.query.page,
  };

  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: GET_PAGE_QUERY,
    variables,
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      variables,
    },
  };
};

export default PageItem;
