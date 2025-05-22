import { KBarProvider } from "kbar";

import { Portal } from "./KBarPortal";

export function KBarModal({ searchDocumentsPath, startingActions, children }) {
  return (
    <KBarProvider actions={startingActions}>
      <Portal searchDocumentsPath={searchDocumentsPath} />
      {children}
    </KBarProvider>
  );
}
