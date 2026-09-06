/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      "/api/**/*": ["./prisma/dev.db"],
      "/**/*": ["./prisma/dev.db"],
    },
  },
};

export default nextConfig;
