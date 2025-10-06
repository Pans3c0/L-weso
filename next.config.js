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
  serverActions: {
    bodySizeLimit: '10mb',
  },
  // This is needed to allow the Next.js dev server to accept requests from the
  // Firebase Studio preview URL.
  allowedDevOrigins: [
    '*.cluster-lu4mup47g5gm4rtyvhzpwbfadi.cloudworkstations.dev',
  ],

  async rewrites() {
    // In development, rewrite image requests to the local dev server.
    // This is useful when using a tunnel like ngrok.
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/images/:path*',
          destination: 'http://localhost:9002/images/:path*', // Assumes the dev server runs on port 9002
        },
      ];
    }
    // No rewrites in production
    return [];
  },
};

module.exports = nextConfig;
