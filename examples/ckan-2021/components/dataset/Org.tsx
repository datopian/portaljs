import { useQuery } from '@apollo/react-hooks';
import { ErrorMessage } from '../_shared';
import { GET_DATASET_QUERY } from '../../graphql/queries';
import { Org } from '@portaljs/portaljs-components';

const OrgInfo: React.FC<{ variables: any }> = ({ variables }) => {
  const { loading, error, data } = useQuery(GET_DATASET_QUERY, {
    variables,
    // Setting this value to true will make the component rerender when
    // the "networkStatus" changes, so we are able to know if it is fetching
    // more data
    notifyOnNetworkStatusChange: true,
  });

  if (error) return <ErrorMessage message="Error loading dataset." />;
  if (loading) return <div>Loading</div>;

  const { organization } = data.dataset.result;

  return <Org organization={organization} />;
};

export default OrgInfo;
