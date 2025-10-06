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
  
  allowedDevOrigins: [
    '*.cluster-lu4mup47g5gm4rtyvhzpwbfadi.cloudworkstations.dev',
  ],
};

module.exports = nextConfig;
