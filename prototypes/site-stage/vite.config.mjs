import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { quoteExportPath, quoteExportResponse } from "./worker/quote-export.js";

function quoteDownloads() {
  const middleware = (server) => { server.middlewares.use(async (request, response, next) => {
    const url = new URL(request.url, "http://localhost");
    if (url.pathname !== quoteExportPath) return next();
    const result = quoteExportResponse(new Request(url, { method: request.method }));
    response.statusCode = result.status;
    result.headers.forEach((value, key) => response.setHeader(key, value));
    response.end(Buffer.from(await result.arrayBuffer()));
  }); };
  return { name: "quote-downloads", configureServer: middleware, configurePreviewServer: middleware };
}

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react(), quoteDownloads()],
});
