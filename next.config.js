/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false
    
    // Reduce bundle size for serverless
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        'sharp': 'commonjs sharp',
        'pdfjs-dist': 'commonjs pdfjs-dist',
      })
    }
    
    return config
  },
}

module.exports = nextConfig
