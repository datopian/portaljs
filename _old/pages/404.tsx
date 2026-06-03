import Layout from '@/components/Layout';
import { NextSeo } from 'next-seo';
import Link from 'next/link';

export default function () {
  return (
    <>
      <NextSeo noindex={true} nofollow={true} />
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl">404 - Page not found</h1>
            <p className="text-lg mt-5">
              It seems like you are looking for a page that doesn't exist.
            </p>
            <Link className="underline" href="/">
              Go back to home
            </Link>
          </div>
        </div>
      </Layout>
    </>
  );
}
