import * as esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: "dist/main.js",
    platform: "browser",
    target: ["chrome58"],
    format: "iife",
    external: [],
  })
  .catch(() => process.exit(1));
