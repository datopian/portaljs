import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { initializeApollo } from '../../lib/apolloClient';
import Nav from '../../components/home/Nav';
import List from '../../components/static/List';
import { GET_POSTS_QUERY } from '../../graphql/queries';

const PostList: React.FC = () => (
  <>
    <Head>
      <title>Portal | Blog</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Nav />
    <main className="p-6">
      <List />
    </main>
  </>
);

export const getServerSideProps: GetServerSideProps = async () => {
  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: GET_POSTS_QUERY,
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
  };
};

export default PostList;
