import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Base path for deployment (empty for root, or set to repo name for GitHub Pages)
  base: process.env.BASE_PATH || '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // NOTE: there is deliberately no `manualChunks` here.
        //
        // A hand-rolled vendor-splitting function used to live in this file. It
        // stranded Rollup/Vite's shared helpers (`__vitePreload`, the CJS
        // interop helpers) inside lazily-used vendor chunks, so every chunk that
        // needed a helper had to import that vendor chunk — which forced three,
        // maplibre-gl and the PDF libs to be `modulepreload`ed on the homepage
        // even though nothing on the homepage uses them. Homepage eager JS was
        // ~1,083 KB gzip; with Rollup's default chunking it is ~286 KB, and each
        // heavy dependency now rides along with the lazy route that needs it
        // (three → NetworkContent, maplibre-gl → AdditiveMapContent, pdf →
        // PDFViewer). Do not reintroduce manualChunks without re-measuring
        // `dist/index.html`'s preload list.

        // Ensure JSON files are treated as assets, not modules
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.json')) {
            return 'translations/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    chunkSizeWarningLimit: 600,
    // Copy 404.html for GitHub Pages SPA routing
    copyPublicDir: true,
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'recharts'
      // three / @react-three/* deliberately omitted: they are dashboard-only
      // (NetworkGraph3D) and reach the browser via lazy chunks, so prebundling
      // them here only slows cold dev starts for the homepage.
    ],
    // Force Recharts to be pre-bundled to avoid initialization order issues
    esbuildOptions: {
      target: 'es2020',
    },
  },
}));
