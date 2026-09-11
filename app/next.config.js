/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    const extras = ["pino-pretty", "lokijs", "encoding"];
    if (Array.isArray(config.externals)) {
      config.externals.push(...extras);
    } else if (config.externals) {
      config.externals = [config.externals, ...extras];
    } else {
      config.externals = extras;
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { module: /node_modules\/ox\// },
      { module: /virtualMasterPool\.js/, message: /Critical dependency/ },
    ];
    return config;
  },
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
