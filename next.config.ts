import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimizado para producción
  typescript: {
    ignoreBuildErrors: false, // Cambiado a false para producción
  },
  reactStrictMode: true, // Activado para mejor detección de problemas
  eslint: {
    ignoreDuringBuilds: false, // Cambiado a false para producción
  },
  // Optimizaciones de imágenes
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Compresión para producción
  compress: true,
  // Configuración de webpack optimizada
  webpack: (config, { dev, isServer }) => {
    // Solo en desarrollo, mantener la configuración existente
    if (dev) {
      config.watchOptions = {
        ignored: ['**/*'],
      };
    }
    
    // Optimizaciones para producción
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        'react/jsx-runtime.js': 'react/jsx-runtime',
        'react/jsx-dev-runtime.js': 'react/jsx-dev-runtime',
      });
    }
    
    return config;
  },
  // Headers de seguridad para producción
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
