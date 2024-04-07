/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["pixabay.com", "cdn.pixabay.com", "localhost"],
  },
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
      canvas: "commonjs canvas",
    })
    return config
  },
}
export default nextConfig
