/* eslint-disable jsx-a11y/anchor-is-valid */
import { useQuery } from '@apollo/react-hooks';
import {
  PresentationChartBarIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/solid';
import { ErrorMessage } from '../_shared';
import { SEARCH_QUERY } from '../../graphql/queries';

const RecentDataset: React.FC = () => {
  const { loading, error, data } = useQuery(SEARCH_QUERY, {
    variables: {
      sort: 'metadata_created desc',
      rows: 3,
    },
    // Setting this value to true will make the component rerender when
    // the "networkStatus" changes, so we are able to know if it is fetching
    // more data
    notifyOnNetworkStatusChange: true,
  });

  if (error) return <ErrorMessage message="Error loading search results." />;
  if (loading) return <div>Loading</div>;

  const { result } = data.search;

  return (
    <section className="my-10 p-4">
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        Recent Datasets
      </h3>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {result.results.map((dataset) => (
          <li
            key={dataset.id}
            className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200"
          >
            <div className="w-full flex items-center justify-between p-6 space-x-6">
              <div className="flex-1 truncate">
                <div className="flex items-center space-x-3">
                  <h3 className="text-gray-900 text-sm font-medium truncate">
                    {dataset.title || dataset.name}
                  </h3>
                  <span className="flex-shrink-0 inline-block px-2 py-0.5 text-green-800 text-xs font-medium bg-green-100 rounded-full">
                    dataset
                  </span>
                </div>
                <p className="mt-1 text-gray-500 text-sm truncate">
                  {dataset.organization.title || dataset.organization.name}
                </p>
              </div>
              <img
                className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"
                src={
                  dataset.organization.image ||
                  'https://datahub.io/static/img/datahub-cube-edited.svg'
                }
                alt=""
              />
            </div>
            <div>
              <div className="-mt-px flex divide-x divide-gray-200">
                <div className="w-0 flex-1 flex">
                  <a
                    href={`/@${dataset.organization.name}`}
                    className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                  >
                    <RectangleStackIcon
                      className="w-5 h-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <span className="ml-3">Organization</span>
                  </a>
                </div>
                <div className="-ml-px w-0 flex-1 flex">
                  <a
                    href={`/@${dataset.organization.name}/${dataset.name}`}
                    className="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-gray-500"
                  >
                    <PresentationChartBarIcon
                      className="w-5 h-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <span className="ml-3">Preview</span>
                  </a>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RecentDataset;
