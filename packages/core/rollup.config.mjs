import { createRequire } from "node:module";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

// Externalize every declared dependency and peerDependency (plus their
// subpaths), so React, mermaid, framer-motion, etc. are never bundled.
const externalNames = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];
const externalRegex = new RegExp(`^(${externalNames.join("|")})(/.*)?$`);

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "es",
    sourcemap: true,
    // Keep a single ESM bundle (matches the package.json "module" field and
    // the previous nx output). Internal dynamic imports are inlined.
    inlineDynamicImports: true,
  },
  external: (id) => externalRegex.test(id),
  plugins: [
    nodeResolve({ extensions: [".ts", ".tsx", ".js", ".jsx"] }),
    commonjs(),
    typescript({
      tsconfig: "tsconfig.lib.json",
      declaration: true,
      declarationDir: "dist",
      rootDir: ".",
    }),
  ],
};
