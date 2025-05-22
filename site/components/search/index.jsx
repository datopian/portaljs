import dynamic from "next/dynamic";

const AlgoliaSearchProvider = dynamic(
  () => {
    return import("./Algolia").then((mod) => mod.AlgoliaSearchProvider);
  },
  { ssr: false }
);

const AlgoliaSearchContext = dynamic(
  () => {
    return import("./Algolia").then((mod) => mod.AlgoliaSearchContext.Consumer);
  },
  { ssr: false }
);

const KBarSearchProvider = dynamic(
  () => {
    return import("./KBar").then((mod) => mod.KBarSearchProvider);
  },
  { ssr: false }
);

const KBarContext = dynamic(
  async () => {
    return import("kbar").then((mod) => mod.KBarContext.Consumer);
  },
  { ssr: false }
);

export function SearchProvider({ searchConfig, children }) {
  switch (searchConfig?.provider) {
    case "algolia":
      return (
        <AlgoliaSearchProvider algoliaConfig={searchConfig.algoliaConfig}>
          {children}
        </AlgoliaSearchProvider>
      );
    case "kbar":
      return (
        <KBarSearchProvider kbarConfig={searchConfig.kbarConfig}>
          {children}
        </KBarSearchProvider>
      );
    default:
      return children;
  }
}

export function SearchContext(provider) {
  switch (provider) {
    case "algolia":
      return AlgoliaSearchContext;
    case "kbar":
      return KBarContext;
    default:
  }
}

export { SearchField } from "./SearchField";
