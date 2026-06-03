import { useQuery } from '@apollo/react-hooks';
import { ErrorMessage } from '../_shared';
import { GET_TOTAL_COUNT_QUERY } from '../../graphql/queries';
import { ItemTotal } from '@portaljs/portaljs-components';

const Total: React.FC<{ variables: any }> = ({ variables }) => {
  const { loading, error, data } = useQuery(GET_TOTAL_COUNT_QUERY, {
    variables,
    // Setting this value to true will make the component rerender when
    // the "networkStatus" changes, so we are able to know if it is fetching
    // more data
    notifyOnNetworkStatusChange: true,
  });

  if (error) return <ErrorMessage message="Error loading search results." />;
  if (loading) return <div>Loading</div>;

  const { result } = data.search;

  return <ItemTotal count={result.count} />;
};

export default Total;
