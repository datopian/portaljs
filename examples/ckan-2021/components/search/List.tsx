import { useQuery } from '@apollo/react-hooks';
import Link from 'next/link';
import * as timeago from 'timeago.js';
import { ErrorMessage } from '../_shared';
import { SEARCH_QUERY } from '../../graphql/queries';

const List: React.FC<{ variables: any }> = ({ variables }) => {
  const { loading, error, data } = useQuery(SEARCH_QUERY, {
    variables,
    // Setting this value to true will make the component rerender when
    // the "networkStatus" changes, so we are able to know if it is fetching
    // more data
    notifyOnNetworkStatusChange: true,
  });

  if (error) return <ErrorMessage message="Error loading search results." />;
  if (loading) return <div>Loading</div>;
  const { result } = data.search;
  return (
    <ul className="divide-y divide-gray-200">
      {result.results.map((dataset, index) => (
        <li
          key={index}
          className="relative bg-white py-5 px-4 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600"
        >
          <div className="flex justify-between space-x-3">
            <div className="min-w-0 flex-1">
              <Link className="block focus:outline-none"
                href={`/@${
                  dataset.organization ? dataset.organization.name : 'dataset'
                }/${dataset.name}`}
              >
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">
                    {dataset.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {dataset.organization
                      ? dataset.organization.title
                      : 'dataset'}{' '}
                    / {dataset.name}
                  </p>
              </Link>
            </div>
            <time
              dateTime={dataset.metadata_modified}
              className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500"
            >
              Updated {timeago.format(dataset.metadata_modified)}
            </time>
          </div>
          <div className="mt-1">
            <p className="line-clamp-2 text-sm text-gray-600">
              {dataset.description ||
                "This dataset doesn't have a description."}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default List;
