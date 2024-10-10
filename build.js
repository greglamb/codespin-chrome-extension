import * as esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/index.ts", "src/main.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    platform: "browser",
    target: ["chrome58"],
    format: "iife",
    external: [],
    outdir: "./dist",
  })
  .catch(() => process.exit(1));
