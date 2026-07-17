import { server } from "typescript";

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placeholder.svg',
      }
    ],
    unoptimized: true,
  },
}

export default nextConfig;
