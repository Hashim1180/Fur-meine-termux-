import devServer from "@hono/vite-dev-server"
import path from "path"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig(({ command }) => ({
  plugins: [
    // The Hono dev server is now isolated. It will only run locally, preventing SSR build crashes.
    command === 'serve' ? devServer({ 
      entry: "api/boot.ts", 
      exclude: [/^\/(?!api\/).*$/],
      infer: []
    }) : null,
    react(),
  ],
  server: {
    port: 3000,
    host: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@db": path.resolve(__dirname, "./db"),
      "db": path.resolve(__dirname, "./db"),
    },
  },
  envDir: path.resolve(__dirname),
  build: {
    ssr: false, // Forcibly disable SSR targeting during Vite build
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-select'],
          'form-vendor': ['react-hook-form', 'zod', '@hookform/resolvers'],
        },
      },
    },
  },
}))
