import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
  },
  // Question bank JSON files and auth data are read at runtime via fs,
  // so include them explicitly in the serverless output trace for Vercel.
  outputFileTracingIncludes: {
    "/**": [
      "./src/data/question-bank/subjects/*.json",
      "./src/data/auth/*.json",
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
