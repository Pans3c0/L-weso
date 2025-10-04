import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // This is needed to allow the Next.js dev server to accept requests from the
    // Firebase Studio preview URL.
    allowedDevOrigins: [
      '*.cluster-lu4mup47g5gm4rtyvhzpwbfadi.cloudworkstations.dev',
    ],
    // Increase the body size limit for Server Actions to allow larger file uploads.
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
