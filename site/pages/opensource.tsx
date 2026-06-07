import { OrganizationJsonLd } from 'next-seo';
import { generateNextSeo } from 'next-seo/pages';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Hero from "@/components/Hero";
import Container from "@/components/Container";
import Community from "@/components/home/community";

export default function OSS() {

  return (
    <>
      <Head>
        {generateNextSeo({
          title: "The JavaScript framework for data portals",
          description: "Rapidly build rich data portals using a modern frontend framework. Native support for CKAN backend and more.",
        })}
      </Head>
      <OrganizationJsonLd
        url="https://portaljs.org"
        logo="https://portaljs.org/icon.png"
      />
      <Layout>
        <Hero />
        <Container>
          <Community homePage={false} />
        </Container>
      </Layout>
    </>
  );
}