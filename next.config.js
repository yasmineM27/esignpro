/** @type {import('next').NextConfig} */
const nextConfig = {
  // Désactiver la vérification TypeScript pour le build (temporaire)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Désactiver ESLint pour le build (temporaire)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuration pour le déploiement
  output: process.env.BUILD_MODE === 'export' ? 'export' : undefined,
  
  // Configuration des images pour l'export statique
  images: {
    unoptimized: process.env.BUILD_MODE === 'export' ? true : false,
  },
  
  // Configuration des chemins pour Infomaniak
  basePath: process.env.NODE_ENV === 'production' && process.env.BASE_PATH ? process.env.BASE_PATH : '',
  
  // Configuration des assets
  assetPrefix: process.env.NODE_ENV === 'production' && process.env.ASSET_PREFIX ? process.env.ASSET_PREFIX : '',
  
  // Configuration pour la production
  poweredByHeader: false,
  
  // Configuration pour l'hébergement statique
  trailingSlash: true,
  
  // Configuration des headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Configuration des redirections
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
  
  // Configuration des rewrites pour les APIs (si hébergement statique)
  async rewrites() {
    // Si export statique, pas de rewrites d'API
    if (process.env.BUILD_MODE === 'export') {
      return []
    }
    
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  
  // Variables d'environnement publiques
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://esignpro.ch',
    NEXT_PUBLIC_APP_NAME: 'eSignPro',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
  
  // Configuration expérimentale
  experimental: {
    // Optimisations pour la production (désactivé temporairement)
    // optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Configuration du compilateur
  compiler: {
    // Supprimer les console.log en production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
}

module.exports = nextConfig
