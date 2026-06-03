/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/display-name */
import Link from 'next/link';
import { useQuery } from '@apollo/react-hooks';
import * as timeago from 'timeago.js';
import { Table, ErrorMessage } from '../_shared';
import { GET_DATASET_QUERY } from '../../graphql/queries';

const columns = [
  {
    name: 'File',
    key: 'file',
    render: ({ name: resName, title, parentName }) => (
      <Link className="underline" href={`${parentName}/r/${resName}`}>
        {title || resName}
      </Link>
    ),
  },
  {
    name: 'Format',
    key: 'format',
  },
  {
    name: 'Created',
    key: 'created',
    render: ({ created }) => timeago.format(created),
  },
  {
    name: 'Updated',
    key: 'updated',
    render: ({ updated }) => timeago.format(updated),
  },
  {
    name: 'Link',
    key: 'link',
    render: ({ name: resName, parentName }) => (
      <Link className="underline" href={`${parentName}/r/${resName}`}>
        Preview
      </Link>
    ),
  },
];

const Resources: React.FC<{ variables: any }> = ({ variables }) => {
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

  return (
    <div className="mt-12">
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl leading-6 font-medium text-gray-900">
          Data files
        </h1>
      </div>
      <Table
        columns={columns}
        data={result.resources.map((resource) => ({
          ...resource,
          parentName: result.name,
        }))}
      />
    </div>
  );
};

export default Resources;
