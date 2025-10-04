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
  experimental: {
    // Increase the body size limit for Server Actions to allow larger file uploads.
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // This is needed to allow the Next.js dev server to accept requests from the
  // Firebase Studio preview URL.
  allowedDevOrigins: [
    '*.cluster-lu4mup47g5gm4rtyvhzpwbfadi.cloudworkstations.dev',
  ],

  async rewrites() {
    // En desarrollo, redirige las peticiones de imágenes al servidor de assets estáticos de Next.js
    // Esto es útil cuando se usa un túnel como ngrok.
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/images/:path*',
          destination: 'http://localhost:9002/images/:path*', // Asume que el servidor corre en el puerto 9002
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
