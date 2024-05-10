/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pixabay.com', 'cdn.pixabay.com', 'localhost', 'via.placeholder.com'],
  },
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      bufferutil: 'commonjs bufferutil',
      canvas: 'commonjs canvas',
    })
    return config
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Isolated', value: 'true' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ]
  },
}
export default nextConfig
