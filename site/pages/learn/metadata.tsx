import React from "react";
import { FaArrowLeft, FaBook } from "react-icons/fa";
import { generateNextSeo } from 'next-seo/pages';
import Head from 'next/head';
import Link from "next/link";
import Layout from "@/components/Layout";
import LearnPostCard from "@/components/LearnPostCard";

const metadataPosts = [
  {
    title: "Basics of Metadata: How It Helps Understand Your Data",
    description: "Learn the basics of metadata—from built-in CSV attributes like filename and media type to simple external files—and see how it makes your data discoverable.",
    href: "/blog/basics-of-metadata-how-it-helps-to-understand-your-data",
    date: "June 2, 2025",
    readTime: "8 min read",
  },
  {
    title: "How Rich Metadata Powers Data Discovery in Modern Data Catalogs",
    description: "Learn how metadata transforms data discovery at scale—from search engines like Solr and Elasticsearch to standardized schemas that help users find exactly what they need among thousands of datasets.",
    href: "/blog/how-rich-metadata-powers-data-discovery-in-modern-data-catalogs",
    date: "June 25, 2025",
    readTime: "10 min read",
  },
  {
    title: "The Metadata Standards Landscape: Making Data Discoverable Across Organizations",
    description: "Navigate the world of metadata standards from Dublin Core to DCAT to Frictionless Data. Learn which standards work best for government, academic, and enterprise data portals, and how to choose the right approach for your organization.",
    href: "/blog/the-metadata-standards-landscape-making-data-discoverable-across-organizations",
    date: "July 8, 2025",
    readTime: "12 min read",
  },
];

const MetadataLearnPage = () => {
  return (
    <Layout>
      <Head>
        {generateNextSeo({
          title: "Metadata Fundamentals | Learn Data Management",
          description: "Master the fundamentals of metadata—what it is, how it works, and why it's essential for data discovery and management. Learn about metadata schemas, standards, and best practices.",
          canonical: "https://www.portaljs.com/learn/metadata",
          openGraph: {
          url: 'https://www.portaljs.com/learn/metadata',
          title: 'Metadata Fundamentals | Learn Data Management',
          description: 'Master the fundamentals of metadata—what it is, how it works, and why it\'s essential for data discovery and management. Learn about metadata schemas, standards, and best practices.',
          site_name: 'PortalJS',
        },
          twitter: {
          cardType: 'summary_large_image',
          site: '@PortalJS_',
        },
        })}
      </Head>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/learn" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
            <FaArrowLeft className="mr-2 text-sm" />
            Back to Learning Topics
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <FaBook className="text-3xl text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary dark:text-primary-dark mb-4">
            Metadata Fundamentals
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Master the fundamentals of metadata—what it is, how it works, and why it's essential for data discovery and management.
          </p>
        </div>

        {/* Learning Path */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-primary dark:text-primary-dark mb-6">
            Learning Path
          </h2>
          <div className="grid gap-6">
            {metadataPosts.map((post, index) => (
              <div key={index} className="relative">
                {/* Step number */}
                <div className="absolute -left-4 top-6 w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-[0_4px_12px_-4px_rgba(37,99,235,0.5)]">
                  {index + 1}
                </div>
                <div className="ml-8">
                  <LearnPostCard
                    title={post.title}
                    description={post.description}
                    href={post.href}
                    date={post.date}
                    readTime={post.readTime}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 text-center mb-16">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
            What's Next?
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Ready to expand your knowledge? Explore other data management topics or dive deeper into advanced metadata concepts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
            <Link
              href="/learn"
              className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]"
            >
              Explore Other Topics
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-[10px] border border-slate-300 bg-white px-[18px] py-2.5 text-[14.5px] font-semibold text-slate-700 transition-all duration-150 hover:-translate-y-px hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-400"
            >
              Browse All Posts
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MetadataLearnPage;