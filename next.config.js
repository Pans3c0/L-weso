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
  // Aumenta el límite de tamaño del cuerpo de la petición para las Server Actions.
  // Esta es la forma correcta y centralizada de hacerlo.
  serverActions: {
    bodySizeLimit: '10mb',
  },
  
  allowedDevOrigins: [
    '*.cluster-lu4mup47g5gm4rtyvhzpwbfadi.cloudworkstations.dev',
  ],
};

module.exports = nextConfig;
