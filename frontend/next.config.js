/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx'],
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
