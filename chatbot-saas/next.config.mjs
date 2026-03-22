/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"]
  },
  /** URLs antigas (antes de `app/auth/*`) → novas rotas */
  async redirects() {
    return [
      { source: '/login', destination: '/auth/login', permanent: true },
      { source: '/register', destination: '/auth/register', permanent: true },
      { source: '/forgot-password', destination: '/auth/forgot-password', permanent: true },
      { source: '/reset-password', destination: '/auth/reset-password', permanent: true },
      { source: '/verify-email', destination: '/auth/verify-email', permanent: true },
      { source: '/verify-email/confirm', destination: '/auth/verify-email/confirm', permanent: true },
      { source: '/termos-de-uso', destination: '/auth/termos-de-uso', permanent: true },
    ];
  },
};

export default nextConfig;
