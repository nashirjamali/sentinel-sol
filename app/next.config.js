/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/app/market", destination: "/market" },
      { source: "/app/liquidity", destination: "/liquidity" },
    ];
  },
};

module.exports = nextConfig;
