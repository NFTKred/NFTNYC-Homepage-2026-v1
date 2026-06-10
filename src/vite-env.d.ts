/// <reference types="vite/client" />

// Injected at build time by vite.config.ts via `define`.
// Shown in the SiteFooter so we can verify which commit is live without
// guessing about CDN cache state.
declare const __BUILD_SHA__: string;
