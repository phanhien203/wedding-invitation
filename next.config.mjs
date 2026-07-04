/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
