/** @type {import('next').NextConfig} */
const nextConfig = {
  // appDir is now stable in Next.js 15, no need for experimental flag
  typescript: {
    // Ignore TypeScript errors during build for faster development
    ignoreBuildErrors: false,
  },
  eslint: {
    // Ignore ESLint errors during build for faster development
    ignoreDuringBuilds: false,
  },
  // SWC minification is enabled by default in Next.js 15
  // Optimize bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
