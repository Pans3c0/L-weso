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
  // La configuración de serverActions en next.config.js es inconsistente entre versiones
  // y en este caso no está funcionando. Se elimina para evitar confusión.
  // El límite se configura directamente en la ruta API de subida.
  
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
