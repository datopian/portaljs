import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { initializeApollo } from '../../../lib/apolloClient';
import Nav from '../../../components/home/Nav';
import Post from '../../../components/static/Post';
import { GET_POST_QUERY } from '../../../graphql/queries';

type Props = {
  variables: any;
};

const PostItem: React.FC<Props> = ({ variables }) => (
  <>
    <Head>
      <title>Portal | {variables.slug}</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Nav />
    <main className="p-6">
      <Post variables={variables} />
    </main>
  </>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const variables = {
    slug: context.query.post,
  };

  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: GET_POST_QUERY,
    variables,
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      variables,
    },
  };
};

export default PostItem;
