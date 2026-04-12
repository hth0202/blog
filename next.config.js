/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com' },
      { hostname: 's3.us-west-2.amazonaws.com' },
      { hostname: 's3-us-west-2.amazonaws.com' },
      { hostname: 'www.notion.so' },
      { hostname: 'picsum.photos' },
      { hostname: 'placehold.co' },
    ],
  },
};

module.exports = nextConfig;
