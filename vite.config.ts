import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { execSync } from "child_process";
import { componentTagger } from "lovable-tagger";

// Build-time git SHA so we can verify which version is live in the
// browser without guessing at CDN cache state.
let __BUILD_SHA__ = "dev";
try {
  __BUILD_SHA__ = execSync("git rev-parse --short HEAD").toString().trim();
} catch {
  // not a git checkout (Vercel will set its own); leave as 'dev'
}
if (process.env.VERCEL_GIT_COMMIT_SHA) {
  __BUILD_SHA__ = process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __BUILD_SHA__: JSON.stringify(__BUILD_SHA__),
  },
}));
