/* eslint-disable react/display-name */
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
  const resource = result.resources.find(
    (item) => item.name === variables.resource
  );

  const stats = [
    { name: 'File', stat: resource.title || resource.name },
    { name: 'Description', stat: resource.description || 'N/A' },
    { name: 'Size', stat: resource.size || 'N/A' },
    {
      name: 'Created',
      stat: resource.created && timeago.format(resource.created),
    },
    {
      name: 'Updated',
      stat: resource.updated && timeago.format(resource.updated),
    },
    { name: 'Download', stat: resource.path, link: true },
  ];

  return (
    <>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-3xl leading-6 font-medium text-gray-900">
          {result.title || result.name}
        </h1>
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
                {item.link ? (
                  <a
                    href={item.stat}
                    className="underline"
                    rel="noreferrer"
                    target="_blank"
                  >
                    {resource.format || 'Click'}
                  </a>
                ) : (
                  item.stat
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
};

export default About;
