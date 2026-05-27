import nextra from 'nextra'

const withNextra = nextra({
  search: true,
  contentDirBasePath: '/docs',
})

/** @type {import('next').NextConfig} */
const nextConfig = withNextra({
  transpilePackages: ['@fieldkit/form-schema'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ],
  },
})

export default nextConfig
