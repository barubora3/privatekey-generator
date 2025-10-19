import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        util: require.resolve('util'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
      };
    }

    return config;
  },
};

export default nextConfig;
