import Layout from '@/components/Layout';
import { NextSeo } from 'next-seo';
import ButtonLink from '@/components/ButtonLink';
import { H1, H2, H3 } from '@/components/custom/header';

export default function Partners() {
  return (
    <Layout>
      <NextSeo
        title="PortalJS Partnerships"
        description="Join us to deliver open data innovation through collaboration."
      />
      <div className="flex justify-center">
        <div className="max-w-4xl px-4 sm:px-8 xl:px-12 py-16">
          <H1 className="text-center mb-4">Become a PortalJS Partner</H1>
          <H3 className="text-center mb-8">
            Join a network of forward-thinking organizations driving open data
            innovation across governments, non-profits, academia, and
            businesses. As a PortalJS partner, you’ll collaborate with our team
            to deliver seamless, user-friendly data portals—and grow your
            services offering.
          </H3>
          <div className="text-center mb-12">
            <ButtonLink
              href="https://calendar.app.google/sn2PU7ZvzjCPo1ok6"
              className="text-sm"
            >
              Book a Partnership Meeting
            </ButtonLink>
          </div>
          <section className="mb-12">
            <H2 className="text-center">Why Partner with PortalJS</H2>
            <ul className="list-disc list-inside space-y-2 mt-4 text-left">
              <li>
                <strong>Collaborative Growth:</strong> Work side-by-side with
                our experts to co-deliver projects, combining your local market
                knowledge with our open data platform.
              </li>
              <li>
                <strong>Flexible Engagement:</strong> Offer everything from
                frontend customizations to full enterprise deployments—scale up
                your services as clients’ needs evolve.
              </li>
              <li>
                <strong>Dedicated Support:</strong> Gain access to technical
                resources, sales enablement materials, and priority support to
                ensure every partnership succeeds.
              </li>
              <li>
                <strong>Marketing &amp; Co-Branding:</strong> Amplify your reach
                through joint marketing campaigns, webinars, and events.
              </li>
            </ul>
          </section>
          <section className="mb-12">
            <H2 className="text-center">How It Works</H2>
            <ol className="list-decimal list-inside space-y-2 mt-4 text-left">
              <li>
                <strong>Connect:</strong> Book a meeting with our partnerships
                team to explore collaboration opportunities.
              </li>
              <li>
                <strong>Plan:</strong> Together, we’ll design a joint engagement
                model tailored to your strengths and your clients’ needs.
              </li>
              <li>
                <strong>Deliver:</strong> Collaborate on implementation—from
                customizing our default PortalJS template to deploying
                enterprise-grade, self-hosted or cloud solutions.
              </li>
              <li>
                <strong>Grow:</strong> Celebrate shared success, gather
                feedback, and expand into new markets.
              </li>
            </ol>
          </section>
          <section className="mb-12">
            <H2 className="text-center">Our Partners</H2>
            <ul className="list-disc list-inside space-y-2 mt-4 text-left">
              <li>
                <strong>Multi</strong> – our primary partners in Paris helping
                our customers in France, Belgium and other European countries.
              </li>
              <li>
                <strong>Liip</strong> – our main partners in Switzerland and
                Germany.
              </li>
              <li>
                <strong>XYZ</strong> – our main partners in the USA and Canada
                region.
              </li>
            </ul>
          </section>
          <div className="text-center">
            <p className="mb-4">Ready to partner with PortalJS?</p>
            <ButtonLink
              href="https://calendar.app.google/sn2PU7ZvzjCPo1ok6"
              style="secondary"
              className="text-sm"
            >
              Let’s Talk
            </ButtonLink>
          </div>
        </div>
      </div>
    </Layout>
  );
}
