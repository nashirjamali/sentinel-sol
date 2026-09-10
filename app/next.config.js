/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [{ source: "/connect", destination: "/app/market", permanent: false }];
  },
  async rewrites() {
    return [
      { source: "/app/market", destination: "/market" },
      { source: "/app/liquidity", destination: "/liquidity" },
    ];
  },
};

module.exports = nextConfig;
