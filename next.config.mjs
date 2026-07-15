/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Ảnh upload nằm trên Cloudinary; next/image chặn host lạ nếu không khai báo.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
  // Thiệp từng nằm ở /client. Link đã gửi cho khách vẫn phải sống — Next tự
  // mang theo query nên ?to=<slug> không mất.
  async redirects() {
    return [{ source: "/client", destination: "/", permanent: true }];
  },
};

export default nextConfig;
