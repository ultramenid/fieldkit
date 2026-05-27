/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fieldkit/form-schema'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ],
  },
}

export default nextConfig
