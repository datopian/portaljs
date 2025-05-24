import { LogoJsonLd, NextSeo } from "next-seo";
import Layout from '@/components/Layout';
import Hero from "@/components/Hero";
import Container from "@/components/Container";
import Community from "@/components/home/community";

export default function OSS() {

  return (
    <>
      <NextSeo
        title="The JavaScript framework for data portals"
        description="Rapidly build rich data portals using a modern frontend framework. Native support for CKAN backend and more."
      />
      <LogoJsonLd
        url="https://portaljs.org"
        logo="https://portaljs.org/icon.png"
      />
      <Layout>
        <Hero />
        <Container>
          <Community />
        </Container>
      </Layout>
    </>
  );
}