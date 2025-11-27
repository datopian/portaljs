import { NextSeo } from 'next-seo';
import { promises as fs } from 'fs';
import path from 'path';
import getConfig from 'next/config';
import { getProjectReadme, GithubProject } from '@/lib/octokit';
import remarkGfm from 'remark-gfm';
import extract from 'remark-extract-frontmatter';
import { Dataset } from '..';
import { GetStaticProps } from 'next';
import { FlatUiTable } from '@portaljs/components';
import Breadcrumbs from '@/components/Breadcrumbs';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import remarkFrontmatter from 'remark-frontmatter';
import Layout from '@/components/Layout';
import { format } from 'timeago.js';

// Request a weekday along with a long date
const options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
} as const;

export default function DatasetPage({
  dataset,
}: {
  dataset: Dataset & {
    readme: string | null;
  };
}) {
  return (
    <>
      <NextSeo title={`${dataset.name} page`} />
      <Layout>
        <main className="max-w-5xl px-2 prose mx-auto my-8 pb-8 prose-thead:border-b-4 prose-table:max-w-5xl prose-table:overflow-scroll prose-thead:overflow-scroll prose-tbody:overflow-scroll prose-thead:pb-2 prose-thead:border-zinc-900 prose-th:uppercase prose-th:text-left prose-th:font-light prose-th:text-xs prose-a:no-underline">
          <Breadcrumbs links={[{ title: dataset.name, href: '' }]} />
          <h1 className="uppercase mb-0 mt-16">{dataset.name}</h1>
          <table className="w-full my-10 mb-8 hidden md:table">
            <thead className="border-b-4 pb-2 border-zinc-900">
              <tr>
                <th className="uppercase text-left font-normal text-xs pb-3">
                  related content
                </th>
                <th className="uppercase text-left font-normal text-xs pb-3">
                  last updated
                </th>
              </tr>
            </thead>
            <tbody>
              <DesktopItem key={dataset.name} dataset={dataset} />
            </tbody>
          </table>

          {dataset.readme && (
            <>
              {dataset.readme && (
                <ReactMarkdown
                  remarkPlugins={[
                    remarkFrontmatter,
                    remarkGfm,
                    [extract, { remove: true }],
                  ]}
                >
                  {dataset.readme}
                </ReactMarkdown>
              )}
            </>
          )}

          <h2 className="mb-0 mt-10">Files</h2>
          <div className="inline-block min-w-full py-2 align-middle">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="border-b-4 pb-2 border-zinc-900">
                <tr>
                  <th
                    className="uppercase text-left font-light text-xs pb-3"
                    scope="col"
                  >
                    Name
                  </th>
                  <th
                    className="uppercase text-left font-light text-xs pb-3"
                    scope="col"
                  >
                    Download
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dataset.files?.map((file) => (
                  <tr key={file}>
                    <td className="whitespace-nowrap text-left py-4 text-sm text-gray-500">
                      <a href={`#${file.split('/').slice(-1)}`}>
                        {file.split('/').slice(-1)}
                      </a>
                    </td>
                    <td className="whitespace-nowrap py-4 text-sm text-gray-500">
                      <a href={file}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-8 h-8 text-blue-400 hover:text-blue-300 transition mt-1 ml-3"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-.53 14.03a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06l-1.72 1.72V8.25a.75.75 0 00-1.5 0v5.69l-1.72-1.72a.75.75 0 00-1.06 1.06l3 3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dataset.files && dataset.files.length > 0 && (
            <>
              <h2 className="mb-0 mt-8">Data Previews</h2>
              {dataset.files?.map((file) => (
                <div
                  key={file}
                  id={file.split('/').slice(-1).join('')}
                  className="preview-table my-8"
                >
                  <h3>{file.split('/').slice(-1)}</h3>
                  <FlatUiTable url={file} />
                </div>
              ))}
            </>
          )}
        </main>
      </Layout>
    </>
  );
}

export function DesktopItem({ dataset }: { dataset: Dataset }) {
  return (
    <>
      {dataset.articles.map((article, index) => (
        <tr
          key={article.url}
          className={`${
            index === dataset.articles.length - 1 ? 'border-b' : ''
          } border-zinc-400`}
        >
          <td>
            <a
              className="py-8 font-bold hover:underline pr-2"
              href={article.url}
            >
              {article.title}
            </a>
          </td>
          <td className="py-8 font-light text-[14px] min-w-[138px] font-mono text-[#999]">
            {format(article.date).includes('years')
              ? new Date(article.date).toLocaleString('en-US', options)
              : format(article.date)}
          </td>
          <td className="py-8 text-end">
            {index === 0 && (
              <a
                className="ml-auto border border-zinc-900 font-light px-[25px] py-2.5 text-sm transition hover:bg-zinc-900 hover:text-white"
                href={dataset.url}
              >
                info
              </a>
            )}
          </td>
        </tr>
      ))}
    </>
  );
}

export async function getStaticPaths() {
  const datasetsFile = path.join(process.cwd(), 'datasets.json');
  const datasets = await fs.readFile(datasetsFile, 'utf8');

  return {
    paths: JSON.parse(datasets).map((dataset: Dataset) => {
      return {
        params: { datasetName: dataset.name },
      };
    }),
    fallback: false, // can also be true or 'blocking'
  };
}
// change href base check datahub-next

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const datasetsFile = path.join(process.cwd(), 'datasets.json');
  const datasetsString = await fs.readFile(datasetsFile, 'utf8');
  const datasets: Dataset[] = JSON.parse(datasetsString);
  const dataset: Dataset | undefined = datasets.find(
    (_dataset) => _dataset.name === params?.datasetName
  );
  const github_pat = getConfig().serverRuntimeConfig.github_pat;
  const readmes = await Promise.all(
    ['/README.md', '/readme.md', '/Readme.md'].map(
      async (readme) =>
        await getProjectReadme(
          'fivethirtyeight',
          'data',
          'master',
          dataset?.name + readme,
          github_pat
        )
    )
  );
  const readme = readmes.find((item) => item !== null);
  if (!readme) console.log('Readme not found for ' + dataset?.name);
  return {
    props: {
      dataset: {
        ...dataset,
        readme,
        files: dataset && dataset.files ? dataset.files : null,
      },
    },
  };
};
