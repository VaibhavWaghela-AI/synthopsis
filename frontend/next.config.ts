import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/workflows",
        destination: "/dashboard/workflows",
      },
      {
        source: "/agents",
        destination: "/dashboard/agents",
      },
      {
        source: "/inbox",
        destination: "/dashboard/inbox",
      },
      {
        source: "/analytics",
        destination: "/dashboard/analytics",
      },
      {
        source: "/workflow",
        destination: "/dashboard/workflows",
      },
      {
        source: "/agent",
        destination: "/dashboard/agents",
      },
    ];
  },
};

export default nextConfig;
