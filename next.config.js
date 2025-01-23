/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images:{
    domains: ['cdn.tailgrids.com', 'placeimg.com', 'dummyimage.com']
  },
  experimental: {
    images: {
      allowFutureImage: true,
    },
  },
  cssModules: true,
}

module.exports = nextConfig
