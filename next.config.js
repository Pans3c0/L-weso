/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // La configuración para el límite de tamaño del cuerpo de las Server Actions
  // debe estar dentro del objeto `experimental` para ser reconocida por esta versión de Next.js.
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Esta es la forma correcta de permitir orígenes de desarrollo.
  // Ya no está en `experimental`.
  allowedDevOrigins: [
    '*.cluster-lu4mup47g5gm4rtyvhzpwbfadi.cloudworkstations.dev',
  ],

  async rewrites() {
    // En desarrollo, redirige las peticiones de imágenes al servidor de assets estáticos de Next.js
    // Esto es crucial para que ngrok funcione correctamente.
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/images/:path*',
          destination: 'http://localhost:9002/images/:path*', // Asume que el servidor de desarrollo corre en el puerto 9002
        },
      ];
    }
    // No se necesitan redirecciones en producción
    return [];
  },
};

module.exports = nextConfig;
