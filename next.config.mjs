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
  transpilePackages: ["@supabase/auth-helpers-nextjs"],
  // Ignorar completamente el directorio pages/
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].map(ext => `app.${ext}`),
}

export default nextConfig
