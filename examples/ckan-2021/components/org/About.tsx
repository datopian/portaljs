import { useQuery } from '@apollo/react-hooks';
import * as timeago from 'timeago.js';
import { ErrorMessage } from '../_shared';
import { GET_ORG_QUERY } from '../../graphql/queries';

const About: React.FC<{ variables: any }> = ({ variables }) => {
  const { loading, error, data } = useQuery(GET_ORG_QUERY, {
    variables,
    // Setting this value to true will make the component rerender when
    // the "networkStatus" changes, so we are able to know if it is fetching
    // more data
    notifyOnNetworkStatusChange: true,
  });

  if (error) return <ErrorMessage message="Error loading dataset." />;
  if (loading) return <div>Loading</div>;

  const { result } = data.org;

  return (
    <div className="relative bg-white py-16 sm:py-4">
      <div className="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:gap-24 lg:items-start">
        <div className="relative sm:py-16 lg:py-0">
          <div
            aria-hidden="true"
            className="hidden sm:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-screen"
          >
            <div className="absolute inset-y-0 right-1/2 w-full bg-gray-50 rounded-r-3xl lg:right-72" />
            <svg
              className="absolute top-8 left-1/2 -ml-3 lg:-right-8 lg:left-auto lg:top-12"
              width={404}
              height={392}
              fill="none"
              viewBox="0 0 404 392"
            >
              <defs>
                <pattern
                  id="02f20b47-fd69-4224-a62a-4c9de5c763f7"
                  x={0}
                  y={0}
                  width={20}
                  height={20}
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    x={0}
                    y={0}
                    width={4}
                    height={4}
                    className="text-gray-200"
                    fill="currentColor"
                  />
                </pattern>
              </defs>
              <rect
                width={404}
                height={392}
                fill="url(#02f20b47-fd69-4224-a62a-4c9de5c763f7)"
              />
            </svg>
          </div>
          <div className="relative mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:px-0 lg:max-w-none lg:py-20">
            {/* Testimonial card*/}
            <div className="relative pt-64 pb-10 rounded-2xl shadow-xl overflow-hidden">
              <img
                className="absolute inset-0 h-full w-full object-cover"
                src={
                  result.image ||
                  'https://datahub.io/static/img/datahub-cube-edited.svg'
                }
                alt={result.title || result.name}
              />
              <div className="absolute inset-0 bg-indigo-500 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-600 via-indigo-600 opacity-90" />
              <div className="relative px-8">
                <blockquote className="mt-8">
                  <div className="relative text-lg font-medium text-white md:flex-grow">
                    <p className="relative">
                      {result.description ||
                        "This organization doesn't have a description."}
                    </p>
                  </div>

                  <footer className="mt-4">
                    <p className="text-base font-semibold text-indigo-200">
                      {result.title}
                    </p>
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:px-0">
          {/* Content area */}
          <div className="pt-12 sm:pt-16 lg:pt-20">
            <h1 className="text-3xl text-gray-900 font-extrabold tracking-tight sm:text-4xl">
              {result.title || result.name}
            </h1>
          </div>

          {/* Stats section */}
          <div className="mt-10">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-8">
              <div className="border-t-2 border-gray-100 pt-6">
                <dt className="text-base font-medium text-gray-500">
                  Datasets
                </dt>
                <dd className="text-3xl font-extrabold tracking-tight text-gray-900">
                  {result.total}
                </dd>
              </div>
              <div className="border-t-2 border-gray-100 pt-6">
                <dt className="text-base font-medium text-gray-500">Users</dt>
                <dd className="text-3xl font-extrabold tracking-tight text-gray-900">
                  {result.users && result.users.length}
                </dd>
              </div>
              <div className="border-t-2 border-gray-100 pt-6">
                <dt className="text-base font-medium text-gray-500">
                  Followers
                </dt>
                <dd className="text-3xl font-extrabold tracking-tight text-gray-900">
                  {result.followers}
                </dd>
              </div>
              <div className="border-t-2 border-gray-100 pt-6">
                <dt className="text-base font-medium text-gray-500">
                  Created
                </dt>
                <dd className="text-3xl font-extrabold tracking-tight text-gray-900">
                  {timeago.format(result.created)}
                </dd>
              </div>
            </dl>
            <div className="mt-10">
              <a
                href={`/search?fq=organization:${result.name}`}
                className="text-base font-medium text-indigo-600"
              >
                {' '}
                Datasets by {result.title || result.name}{' '}
                <span aria-hidden="true">&rarr;</span>{' '}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
