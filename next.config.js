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
  // The body size limit is now handled by client-side compression,
  // so we don't need to fight with server configurations anymore.
  // This keeps the config clean and avoids environment-specific issues.
  
  allowedDevOrigins: [
    '*.cluster-lu4mup47g5gm4rtyvhzpwbfadi.cloudworkstations.dev',
  ],
};

module.exports = nextConfig;
