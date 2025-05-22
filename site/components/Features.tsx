import Container from "./Container";
import { H1 } from "./custom/header";

const features: { title: string; description: string; icon: string }[] = [
  {
    title: "Unified sites",
    description:
      "Present data and content in one seamless site, pulling datasets from a DMS (e.g. CKAN) and content from a CMS (e.g. wordpress) with a common internal API",
    icon: "/static/img/icon-unified-sites.svg",
  },
  {
    title: "Developer friendly",
    description: "Built with familiar frontend tech Javascript, React etc",
    icon: "/static/img/icon-dev-friendly.svg",
  },
  {
    title: "Batteries included",
    description:
      "Full set of portal components out of the box e.g. catalog search, dataset showcase, blog etc.",
    icon: "/static/img/icon-batteries-included.svg",
  },
  {
    title: "Easy to theme and customize",
    description:
      "Installable themes, use standard CSS and React+CSS tooling. Add new routes quickly.",
    icon: "/static/img/icon-easy-to-theme.svg",
  },
  {
    title: "Extensible",
    description: "Quickly extend and develop/import your own React components",
    icon: "/static/img/icon-extensible.svg",
  },
  {
    title: "Well documented",
    description:
      "Full set of documentation plus the documentation of NextJS and Apollo.",
    icon: "/static/img/icon-well-documented.svg",
  },
];

export default function Features() {
  return (
    <div className="!m-0 !p-0">
      <H1 className=" text-primary dark:text-primary-dark ml-0">
        {" "}
        How PortalJS works?
      </H1>
      <p className="text-base mt-2  text-primary dark:text-primary-dark">
        PortalJS is built in JavaScript and React on top of the popular Next.js
        framework, assuming a "decoupled" approach where the frontend is a
        separate service from the backend and interacts with backend(s) via an
        API. It can be used with any backend and has out of the box support for
        CKAN.
      </p>
      <div className="not-prose my-12 grid grid-cols-1 gap-6 md:grid-cols-2 ">
        {features.map((feature, i) => (
          <div
            key={`feature-${i}`}
            className="group relative rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 shadow-lg"
          >
            <div className="absolute -inset-px rounded-xl border-2 border-transparent opacity-0 " />
            <div className="relative overflow-hidden rounded-xl p-6">
              <img
                src={feature.icon}
                alt={feature.title}
                className="h-24 w-auto"
              />
              <h2 className="mt-4 font-display text-base text-primary dark:text-primary-dark">
                <span className="absolute -inset-px rounded-xl" />
                {feature.title}
              </h2>
              <p className="mt-1 text-sm opacity-75">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
