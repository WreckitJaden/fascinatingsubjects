import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Serve our logo at /favicon.ico so bookmarks and browsers get it instead of any default
      { source: "/favicon.ico", destination: "/newnewlogo.png" },
    ];
  },
};

export default nextConfig;
