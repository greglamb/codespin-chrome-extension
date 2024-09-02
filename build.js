import * as esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: "dist/main.js",
    platform: "browser",
    target: ["chrome58"],
    format: "iife",
  })
  .catch(() => process.exit(1));
