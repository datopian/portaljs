import typescript from "rollup-plugin-typescript2";
import ts from "typescript";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.esm.js",
      format: "es",
    },
    {
      file: "dist/index.cjs.js",
      format: "cjs",
    },
  ],
  // Pass this package's own TypeScript explicitly: rpt2 is hoisted to the
  // workspace root, where a bare require("typescript") resolves the root's
  // older TypeScript instead of the version declared here.
  plugins: [nodeResolve(), commonjs(), typescript({ typescript: ts })],
};
