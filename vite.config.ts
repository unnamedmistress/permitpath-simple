import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { apiMiddleware } from "./vite-plugins/api-middleware";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    cors: {
      origin: (origin, callback) => {
        const allowedOrigins = [
          /^https:\/\/.*\.permitpath\.app$/,
          /localhost:/,
        ];
        
        if (!origin || allowedOrigins.some(rx => rx.test(origin))) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    },
  },
  esbuild: {
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
  },
  plugins: [
    react(),
    apiMiddleware(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
