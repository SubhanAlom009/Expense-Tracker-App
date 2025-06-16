/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["randomuser.me"],
  },

  experimental:{
    serverActions:{
      bodySizeLimit: '5mb', // Increase the body size limit for server actions
    }
  }
};

export default nextConfig;
