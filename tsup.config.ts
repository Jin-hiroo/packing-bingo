import { defineConfig } from "tsup";

export default defineConfig([
  {
    // npm package: React component (index) and framework-free core (core)
    entry: { index: "src/index.ts", core: "src/core.ts" },
    format: ["esm", "cjs"],
    dts: true,
    target: "es2020",
    external: ["react"],
    // Lets Next.js App Router (Server Components) import the component directly.
    banner: { js: '"use client";' },
  },
  {
    // Browser bundle that the standalone index.html inlines (global: PackingBingo)
    entry: { "packing-bingo": "src/core.ts" },
    format: ["iife"],
    globalName: "PackingBingo",
    target: "es2020",
    minify: true,
    outExtension: () => ({ js: ".global.js" }),
  },
]);
