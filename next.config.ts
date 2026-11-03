import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Question bank JSON files are read at runtime via fs (path marked turbopackIgnore),
  // so include them explicitly in the serverless output trace for Vercel.
  outputFileTracingIncludes: {
    "/**": ["./src/data/question-bank/subjects/*.json"],
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
