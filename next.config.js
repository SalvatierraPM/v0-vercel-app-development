/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: [],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Evitar que next/headers se importe en el directorio pages/
    if (!isServer) {
      config.resolve.alias["next/headers"] = require.resolve("./lib/headers-mock.js")
    }
    return config
  },
}

module.exports = nextConfig
