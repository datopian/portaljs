import React from "react";
import { FaArrowLeft, FaBook } from "react-icons/fa";
import Link from "next/link";
import Layout from "@/components/Layout";
import LearnPostCard from "@/components/LearnPostCard";
import ButtonLink from "@/components/ButtonLink";

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
];

const MetadataLearnPage = () => {
  return (
    <Layout>
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
                <div className="absolute -left-4 top-6 w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
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

        {/* Next Steps */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-primary dark:text-primary-dark mb-4">
            What's Next?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Ready to expand your knowledge? Explore other data management topics or dive deeper into advanced metadata concepts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ButtonLink href="/learn" className="text-sm">
              Explore Other Topics
            </ButtonLink>
            <ButtonLink style="secondary" href="/blog" className="text-sm">
              Browse All Posts
            </ButtonLink>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MetadataLearnPage;