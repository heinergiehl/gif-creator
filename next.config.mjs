import path from 'path';
import { fileURLToPath } from 'url';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const baseConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'via.placeholder.com',
    },
    {
      protocol: 'https',
      hostname: 'heeczuugnxrlqpbhqbnj.supabase.co',
    },
    {
      protocol: 'https',
      hostname: 'supabase.com',
    },
    {
      protocol: 'https',
      hostname: 'supabase.co',
    }, {
      protocol: 'https',
      hostname: 'heeczuugnxrlqpbhqbnj.supabase.co',
    }, {
      protocol: 'https',
      hostname: 'pixabay.com',
    },
    ],
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
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // headers: async () => {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         { key: 'Cross-Origin-Isolated', value: 'true' },
  //         { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  //         { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
  //       ],
  //     },
  //   ]
  // },
  experimental: {
    reactCompiler: {
      reactCompiler: true,
    }
  }
}

export default function nextConfig(phase) {
  return {
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next' : '.next-build',
    ...baseConfig,
  };
}
