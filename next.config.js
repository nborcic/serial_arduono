/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude serialport from webpack bundling on server side
      config.externals.push({
        serialport: "commonjs serialport",
      });
    }
    return config;
  },
};

module.exports = nextConfig;
