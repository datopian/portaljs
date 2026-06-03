import { useQuery } from '@apollo/react-hooks';
import { PlotlyChart, Table } from '@portaljs/portaljs-components';
import { ErrorMessage } from '../_shared';
import { GET_DATASTORE_DATA } from '../../graphql/queries';

const Preview: React.FC<{ view: any }> = ({ view }) => {
  const variables = {
    resource_id: view.resources,
  };
  const { loading, error, data } = useQuery(GET_DATASTORE_DATA, {
    variables,
    // Setting this value to true will make the component rerender when
    // the "networkStatus" changes, so we are able to know if it is fetching
    // more data
    notifyOnNetworkStatusChange: true,
  });

  if (error) return <ErrorMessage message="Error loading dataset." />;
  if (loading) return <div>Loading</div>;

  const { result } = data.datastore;

  // Assuming for now it is always a table view
  const columns = result.fields.map((field) => ({
    field: field.id,
    headerName: field.id,
  }));

  return <Table columns={columns} data={result.records} height="300px" width="100%"/>;
};

export default Preview;
