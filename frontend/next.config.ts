import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "localhost",
      },
    ],
  },

  output: "standalone",

  // Note: Les rewrites Next.js ne supportent PAS les WebSockets en production
  // Les connexions WebSocket se font directement vers le backend:8000
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://backend:8000/api/:path*',
  //     },
  //   ];
  // },

  // Désactivé temporairement pour éviter les conflits
  // async redirects() {
  //   return [
  //     {
  //       source: "/django-admin",
  //       destination: "https://localhost:3000/admin",
  //       permanent: true,
  //     },
  //   ];
  // },
};

export default nextConfig;
