/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration optimisée pour Node.js 22 et Next.js 15
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,

  // Configuration pour Next.js 15
  serverExternalPackages: ['@supabase/supabase-js'],
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Ajout pour résoudre le problème SIGABRT
    workerThreads: false,  // Désactive les worker threads
  },

  // Compiler optimisé
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },

  async redirects() {
    return [{ source: '/home', destination: '/', permanent: true }]
  },

  async rewrites() {
    if (process.env.BUILD_MODE === 'export') return []
    return [{ source: '/api/:path*', destination: '/api/:path*' }]
  },

  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://esignpro.ch',
    NEXT_PUBLIC_APP_NAME: 'eSignPro',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },


}

module.exports = nextConfig
