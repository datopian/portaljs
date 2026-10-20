// Allow side-effect imports of stylesheets. TypeScript 6 (with
// moduleResolution: "bundler") requires a module declaration for these;
// Next.js handles the actual bundling.
declare module "*.css";
declare module "*.scss";
declare module "*.sass";

// Google Analytics' gtag, loaded by the script in pages/_app.tsx. This global
// used to come from @portaljs/core's type declarations.
interface Window {
  gtag?: (...args: any[]) => void;
}
