import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    // Proxy API calls to backend so we don't have to write full URLs
    // Instead of fetch('http://localhost:4000/api/...')
    // we can just write fetch('/api/...')
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
