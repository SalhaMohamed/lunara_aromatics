/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Hii inaruhusu picha kutoka website yoyote
      },
    ],
  },
};

export default nextConfig;