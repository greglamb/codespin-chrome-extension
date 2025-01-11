import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/main.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        format: "es",
        dir: "dist",
        manualChunks: () => "main", // Force everything into a single chunk
        minifyInternalExports: false
      },
    },
    target: "ES2022",
    sourcemap: true,
    cssCodeSplit: false,
    modulePreload: false,
    minify: false,
    terserOptions: {
      mangle: false,
      compress: false,
      format: {
        comments: true,
        beautify: true
      }
    }
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".css"],
  },
});