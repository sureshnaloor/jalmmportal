/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // images:{
  //   domains: ['cdn.tailgrids.com', 'placeimg.com', 'dummyimage.com']
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.tailgrids.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placeimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dummyimage.com',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: [
      "@modelcontextprotocol/sdk",
      "mongodb-mcp-server",
    ],
  },

  // experimental: {
  //   images: {
  //     allowFutureImage: true,
  //   },
  // },
  // cssModules: true,
}

module.exports = nextConfig
