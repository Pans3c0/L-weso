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
  // La configuración de serverActions en el nivel superior es la forma correcta
  // para que sea reconocida por el servidor de producción 'next start'.
  serverActions: {
    bodySizeLimit: '10mb',
  },
  allowedDevOrigins: [
    '*.cluster-lu4mup47g5gm4rtyvhzpwbfadi.cloudworkstations.dev',
  ],
};

module.exports = nextConfig;
