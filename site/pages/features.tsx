import React from "react";
import {
  FaRegClock,
  FaCheckCircle,
  FaFileAlt,
  FaHeadset,
  FaShieldAlt,
  FaDatabase,
  FaChartPie,
  FaCogs,
  FaPlug,
  FaDollarSign,
  FaUsers,
} from "react-icons/fa";
import { TiCloudStorage } from "react-icons/ti";
import { AiOutlineDatabase } from "react-icons/ai";
import { MdVerified } from "react-icons/md";
import { FaSyncAlt } from "react-icons/fa";
import Head from "next/head";
import Link from "next/link";
import { generateNextSeo } from "next-seo/pages";

import Layout from "@/components/Layout";

const statsData = [
  {
    statsTitle: "5 mins",
    subtitle: "Time to deploy",
    statsDescription:
      " Get your data portal live in minutes with no technical setup required.",
    icon: <FaRegClock />,
  },
  {
    statsTitle: "99.99%",
    subtitle: "Uptime",

    statsDescription:
      " Enjoy reliable, fully managed hosting for uninterrupted access.",
    icon: <FaCheckCircle />,
  },
  {
    statsTitle: "10+ formats",
    subtitle: "Data previews",

    statsDescription: " Preview your data in CSV, Excel, GeoJSON, and more.",
    icon: <FaFileAlt />,
  },
  {
    statsTitle: "Unlimited",
    subtitle: "Datasets and users",

    statsDescription:
      " Scale without limits, with role-based access controls for your team.",
    icon: <AiOutlineDatabase />,
  },
  {
    statsTitle: "24/7",
    subtitle: "Support availability",

    statsDescription: " Dedicated technical support whenever you need it.",
    icon: <FaHeadset />,
  },
  {
    statsTitle: "10 GB",
    subtitle: "Blob storage included",

    statsDescription:
      " Start with built-in storage, scalable with add-ons as your needs grow.",
    icon: <TiCloudStorage />,
  },
  {
    statsTitle: "DCAT",
    subtitle: "Support",

    statsDescription:
      " Your data is protected with the highest security standards.",
    icon: <FaShieldAlt />,
  },
  {
    statsTitle: "10k+ records",
    subtitle: "Per dataset",

    statsDescription:
      " Handle large datasets effortlessly with no performance lag.",
    icon: <FaDatabase />,
  },
  {
    statsTitle: "100%",
    subtitle: "Flexibility",

    statsDescription:
      " Customize your portal with add-ons, integrations, and scalable features that grow with your organization.",
    icon: <FaCogs />,
  },
  {
    statsTitle: "100%",
    subtitle: "Automated",

    statsDescription:
      " No setup required - datasets and metadata update dynamically.",
    icon: <FaSyncAlt />,
  },
  {
    statsTitle: "100%",
    subtitle: "Compliant",

    statsDescription:
      " Integrated support for DCAT and Dublin Core metadata standards.",
    icon: <MdVerified />,
  },
  {
    statsTitle: "0%",
    subtitle: "Setup",

    statsDescription: " Out-of-the-box functionality - works from day one.",
    icon: <FaPlug />,
  },
  {
    statsTitle: "$5,000+",
    subtitle: "Per year saved",

    statsDescription:
      " Reduce your infrastructure and maintenance costs compared to self-hosted solutions.",
    icon: <FaDollarSign />,
  },
  {
    statsTitle: "100+",
    subtitle: "Organizations",

    statsDescription:
      " Trusted by organizations worldwide to manage and share data effectively.",
    icon: <FaUsers />,
  },
  {
    statsTitle: "95%",
    subtitle: "Client satisfaction rate",

    statsDescription:
      "Streamlined workflows for faster, more effective data management.",
    icon: <FaChartPie />,
  },
];

const StatsPage = () => {
  return (
    <Layout>
      <Head>
        {generateNextSeo({
          title: "Features | PortalJS Cloud — Open Data Portal Capabilities",
          description: "Explore all PortalJS Cloud features: 5-minute deployment, 99.9% uptime, unlimited datasets, built-in search, API access, security compliance, and managed infrastructure.",
          canonical: "https://www.portaljs.com/features",
          openGraph: {
            url: 'https://www.portaljs.com/features',
            title: 'Features | PortalJS Cloud — Open Data Portal Capabilities',
            description: 'Explore all PortalJS Cloud features: 5-minute deployment, 99.9% uptime, unlimited datasets, built-in search, API access, security compliance, and managed infrastructure.',
            site_name: 'PortalJS',
            type: 'website',
            images: [
              {
                url: 'https://www.portaljs.com/static/img/seo.webp',
                alt: 'PortalJS Cloud Features',
                width: 1280,
                height: 720,
                type: 'image/webp',
              },
            ],
          },
          twitter: {
            cardType: 'summary_large_image',
            site: '@PortalJS_',
          },
        })}
      </Head>
      <div>
        <h1
          className="text-4xl font-bold text-center text-primary dark:text-primary-dark"
          id="showcases"
        >
          Everything You Need to Manage Your Data Effortlessly
        </h1>
        <p className="text-lg text-center my-4 font-semibold text-slate-400">
          Save time, reduce costs, and scale your data portal with a fully
          managed, customizable platform
        </p>
        <p className="text-center text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8 text-[15px]">
          PortalJS Cloud is a fully managed open data portal platform built for governments, nonprofits, and enterprises. Deploy in minutes, handle unlimited datasets, and meet compliance standards — without managing infrastructure.{' '}
          <Link href="/pricing" className="text-blue-600 hover:underline">See pricing</Link> or{' '}
          <Link href="/case-studies" className="text-blue-600 hover:underline">read customer stories</Link>.
        </p>
        <div className="grid my-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-20">
          {statsData.slice(0, 12).map((stat) => (
            <div key={stat.statsTitle}>
              <div className="relative flex flex-col  h-full rounded-lg border border-blue-400 min-w-0 break-words text-center w-full  ">
                <div className="px-4 py-5 flex-auto">
                  <div className="p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full">
                    <span className="text-2xl md:text-[1.75rem] text-blue-400">
                      {stat.icon}
                    </span>
                  </div>
                  <h5 className="text-[1.9rem] font-bold">{stat.statsTitle}</h5>
                  <h5 className="text-[1.40rem] font-semibold">
                    {stat.subtitle}
                  </h5>
                  <p className="mt-2 mb-4 text-slate-400">
                    {stat.statsDescription}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1  lg:grid-cols-3 gap-5 bg-blue-950 rounded-md ">
          {statsData.slice(12, 15).map((stat) => (
            <div key={stat.statsTitle}>
              <div className="relative flex flex-col min-w-0 break-words text-center  ">
                <div className="p-5 flex-auto">
                  <div className="p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full">
                    <span className="text-3xl md:text-4xl text-blue-400">
                      {stat.icon}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h5 className="text-[1.9rem] font-bold text-[#f3f4f6]">
                      {stat.statsTitle}
                    </h5>
                    <h5 className="text-[1.40rem] font-semibold text-[#f3f4f6]">
                      {stat.subtitle}
                    </h5>
                    <p className="  text-slate-400">{stat.statsDescription}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default StatsPage;
