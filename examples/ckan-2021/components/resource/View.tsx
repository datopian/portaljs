import { useQuery } from '@apollo/react-hooks';
import Preview from './Preview';
import { ErrorMessage } from '../_shared';
import { GET_RESOURCE_VIEWS } from '../../graphql/queries';

const View: React.FC<{ variables: any }> = ({ variables }) => {
  const { loading, error, data } = useQuery(GET_RESOURCE_VIEWS, {
    variables,
    // Setting this value to true will make the component rerender when
    // the "networkStatus" changes, so we are able to know if it is fetching
    // more data
    notifyOnNetworkStatusChange: true,
  });

  if (error) return <ErrorMessage message="Error loading dataset." />;
  if (loading) return <div>Loading</div>;

  const { result } = data.views;
  const previews = result.map((view) => <Preview view={view} key={view.id} />);

  return <>{previews}</>;
};

export default View;
