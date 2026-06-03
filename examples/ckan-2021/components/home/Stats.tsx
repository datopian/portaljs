/* eslint-disable jsx-a11y/anchor-is-valid */
import { useQuery } from '@apollo/react-hooks';
import { ErrorMessage } from '../_shared';
import { GET_STATS_QUERY } from '../../graphql/queries';

const Stats: React.FC = () => {
  const { loading, error, data } = useQuery(GET_STATS_QUERY, {
    variables: {},
    // Setting this value to true will make the component rerender when
    // the "networkStatus" changes, so we are able to know if it is fetching
    // more data
    notifyOnNetworkStatusChange: true,
  });

  if (error) return <ErrorMessage message="Error loading search results." />;
  if (loading) return <div>Loading</div>;

  const stats = [
    { name: 'Datasets', stat: data.datasets.result.count },
    {
      name: 'Organizations',
      stat: data.orgs.result ? data.orgs.result.length : 0,
    },
    {
      name: 'Groups',
      stat: data.groups.result ? data.groups.result.length : 0,
    },
  ];

  return (
    <div className="p-4">
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        DataHub Stats
      </h3>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.name}
            className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6"
          >
            <dt className="text-sm font-medium text-gray-500 truncate">
              {item.name}
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {item.stat}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default Stats;
