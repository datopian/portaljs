import React from "react";
import { FaBook, FaGraduationCap, FaShieldAlt, FaChartLine, FaDatabase, FaCogs } from "react-icons/fa";
import Layout from "@/components/Layout";
import LearnCard from "@/components/LearnCard";

const learningTopics = [
  {
    icon: <FaBook />,
    title: "Metadata",
    description: "Master the fundamentals of metadata—what it is, how it works, and why it's essential for data discovery. Learn about metadata schemas, standards, and best practices for making your data discoverable.",
    href: "/learn/metadata",
    underline: true,
  },
  {
    icon: <FaGraduationCap />,
    title: "Data Management Systems",
    description: "Explore data management software components and architectures. Learn about data catalogs, portals, CKAN, and how different systems work together to manage data at scale.",
    href: "/learn/data-management-systems",
    underline: true,
    comingSoon: true,
  },
  {
    icon: <FaShieldAlt />,
    title: "Data Governance",
    description: "Learn about data governance frameworks, policies, and best practices. Understand data stewardship, compliance requirements, and how to establish governance in your organization.",
    href: "/learn/data-governance",
    underline: true,
    comingSoon: true,
  },
  {
    icon: <FaChartLine />,
    title: "Data Quality",
    description: "Discover techniques for measuring, monitoring, and improving data quality. Learn about validation rules, data profiling, cleansing strategies, and quality metrics.",
    href: "/learn/data-quality",
    underline: true,
    comingSoon: true,
  },
  {
    icon: <FaDatabase />,
    title: "Data Integration",
    description: "Master data integration patterns and technologies. Learn about ETL processes, APIs, real-time data sync, and building robust data pipelines.",
    href: "/learn/data-integration",
    underline: true,
    comingSoon: true,
  },
  {
    icon: <FaCogs />,
    title: "Data Lifecycle",
    description: "Understand the complete data lifecycle from creation to archival. Learn about data retention policies, versioning, backup strategies, and deletion processes.",
    href: "/learn/data-lifecycle",
    underline: true,
    comingSoon: true,
  },
];

const LearnPage = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary dark:text-primary-dark mb-4">
            Learn Data Management
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Master the fundamentals of data management through our comprehensive learning paths. Choose a topic below to explore in-depth guides and best practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {learningTopics.map((topic, index) => (
            <LearnCard
              key={index}
              icon={topic.icon}
              title={topic.title}
              description={topic.description}
              href={topic.href}
              underline={topic.underline}
              comingSoon={topic.comingSoon}
              compact={true}
            />
          ))}
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-primary dark:text-primary-dark mb-4">
            More Learning Resources Coming Soon
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            We're continuously expanding our learning resources. Stay tuned for more guides on advanced data management, API integration, and best practices.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default LearnPage;