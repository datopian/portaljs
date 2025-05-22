import fs from 'fs';

import Community from '@/components/Community';
import Features from '@/components/Features';
import Showcases from '@/components/Showcases';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collectHeadings } from '@portaljs/core';
import Head from 'next/head';
import { LogoJsonLd } from 'next-seo';

export default function Home({ sidebarTree }) {
  const router = useRouter();

  const [tableOfContents, setTableOfContents] = useState([]);

  useEffect(() => {
    const headingNodes = document.querySelectorAll(
      'h2,h3'
    ) as NodeListOf<HTMLHeadingElement>;
    const toc = collectHeadings(headingNodes);
    setTableOfContents(toc ?? []);
  }, [router.asPath]); // update table of contents on route change with next/link

  return (
    <>
      <LogoJsonLd
        url="https://portaljs.com"
        logo="https://portaljs.com/icon.png"
      />
      <Layout
        isHomePage={true}
        tableOfContents={tableOfContents}
        sidebarTree={sidebarTree}
      >
        <Features />

        <Community />
      </Layout>
    </>
  );
}

export function getStaticProps() {
  const tree = fs.readFileSync('content/assets/sidebar.json', {
    encoding: 'utf-8',
  });
  const sidebarTree = JSON.parse(tree);

  return {
    props: {
      sidebarTree,
    },
  };
}
