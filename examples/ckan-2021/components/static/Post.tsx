import parse from 'html-react-parser';
import { useQuery } from '@apollo/react-hooks';
import { ErrorMessage } from '../_shared';
import { GET_PAGE_QUERY } from '../../graphql/queries';

const Post: React.FC<{ variables: any }> = ({ variables }) => {
  const { loading, error, data } = useQuery(GET_PAGE_QUERY, {
    variables,
    // Setting this value to true will make the component rerender when
    // the "networkStatus" changes, so we are able to know if it is fetching
    // more data
    notifyOnNetworkStatusChange: true,
  });

  if (error) return <ErrorMessage message="Error loading search results." />;
  if (loading) return <div>Loading</div>;

  const { title, content, modified, featured_image } = data.page;

  return (
    <>
      <h1 className="text-3xl font-semibold text-primary my-6 inline-block">
        {title}
      </h1>
      <p className="mb-6">Edited: {modified}</p>
      <img src={featured_image} className="mb-6" alt="featured_img" />
      <div>{parse(content)}</div>
    </>
  );
};

export default Post;
