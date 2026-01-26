/** @type {import('next').NextConfig} */
const nextConfig = {
  devServer: {
    allowedDevOrigins: [
      'shahwul.duckdns.org',
      'http://shahwul.duckdns.org',
      'https://shahwul.duckdns.org',
    ],
  },
};

export default nextConfig;
