import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next writes agent instruction files of its own otherwise, and this
  // repository is allowed exactly one markdown file: README.md.
  agentRules: false,
  images: {
    formats: ["image/webp"],
  },
};

export default nextConfig;
