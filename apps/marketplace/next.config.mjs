import withNextIntl from 'next-intl/plugin';

const withNextIntlConfig = withNextIntl();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@workspace/ui', '@workspace/db', '@workspace/core'],
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default withNextIntlConfig(nextConfig);
