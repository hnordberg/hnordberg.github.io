import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root so the bundler always resolves modules from this
  // project's node_modules, not an inferred parent directory.
  turbopack: { root: __dirname },
  images: {
    unoptimized: true,
  },
  // Static export is only used for the GitHub Pages production build.
  // In `next dev` we want a real Node server so the local /ml/wiki/review
  // tool can use route handlers and read JSON via fs at request time.
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
};

export default nextConfig;