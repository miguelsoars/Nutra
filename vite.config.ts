import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

// NOTE:
// - GitHub Pages serves your app from a subpath: https://<user>.github.io/<repo>/
// - So we set `base` to '/<repo>/' in production builds.
// - For local dev, keep it as '/'.
const GITHUB_REPO_NAME = 'NutraScan-App';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');

  return {
    base: mode === 'production' ? `/${GITHUB_REPO_NAME}/` : '/',
    plugins: [react(), tailwindcss()],
    define: {
      // Exposes the key at build-time. For Netlify, set GEMINI_API_KEY in the environment variables.
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
