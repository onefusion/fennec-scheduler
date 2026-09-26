const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // @libsql/client is only used as a local-dev SQLite fallback (see src/lib/db.ts);
    // in the Cloudflare Workers build D1 is always bound, so drop it from that bundle
    // to avoid its broken "workerd" export condition breaking the OpenNext esbuild pass.
    if (isServer && process.env.NEXT_PRIVATE_STANDALONE === 'true') {
      config.resolve.alias['@libsql/client'] = false;
    }
    return config;
  },
};

module.exports = nextConfig;
