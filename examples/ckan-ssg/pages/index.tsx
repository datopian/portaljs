import getConfig from 'next/config';
import styles from './index.module.css';
import { CKAN } from '@portaljs/ckan';

const backend_url = getConfig().publicRuntimeConfig.DMS

const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  timeZone: 'UTC',
});


export async function getServerSideProps() {
  const ckan = new CKAN(backend_url)
  const { datasets } = await ckan.packageSearch({ limit: 50, offset: 0, groups:[], orgs: [], tags: []})
  return {
    props: {
      datasets
    }
  }
}

export function Index({ datasets }) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <h2 className="text-2xl font-bold leading-10 tracking-tight text-indigo-500">
          My Datasets
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600">
          Here is a list of all my datasets for easy access and sharing, they
          are all available in the following{' '}
          <a
            href="#"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            CKAN Instance
          </a>
        </p>
        <div className="mt-20">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Last updated
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                    ></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {datasets.map((dataset) => (
                    <tr key={dataset.name}>
                      <td className="px-3 py-4 text-sm text-gray-500">
                          {dataset.title}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {dataset.notes}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatter.format(
                          new Date(dataset.metadata_modified)
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <a
                          href={`/@${dataset.organization.name}/${dataset.name}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          More info
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
