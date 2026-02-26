/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable powered by header
  poweredByHeader: false,
  
  // Enable React strict mode
  reactStrictMode: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Optimize images
    unoptimized: false,
  },
  
  // Suppress Chrome DevTools 404 error
  async rewrites() {
    return [
      {
        source: '/.well-known/appspecific/:path*',
        destination: '/api/empty',
      },
    ]
  },
  
  // Headers for security and CORS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
    ]
  },
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Webpack configuration (only for development)
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
}

module.exports = nextConfig
