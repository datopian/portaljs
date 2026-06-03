import { useQuery } from '@apollo/react-hooks';
import * as timeago from 'timeago.js';
import { ErrorMessage } from '../_shared';
import { GET_DATASET_QUERY } from '../../graphql/queries';

const About: React.FC<{ variables: any }> = ({ variables }) => {
  const { loading, error, data } = useQuery(GET_DATASET_QUERY, {
    variables,
    // Setting this value to true will make the component rerender when
    // the "networkStatus" changes, so we are able to know if it is fetching
    // more data
    notifyOnNetworkStatusChange: true,
  });

  if (error) return <ErrorMessage message="Error loading dataset." />;
  if (loading) return <div>Loading</div>;

  const { result } = data.dataset;

  const stats = [
    { name: 'Files', stat: result.resources.length },
    { name: 'Size', stat: result.size || 'N/A' },
    {
      name: 'Formats',
      stat: result.resources.map((item) => item.format).join(', '),
    },
    {
      name: 'Created',
      stat: result.created && timeago.format(result.created),
    },
    {
      name: 'Updated',
      stat: result.updated && timeago.format(result.updated),
    },
    {
      name: 'Licenses',
      stat: result.licenses?.length
        ? result.licenses.map((item, index) => (
            <a
              className="text-yellow-600"
              href={item.path || '#'}
              title={item.title || ''}
              key={index}
            >
              {item.name}
            </a>
          ))
        : 'N/A',
    },
  ];

  return (
    <>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-3xl leading-6 font-medium text-gray-900">
          {result.title || result.name}
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          {result.description || 'This dataset does not have a description.'}
        </p>
      </div>
      <div className="mb-5">
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
    </>
  );
};

export default About;
