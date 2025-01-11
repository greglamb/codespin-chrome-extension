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
      },
    },
    target: "ES2022",
    sourcemap: true,
    cssCodeSplit: false,
    modulePreload: false,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".css"],
  },
});