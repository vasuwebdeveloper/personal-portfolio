import type { NextConfig } from "next";

/**
 * Static export configuration.
 *
 * To extend this site with a Node.js backend later, remove `output: "export"`
 * (and optionally `images.unoptimized`); see "Extending to Node.js + Database"
 * in README.md. Nothing else in the app assumes static-only behavior.
 */
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: "/stats/:path*",
        destination: "https://cloud.umami.is/:path*",
      },
    ];
  },
};

export default nextConfig;
