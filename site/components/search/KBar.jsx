import Router from "next/router";

import { KBarModal } from "./KBarModal";

export function KBarSearchProvider({ kbarConfig, children }) {
  const defaultActions = kbarConfig?.defaultActions;
  const searchDocumentsPath = "search.json";

  let startingActions = [
    {
      id: "homepage",
      name: "Homepage",
      keywords: "",
      section: "Home",
      perform: () => Router.push("/"),
    },
  ];

  if (defaultActions && Array.isArray(defaultActions))
    startingActions = [...startingActions, ...defaultActions];

  return KBarModal ? (
    <KBarModal
      startingActions={startingActions}
      searchDocumentsPath={searchDocumentsPath}
    >
      {children}
    </KBarModal>
  ) : (
    children
  );
}
